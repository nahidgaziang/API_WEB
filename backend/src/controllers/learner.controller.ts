import { Response, Request } from 'express';
import { Course, Enrollment, Certificate, BankAccount, CourseMaterial, User, Transaction } from '../models';
import { AuthRequest } from '../middleware/auth';
import { generateCertificateCode } from '../utils/helpers';
import { config } from '../config/config';
import sequelize from '../config/database';
export const getAllCourses = async (req: Request, res: Response): Promise<void> => {
    try {
        const courses = await Course.findAll({
            where: { status: 'active' },
            include: [
                {
                    model: User,
                    as: 'instructor',
                    attributes: ['id', 'full_name', 'username'],
                },
            ],
        });
        res.status(200).json({
            success: true,
            data: courses,
        });
    } catch (error: any) {
        console.error('Get courses error:', error);
        res.status(500).json({ success: false, message: 'Failed to get courses', error: error.message });
    }
};
export const enrollInCourse = async (req: AuthRequest, res: Response): Promise<void> => {
    const transaction = await sequelize.transaction();
    try {
        const userId = req.user?.id;
        const { course_id, secret } = req.body;
        if (!course_id || !secret) {
            await transaction.rollback();
            res.status(400).json({ success: false, message: 'Course ID and secret are required' });
            return;
        }
        const existingEnrollment = await Enrollment.findOne({
            where: { learner_id: userId, course_id },
        });
        if (existingEnrollment) {
            await transaction.rollback();
            res.status(409).json({ success: false, message: 'Already enrolled in this course' });
            return;
        }
        const course = await Course.findByPk(course_id);
        if (!course) {
            await transaction.rollback();
            res.status(404).json({ success: false, message: 'Course not found' });
            return;
        }
        const learnerBank = await BankAccount.findOne({
            where: { user_id: userId },
            lock: transaction.LOCK.UPDATE,
            transaction,
        });
        if (!learnerBank) {
            await transaction.rollback();
            res.status(404).json({ success: false, message: 'Bank account not found. Please setup your bank account first.' });
            return;
        }
        if (secret !== learnerBank.secret) {
            await transaction.rollback();
            res.status(401).json({ success: false, message: 'Invalid bank secret' });
            return;
        }
        const price = parseFloat(course.price.toString());
        if (parseFloat(learnerBank.balance.toString()) < price) {
            await transaction.rollback();
            res.status(400).json({ success: false, message: 'Insufficient balance' });
            return;
        }
        const lmsBank = await BankAccount.findOne({
            where: { account_number: config.lms.accountNumber },
            lock: transaction.LOCK.UPDATE,
            transaction,
        });
        if (!lmsBank) {
            await transaction.rollback();
            res.status(500).json({ success: false, message: 'LMS bank account not found' });
            return;
        }
        learnerBank.balance = parseFloat(learnerBank.balance.toString()) - price;
        lmsBank.balance = parseFloat(lmsBank.balance.toString()) + price;
        await learnerBank.save({ transaction });
        await lmsBank.save({ transaction });
        const enrollment = await Enrollment.create(
            {
                learner_id: userId!,
                course_id,
                status: 'pending',
            },
            { transaction }
        );
        await Transaction.create(
            {
                from_account: learnerBank.account_number,
                to_account: lmsBank.account_number,
                amount: price,
                transaction_type: 'course_purchase',
                reference_id: course_id,
                status: 'completed',
                completed_at: new Date(),
            },
            { transaction }
        );
        const instructorBank = await BankAccount.findOne({
            where: { user_id: course.instructor_id },
            transaction,
        });
        if (instructorBank) {
            await Transaction.create(
                {
                    from_account: lmsBank.account_number,
                    to_account: instructorBank.account_number,
                    amount: price,
                    transaction_type: 'instructor_payment',
                    reference_id: course_id,
                    status: 'pending',
                },
                { transaction }
            );
        }
        await transaction.commit();
        res.status(201).json({
            success: true,
            message: 'Enrollment successful',
            data: {
                enrollment_id: enrollment.id,
                course_id: course.id,
                course_title: course.title,
                amount_paid: price,
                new_balance: learnerBank.balance,
            },
        });
    } catch (error: any) {
        await transaction.rollback();
        console.error('Enrollment error:', error);
        res.status(500).json({ success: false, message: 'Enrollment failed', error: error.message });
    }
};
export const getMyEnrollments = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const enrollments = await Enrollment.findAll({
            where: { learner_id: userId },
            include: [
                {
                    model: Course,
                    as: 'course',
                    include: [
                        {
                            model: User,
                            as: 'instructor',
                            attributes: ['id', 'full_name'],
                        },
                    ],
                },
                {
                    model: Certificate,
                    as: 'certificate',
                    required: false,
                },
            ],
        });
        res.status(200).json({
            success: true,
            data: enrollments,
        });
    } catch (error: any) {
        console.error('Get enrollments error:', error);
        res.status(500).json({ success: false, message: 'Failed to get enrollments', error: error.message });
    }
};
export const getCourseMaterials = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const { courseId } = req.params;
        const enrollment = await Enrollment.findOne({
            where: { learner_id: userId, course_id: courseId },
        });
        if (!enrollment) {
            res.status(403).json({ success: false, message: 'You must enroll in this course first' });
            return;
        }
        if (enrollment.status === 'pending') {
            res.status(403).json({ success: false, message: 'Course not yet available. Awaiting instructor to validate payment.' });
            return;
        }
        const materials = await CourseMaterial.findAll({
            where: { course_id: courseId },
            order: [['order_index', 'ASC']],
        });
        res.status(200).json({
            success: true,
            data: materials,
        });
    } catch (error: any) {
        console.error('Get materials error:', error);
        res.status(500).json({ success: false, message: 'Failed to get materials', error: error.message });
    }
};
export const completeCourse = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const { course_id } = req.body;
        const enrollment = await Enrollment.findOne({
            where: { learner_id: userId, course_id },
            include: [{ model: Course, as: 'course' }],
        });
        if (!enrollment) {
            res.status(404).json({ success: false, message: 'Enrollment not found' });
            return;
        }
        if (enrollment.status === 'pending') {
            res.status(400).json({ success: false, message: 'Cannot complete course. Payment has not been validated by instructor yet.' });
            return;
        }
        if (enrollment.status === 'completed') {
            res.status(400).json({ success: false, message: 'Course already completed' });
            return;
        }
        enrollment.status = 'completed';
        enrollment.completion_date = new Date();
        await enrollment.save();
        const certificateCode = generateCertificateCode();
        const certificate = await Certificate.create({
            enrollment_id: enrollment.id,
            certificate_code: certificateCode,
        });
        res.status(200).json({
            success: true,
            message: 'Course completed successfully',
            data: {
                enrollment,
                certificate: {
                    id: certificate.id,
                    code: certificate.certificate_code,
                    issue_date: certificate.issue_date,
                },
            },
        });
    } catch (error: any) {
        console.error('Complete course error:', error);
        res.status(500).json({ success: false, message: 'Failed to complete course', error: error.message });
    }
};
export const getMyCertificates = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const certificates = await Certificate.findAll({
            include: [
                {
                    model: Enrollment,
                    as: 'enrollment',
                    where: { learner_id: userId },
                    include: [
                        {
                            model: Course,
                            as: 'course',
                            attributes: ['id', 'title'],
                        },
                        {
                            model: User,
                            as: 'learner',
                            attributes: ['id', 'full_name'],
                        },
                    ],
                },
            ],
        });
        res.status(200).json({
            success: true,
            data: certificates,
        });
    } catch (error: any) {
        console.error('Get certificates error:', error);
        res.status(500).json({ success: false, message: 'Failed to get certificates', error: error.message });
    }
};
export const topUpBalance = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const { amount, secret } = req.body;
        if (!amount || !secret) {
            res.status(400).json({ success: false, message: 'Amount and bank secret are required' });
            return;
        }
        const topupAmount = parseFloat(amount);
        if (isNaN(topupAmount) || topupAmount <= 0 || topupAmount > 100000) {
            res.status(400).json({ success: false, message: 'Amount must be between 1 and 100,000 Tk' });
            return;
        }
        const bankAccount = await BankAccount.findOne({ where: { user_id: userId } });
        if (!bankAccount) {
            res.status(404).json({ success: false, message: 'Bank account not found' });
            return;
        }
        if (secret !== bankAccount.secret) {
            res.status(401).json({ success: false, message: 'Invalid bank secret' });
            return;
        }
        bankAccount.balance = parseFloat(bankAccount.balance.toString()) + topupAmount;
        await bankAccount.save();
        await Transaction.create({
            from_account: 'EXTERNAL',
            to_account: bankAccount.account_number,
            amount: topupAmount,
            transaction_type: 'topup' as any,
            reference_id: userId!,
            status: 'completed',
            completed_at: new Date(),
        });
        res.status(200).json({
            success: true,
            message: `Successfully topped up ${topupAmount.toFixed(2)} Tk`,
            data: {
                new_balance: bankAccount.balance,
                account_number: bankAccount.account_number,
            },
        });
    } catch (error: any) {
        console.error('Top up error:', error);
        res.status(500).json({ success: false, message: 'Top up failed', error: error.message });
    }
};
