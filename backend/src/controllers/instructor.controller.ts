import { Response } from 'express';
import { Course, CourseMaterial, BankAccount, Transaction, User } from '../models';
import { AuthRequest } from '../middleware/auth';
import { config } from '../config/config';
import sequelize from '../config/database';

export const uploadCourse = async (req: AuthRequest, res: Response): Promise<void> => {
    const transaction = await sequelize.transaction();

    try {
        const instructorId = req.user?.id;
        const { title, description, price, upload_payment } = req.body;

        if (!title || !price || !upload_payment) {
            await transaction.rollback();
            res.status(400).json({ success: false, message: 'Title, price, and upload_payment are required' });
            return;
        }

        const totalCourses = await Course.count();
        if (totalCourses >= 5) {
            await transaction.rollback();
            res.status(400).json({
                success: false,
                message: 'System limit reached. Maximum 5 courses allowed in the LMS.'
            });
            return;
        }

        const course = await Course.create(
            {
                title,
                description: description || '',
                instructor_id: instructorId!,
                price,
                upload_payment,
                status: 'active',
            },
            { transaction }
        );

        const instructorBank = await BankAccount.findOne({
            where: { user_id: instructorId },
            lock: transaction.LOCK.UPDATE,
            transaction,
        });

        if (!instructorBank) {
            await transaction.rollback();
            res.status(404).json({ success: false, message: 'Instructor bank account not found' });
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

        const uploadAmt = parseFloat(upload_payment);
        if (parseFloat(lmsBank.balance.toString()) < uploadAmt) {
            await transaction.rollback();
            res.status(400).json({ success: false, message: 'LMS has insufficient balance to pay upload fee' });
            return;
        }

        lmsBank.balance = parseFloat(lmsBank.balance.toString()) - uploadAmt;
        instructorBank.balance = parseFloat(instructorBank.balance.toString()) + uploadAmt;

        await lmsBank.save({ transaction });
        await instructorBank.save({ transaction });

        await Transaction.create(
            {
                from_account: lmsBank.account_number,
                to_account: instructorBank.account_number,
                amount: uploadAmt,
                transaction_type: 'upload_payment',
                reference_id: course.id,
                status: 'completed',
                completed_at: new Date(),
            },
            { transaction }
        );

        await transaction.commit();

        res.status(201).json({
            success: true,
            message: 'Course uploaded successfully and payment received',
            data: {
                course,
                payment_received: uploadAmt,
                new_balance: instructorBank.balance,
            },
        });
    } catch (error: any) {
        await transaction.rollback();
        console.error('Upload course error:', error);
        res.status(500).json({ success: false, message: 'Failed to upload course', error: error.message });
    }
};

export const uploadMaterial = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const instructorId = req.user?.id;
        const { course_id, title, type, content, file_url, order_index } = req.body;

        if (!course_id || !title || !type) {
            res.status(400).json({ success: false, message: 'Course ID, title, and type are required' });
            return;
        }

        if (!['text', 'audio', 'video', 'mcq'].includes(type)) {
            res.status(400).json({ success: false, message: 'Invalid material type' });
            return;
        }

        const course = await Course.findOne({
            where: { id: course_id, instructor_id: instructorId },
        });

        if (!course) {
            res.status(404).json({ success: false, message: 'Course not found or you are not the instructor' });
            return;
        }

        const material = await CourseMaterial.create({
            course_id,
            title,
            type,
            content: content || null,
            file_url: file_url || null,
            order_index: order_index || 0,
        });

        res.status(201).json({
            success: true,
            message: 'Material uploaded successfully',
            data: material,
        });
    } catch (error: any) {
        console.error('Upload material error:', error);
        res.status(500).json({ success: false, message: 'Failed to upload material', error: error.message });
    }
};

export const getMyCourses = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const instructorId = req.user?.id;

        const courses = await Course.findAll({
            where: { instructor_id: instructorId },
            include: [
                {
                    model: CourseMaterial,
                    as: 'materials',
                },
            ],
        });

        res.status(200).json({
            success: true,
            data: courses,
        });
    } catch (error: any) {
        console.error('Get my courses error:', error);
        res.status(500).json({ success: false, message: 'Failed to get courses', error: error.message });
    }
};

export const getPendingTransactions = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const instructorId = req.user?.id;

        const instructorBank = await BankAccount.findOne({
            where: { user_id: instructorId },
        });

        if (!instructorBank) {
            res.status(404).json({ success: false, message: 'Bank account not found' });
            return;
        }

        const transactions = await Transaction.findAll({
            where: {
                to_account: instructorBank.account_number,
                status: 'pending',
            },
        });

        res.status(200).json({
            success: true,
            data: transactions,
        });
    } catch (error: any) {
        console.error('Get pending transactions error:', error);
        res.status(500).json({ success: false, message: 'Failed to get transactions', error: error.message });
    }
};

export const claimPayment = async (req: AuthRequest, res: Response): Promise<void> => {
    const transaction = await sequelize.transaction();

    try {
        const instructorId = req.user?.id;
        const { transaction_id, secret } = req.body;

        if (!transaction_id || !secret) {
            await transaction.rollback();
            res.status(400).json({ success: false, message: 'Transaction ID and secret are required' });
            return;
        }

        const instructorBank = await BankAccount.findOne({
            where: { user_id: instructorId },
            lock: transaction.LOCK.UPDATE,
            transaction,
        });

        if (!instructorBank) {
            await transaction.rollback();
            res.status(404).json({ success: false, message: 'Bank account not found' });
            return;
        }

        if (secret !== instructorBank.secret) {
            await transaction.rollback();
            res.status(401).json({ success: false, message: 'Invalid secret' });
            return;
        }

        const txn = await Transaction.findByPk(transaction_id, { transaction });

        if (!txn) {
            await transaction.rollback();
            res.status(404).json({ success: false, message: 'Transaction not found' });
            return;
        }

        if (txn.to_account !== instructorBank.account_number) {
            await transaction.rollback();
            res.status(403).json({ success: false, message: 'This transaction is not for you' });
            return;
        }

        if (txn.status !== 'pending') {
            await transaction.rollback();
            res.status(400).json({ success: false, message: 'Transaction already processed' });
            return;
        }

        const lmsBank = await BankAccount.findOne({
            where: { account_number: txn.from_account },
            lock: transaction.LOCK.UPDATE,
            transaction,
        });

        if (!lmsBank) {
            await transaction.rollback();
            res.status(500).json({ success: false, message: 'LMS bank account not found' });
            return;
        }

        const amount = parseFloat(txn.amount.toString());

        if (parseFloat(lmsBank.balance.toString()) < amount) {
            await transaction.rollback();
            res.status(400).json({ success: false, message: 'LMS has insufficient balance' });
            return;
        }

        lmsBank.balance = parseFloat(lmsBank.balance.toString()) - amount;
        instructorBank.balance = parseFloat(instructorBank.balance.toString()) + amount;

        await lmsBank.save({ transaction });
        await instructorBank.save({ transaction });

        txn.status = 'completed';
        txn.validated_at = new Date();
        txn.completed_at = new Date();
        await txn.save({ transaction });

        await transaction.commit();

        res.status(200).json({
            success: true,
            message: 'Payment claimed successfully',
            data: {
                transaction_id: txn.id,
                amount_received: amount,
                new_balance: instructorBank.balance,
            },
        });
    } catch (error: any) {
        await transaction.rollback();
        console.error('Claim payment error:', error);
        res.status(500).json({ success: false, message: 'Failed to claim payment', error: error.message });
    }
};
