import { Response, Request } from 'express';
import { Course, Enrollment, Certificate, BankAccount, CourseMaterial, User, Transaction } from '../models';
import { AuthRequest } from '../middleware/auth';
import { generateCertificateCode } from '../utils/helpers';
import { config } from '../config/config';
import sequelize from '../config/database';

// Get all courses
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

// Enroll in a course (purchase)
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

        // Check if already enrolled
        const existingEnrollment = await Enrollment.findOne({
            where: { learner_id: userId, course_id },
        });

        if (existingEnrollment) {
            await transaction.rollback();
            res.status(409).json({ success: false, message: 'Already enrolled in this course' });
            return;
        }

        // Get course details
        const course = await Course.findByPk(course_id);
        if (!course) {
            await transaction.rollback();
            res.status(404).json({ success: false, message: 'Course not found' });
            return;
        }

        // Get learner's bank account
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

        // Verify bank secret (plain text comparison)
        if (secret !== learnerBank.secret) {
            await transaction.rollback();
            res.status(401).json({ success: false, message: 'Invalid bank secret' });
            return;
        }

        // Check balance
        const price = parseFloat(course.price.toString());
        if (parseFloat(learnerBank.balance.toString()) < price) {
            await transaction.rollback();
            res.status(400).json({ success: false, message: 'Insufficient balance' });
            return;
        }

        // Get LMS organization bank account
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

        // Process payment
        learnerBank.balance = parseFloat(learnerBank.balance.toString()) - price;
        lmsBank.balance = parseFloat(lmsBank.balance.toString()) + price;

        await learnerBank.save({ transaction });
        await lmsBank.save({ transaction });

        // Create enrollment
        const enrollment = await Enrollment.create(
            {
                learner_id: userId!,
                course_id,
                status: 'enrolled',
            },
            { transaction }
        );

        // Create transaction record
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

// Get my enrolled courses
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

// Get course materials (only if enrolled)
export const getCourseMaterials = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const { courseId } = req.params;

        // Check if enrolled
        const enrollment = await Enrollment.findOne({
            where: { learner_id: userId, course_id: courseId },
        });

        if (!enrollment) {
            res.status(403).json({ success: false, message: 'You must enroll in this course first' });
            return;
        }

        // Get materials
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

// Complete a course and get certificate
export const completeCourse = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const { course_id } = req.body;

        // Find enrollment
        const enrollment = await Enrollment.findOne({
            where: { learner_id: userId, course_id },
            include: [{ model: Course, as: 'course' }],
        });

        if (!enrollment) {
            res.status(404).json({ success: false, message: 'Enrollment not found' });
            return;
        }

        if (enrollment.status === 'completed') {
            res.status(400).json({ success: false, message: 'Course already completed' });
            return;
        }

        // Update enrollment
        enrollment.status = 'completed';
        enrollment.completion_date = new Date();
        await enrollment.save();

        // Generate certificate
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

// Get my certificates
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
