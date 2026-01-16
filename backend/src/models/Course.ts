import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

export interface CourseAttributes {
    id?: number;
    title: string;
    description?: string;
    instructor_id: number;
    price: number;
    upload_payment: number;
    status?: 'active' | 'inactive';
    created_at?: Date;
    updated_at?: Date;
}

class Course extends Model<CourseAttributes> implements CourseAttributes {
    public id!: number;
    public title!: string;
    public description!: string;
    public instructor_id!: number;
    public price!: number;
    public upload_payment!: number;
    public status!: 'active' | 'inactive';
    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

Course.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        title: {
            type: DataTypes.STRING(200),
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
        },
        instructor_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        upload_payment: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('active', 'inactive'),
            defaultValue: 'active',
        },
    },
    {
        sequelize,
        tableName: 'courses',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
);

export default Course;
