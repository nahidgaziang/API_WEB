import dotenv from 'dotenv';
dotenv.config();
export const config = {
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',
    db: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'lms_system',
    },
    jwt: {
        secret: (process.env.JWT_SECRET || 'fallback_secret_key') as string,
        expiresIn: (process.env.JWT_EXPIRE || '7d') as string,
    },
    lms: {
        accountNumber: process.env.LMS_ACCOUNT_NUMBER || 'LMS1000000001',
        initialBalance: parseFloat(process.env.LMS_INITIAL_BALANCE || '1000000'),
    },
};
