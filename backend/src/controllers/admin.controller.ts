import { Response } from 'express';
import { User, Course, Enrollment, BankAccount, CourseMaterial, Transaction, Topic } from '../models';
import { AuthRequest } from '../middleware/auth';
import sequelize from '../config/database';
import { config } from '../config/config';
import { Op } from 'sequelize';
export const getInstructorStats = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const instructors = await User.findAll({
            where: { role: 'instructor' },
            attributes: ['id', 'full_name', 'username', 'email'],
            include: [
                {
                    model: Course,
                    as: 'courses',
                    attributes: ['id', 'title', 'price', 'status', 'upload_payment'],
                    include: [
                        {
                            model: Enrollment,
                            as: 'enrollments',
                            attributes: ['id', 'status'],
                        },
                        {
                            model: CourseMaterial,
                            as: 'materials',
                            attributes: ['id', 'type'],
                        },
                    ],
                },
                {
                    model: BankAccount,
                    as: 'bank_account',
                    attributes: ['account_number', 'balance'],
                },
            ],
        });
        const result = instructors.map((instructor: any) => {
            const courses = instructor.courses || [];
            const totalLearners = courses.reduce((sum: number, course: any) => {
                return sum + (course.enrollments ? course.enrollments.length : 0);
            }, 0);
            const activeLearners = courses.reduce((sum: number, course: any) => {
                const active = (course.enrollments || []).filter(
                    (e: any) => e.status === 'enrolled' || e.status === 'in_progress' || e.status === 'completed'
                );
                return sum + active.length;
            }, 0);
            return {
                id: instructor.id,
                full_name: instructor.full_name,
                username: instructor.username,
                email: instructor.email,
                bank_account: instructor.bank_account || null,
                total_courses: courses.length,
                total_learners: totalLearners,
                active_learners: activeLearners,
                courses: courses.map((course: any) => ({
                    id: course.id,
                    title: course.title,
                    price: course.price,
                    status: course.status,
                    upload_payment: course.upload_payment,
                    learner_count: (course.enrollments || []).length,
                    material_count: (course.materials || []).length,
                    material_types: [...new Set((course.materials || []).map((m: any) => m.type))],
                })),
            };
        });
        res.status(200).json({ success: true, data: result });
    } catch (error: any) {
        console.error('Get instructor stats error:', error);
        res.status(500).json({ success: false, message: 'Failed to get instructor stats', error: error.message });
    }
};
export const getLmsBalance = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const lmsBank = await BankAccount.findOne({
            where: { account_number: config.lms.accountNumber },
        });
        if (!lmsBank) {
            res.status(404).json({ success: false, message: 'LMS bank account not found' });
            return;
        }
        res.status(200).json({
            success: true,
            data: {
                account_number: lmsBank.account_number,
                balance: parseFloat(lmsBank.balance.toString()),
            },
        });
    } catch (error: any) {
        console.error('Get LMS balance error:', error);
        res.status(500).json({ success: false, message: 'Failed to get LMS balance', error: error.message });
    }
};
export const getSystemStats = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const totalCourses = await Course.count();
        const totalLearners = await User.count({ where: { role: 'learner' } });
        const totalInstructors = await User.count({ where: { role: 'instructor' } });
        const totalEnrollments = await Enrollment.count();
        const pendingEnrollments = await Enrollment.count({ where: { status: 'pending' } });
        const completedEnrollments = await Enrollment.count({ where: { status: 'completed' } });
        const lmsBank = await BankAccount.findOne({
            where: { account_number: config.lms.accountNumber },
            attributes: ['balance', 'account_number'],
        });
        const recentTransactions = await Transaction.findAll({
            order: [['created_at', 'DESC']],
            limit: 10,
        });
        res.status(200).json({
            success: true,
            data: {
                total_courses: totalCourses,
                course_slots_remaining: 5 - totalCourses,
                total_learners: totalLearners,
                total_instructors: totalInstructors,
                total_enrollments: totalEnrollments,
                pending_enrollments: pendingEnrollments,
                completed_enrollments: completedEnrollments,
                lms_bank: lmsBank
                    ? {
                        account_number: lmsBank.account_number,
                        balance: parseFloat(lmsBank.balance.toString()),
                    }
                    : null,
                recent_transactions: recentTransactions,
            },
        });
    } catch (error: any) {
        console.error('Get system stats error:', error);
        res.status(500).json({ success: false, message: 'Failed to get system stats', error: error.message });
    }
};
export const getAllTransactions = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const transactions = await Transaction.findAll({
            order: [['created_at', 'DESC']],
            limit: 50,
        });
        res.status(200).json({ success: true, data: transactions });
    } catch (error: any) {
        console.error('Get all transactions error:', error);
        res.status(500).json({ success: false, message: 'Failed to get transactions', error: error.message });
    }
};
export const addTopic = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name, description } = req.body;
        if (!name) {
            res.status(400).json({ success: false, message: 'Topic name is required' });
            return;
        }
        const existingTopic = await Topic.findOne({ where: { name } });
        if (existingTopic) {
            res.status(409).json({ success: false, message: 'Topic already exists' });
            return;
        }
        const topic = await Topic.create({
            name,
            description: description || null,
            is_active: true,
        });
        res.status(201).json({ success: true, message: 'Topic created successfully', data: topic });
    } catch (error: any) {
        console.error('Add topic error:', error);
        res.status(500).json({ success: false, message: 'Failed to add topic', error: error.message });
    }
};
export const addInstructor = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { username, email, password, full_name } = req.body;
        if (!username || !email || !password || !full_name) {
            res.status(400).json({ success: false, message: 'All fields are required' });
            return;
        }
        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
            res.status(409).json({ success: false, message: 'Username already exists' });
            return;
        }
        const existingEmail = await User.findOne({ where: { email } });
        if (existingEmail) {
            res.status(409).json({ success: false, message: 'Email already registered' });
            return;
        }
        const user = await User.create({
            username,
            email,
            password: password,
            role: 'instructor',
            full_name,
        });
        res.status(201).json({
            success: true,
            message: 'Instructor created successfully',
            data: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                full_name: user.full_name,
            },
        });
    } catch (error: any) {
        console.error('Add instructor error:', error);
        res.status(500).json({ success: false, message: 'Failed to add instructor', error: error.message });
    }
};
export const deleteTopic = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const topic = await Topic.findByPk(id);
        if (!topic) {
            res.status(404).json({ success: false, message: 'Topic not found' });
            return;
        }
        await topic.update({ is_active: false });
        res.status(200).json({ success: true, message: 'Topic deactivated successfully' });
    } catch (error: any) {
        console.error('Delete topic error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete topic', error: error.message });
    }
};
export const deleteInstructor = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const instructor = await User.findOne({ where: { id, role: 'instructor' } });
        if (!instructor) {
            res.status(404).json({ success: false, message: 'Instructor not found' });
            return;
        }
        await instructor.destroy();
        res.status(200).json({ success: true, message: 'Instructor removed successfully' });
    } catch (error: any) {
        console.error('Delete instructor error:', error);
        res.status(500).json({ success: false, message: 'Failed to remove instructor', error: error.message });
    }
};
