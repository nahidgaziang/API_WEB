import jwt from 'jsonwebtoken';
import { config } from '../config/config';

export interface JwtPayload {
    id: number;
    username: string;
    email: string;
    role: 'learner' | 'instructor' | 'lms_admin';
}

export const generateToken = (payload: JwtPayload): string => {
    return jwt.sign(payload, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn,
    } as any);
};

export const verifyToken = (token: string): JwtPayload => {
    try {
        return jwt.verify(token, config.jwt.secret) as JwtPayload;
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
};
