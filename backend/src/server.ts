import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './config/database';
import { config } from './config/config';
import { errorHandler } from './middleware/errorHandler';

import authRoutes from './routes/auth.routes';
import bankRoutes from './routes/bank.routes';
import learnerRoutes from './routes/learner.routes';
import instructorRoutes from './routes/instructor.routes';

import './models';

dotenv.config();

const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req: Request, res: Response) => {
    res.json({
        success: true,
        message: 'LMS Backend API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            bank: '/api/bank',
            learner: '/api/learner',
            instructor: '/api/instructor',
        },
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/bank', bankRoutes);
app.use('/api/learner', learnerRoutes);
app.use('/api/instructor', instructorRoutes);

app.use(errorHandler);

const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connection established successfully');

        await sequelize.sync({ alter: false });
        console.log('Database models synchronized');

        const PORT = config.port;
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
            console.log(`Environment: ${config.nodeEnv}`);
            console.log(`Database: ${config.db.database}`);
        });
    } catch (error) {
        console.error('Unable to start server:', error);
        process.exit(1);
    }
};

startServer();

export default app;
