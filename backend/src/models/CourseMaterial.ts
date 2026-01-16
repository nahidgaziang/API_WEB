import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

export interface CourseMaterialAttributes {
    id?: number;
    course_id: number;
    title: string;
    type: 'text' | 'audio' | 'video' | 'mcq';
    content?: string;
    file_url?: string;
    order_index?: number;
    created_at?: Date;
}

class CourseMaterial extends Model<CourseMaterialAttributes> implements CourseMaterialAttributes {
    public id!: number;
    public course_id!: number;
    public title!: string;
    public type!: 'text' | 'audio' | 'video' | 'mcq';
    public content!: string;
    public file_url!: string;
    public order_index!: number;
    public readonly created_at!: Date;
}

CourseMaterial.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        course_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        title: {
            type: DataTypes.STRING(200),
            allowNull: false,
        },
        type: {
            type: DataTypes.ENUM('text', 'audio', 'video', 'mcq'),
            allowNull: false,
        },
        content: {
            type: DataTypes.TEXT,
        },
        file_url: {
            type: DataTypes.STRING(500),
        },
        order_index: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
    },
    {
        sequelize,
        tableName: 'course_materials',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false,
    }
);

export default CourseMaterial;
