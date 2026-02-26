import { Request, Response } from 'express';
import { User, BankAccount } from '../models';
import { generateToken } from '../utils/jwt';
import { AuthRequest } from '../middleware/auth';
export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, email, password, role, full_name } = req.body;
        if (!username || !email || !password || !role || !full_name) {
            res.status(400).json({ success: false, message: 'All fields are required' });
            return;
        }
        if (!['learner', 'instructor', 'lms_admin'].includes(role)) {
            res.status(400).json({ success: false, message: 'Invalid role' });
            return;
        }
        const existingUser = await User.findOne({
            where: { username },
        });
        if (existingUser) {
            res.status(409).json({ success: false, message: 'Username already exists' });
            return;
        }
        const existingEmail = await User.findOne({
            where: { email },
        });
        if (existingEmail) {
            res.status(409).json({ success: false, message: 'Email already registered' });
            return;
        }
        const user = await User.create({
            username,
            email,
            password: password,
            role,
            full_name,
        });
        const token = generateToken({
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
        });
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    full_name: user.full_name,
                },
                token,
            },
        });
    } catch (error: any) {
        console.error('Registration error:', error);
        res.status(500).json({ success: false, message: 'Registration failed', error: error.message });
    }
};
export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            res.status(400).json({ success: false, message: 'Username and password are required' });
            return;
        }
        const user = await User.findOne({ where: { username } });
        if (!user) {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
            return;
        }
        if (password !== user.password) {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
            return;
        }
        const bankAccount = await BankAccount.findOne({ where: { user_id: user.id } });
        const token = generateToken({
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
        });
        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    full_name: user.full_name,
                },
                hasBankAccount: !!bankAccount,
                token,
            },
        });
    } catch (error: any) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Login failed', error: error.message });
    }
};
export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const user = await User.findByPk(userId, {
            include: [
                {
                    model: BankAccount,
                    as: 'bank_account',
                    attributes: ['account_number', 'balance'],
                },
            ],
        });
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        res.status(200).json({
            success: true,
            data: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                full_name: user.full_name,
                bank_account: user.get('bank_account') || null,
            },
        });
    } catch (error: any) {
        console.error('Get profile error:', error);
        res.status(500).json({ success: false, message: 'Failed to get profile', error: error.message });
    }
};
