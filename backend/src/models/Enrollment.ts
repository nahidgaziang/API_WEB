import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

export interface EnrollmentAttributes {
    id?: number;
    learner_id: number;
    course_id: number;
    enrollment_date?: Date;
    completion_date?: Date;
    status?: 'enrolled' | 'in_progress' | 'completed';
}

class Enrollment extends Model<EnrollmentAttributes> implements EnrollmentAttributes {
    public id!: number;
    public learner_id!: number;
    public course_id!: number;
    public enrollment_date!: Date;
    public completion_date!: Date;
    public status!: 'enrolled' | 'in_progress' | 'completed';
}

Enrollment.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        learner_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        course_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        enrollment_date: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        completion_date: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM('enrolled', 'in_progress', 'completed'),
            defaultValue: 'enrolled',
        },
    },
    {
        sequelize,
        tableName: 'enrollments',
        timestamps: false,
    }
);

export default Enrollment;
