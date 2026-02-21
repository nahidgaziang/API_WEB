import { Request, Response } from 'express';
import { BankAccount } from '../models';
import { AuthRequest } from '../middleware/auth';
import sequelize from '../config/database';

export const setupBankAccount = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const { account_number, secret, initial_balance } = req.body;

        if (!account_number || !secret) {
            res.status(400).json({ success: false, message: 'Account number and secret are required' });
            return;
        }

        const existing = await BankAccount.findOne({ where: { user_id: userId } });
        if (existing) {
            res.status(409).json({ success: false, message: 'Bank account already exists' });
            return;
        }

        const bankAccount = await BankAccount.create({
            user_id: userId!,
            account_number,
            secret: secret,
            balance: initial_balance || 5000,
        });

        res.status(201).json({
            success: true,
            message: 'Bank account created successfully',
            data: {
                account_number: bankAccount.account_number,
                balance: bankAccount.balance,
            },
        });
    } catch (error: any) {
        console.error('Bank setup error:', error);
        res.status(500).json({ success: false, message: 'Failed to create bank account', error: error.message });
    }
};

export const getBalance = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;

        const bankAccount = await BankAccount.findOne({ where: { user_id: userId } });

        if (!bankAccount) {
            res.status(404).json({ success: false, message: 'Bank account not found' });
            return;
        }

        res.status(200).json({
            success: true,
            data: {
                account_number: bankAccount.account_number,
                balance: parseFloat(bankAccount.balance.toString()),
            },
        });
    } catch (error: any) {
        console.error('Get balance error:', error);
        res.status(500).json({ success: false, message: 'Failed to get balance', error: error.message });
    }
};

export const processTransaction = async (req: Request, res: Response): Promise<void> => {
    const transaction = await sequelize.transaction();

    try {
        const { from_account, to_account, amount, secret } = req.body;

        if (!from_account || !to_account || !amount || !secret) {
            await transaction.rollback();
            res.status(400).json({ success: false, message: 'All fields are required' });
            return;
        }

        const fromBank = await BankAccount.findOne({
            where: { account_number: from_account },
            lock: transaction.LOCK.UPDATE,
            transaction,
        });

        if (!fromBank) {
            await transaction.rollback();
            res.status(404).json({ success: false, message: 'Source account not found' });
            return;
        }

        if (secret !== fromBank.secret) {
            await transaction.rollback();
            res.status(401).json({ success: false, message: 'Invalid secret' });
            return;
        }

        if (parseFloat(fromBank.balance.toString()) < amount) {
            await transaction.rollback();
            res.status(400).json({ success: false, message: 'Insufficient balance' });
            return;
        }

        const toBank = await BankAccount.findOne({
            where: { account_number: to_account },
            lock: transaction.LOCK.UPDATE,
            transaction,
        });

        if (!toBank) {
            await transaction.rollback();
            res.status(404).json({ success: false, message: 'Destination account not found' });
            return;
        }

        fromBank.balance = parseFloat(fromBank.balance.toString()) - amount;
        toBank.balance = parseFloat(toBank.balance.toString()) + amount;

        await fromBank.save({ transaction });
        await toBank.save({ transaction });

        await transaction.commit();

        res.status(200).json({
            success: true,
            message: 'Transaction completed successfully',
            data: {
                from_account,
                to_account,
                amount,
                new_balance: fromBank.balance,
            },
        });
    } catch (error: any) {
        await transaction.rollback();
        console.error('Transaction error:', error);
        res.status(500).json({ success: false, message: 'Transaction failed', error: error.message });
    }
};

export const getAccountByNumber = async (req: Request, res: Response): Promise<void> => {
    try {
        const { account_number } = req.params;

        const account = await BankAccount.findOne({
            where: { account_number },
        });

        if (!account) {
            res.status(404).json({ success: false, message: 'Account not found' });
            return;
        }

        res.status(200).json({
            success: true,
            data: {
                account_number: account.account_number,
                balance: parseFloat(account.balance.toString()),
            },
        });
    } catch (error: any) {
        console.error('Get account error:', error);
        res.status(500).json({ success: false, message: 'Failed to get account', error: error.message });
    }
};
