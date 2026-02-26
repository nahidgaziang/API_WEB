import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
export interface TopicAttributes {
    id?: number;
    name: string;
    description?: string;
    is_active?: boolean;
    created_at?: Date;
    updated_at?: Date;
}
class Topic extends Model<TopicAttributes> implements TopicAttributes {
    public id!: number;
    public name!: string;
    public description!: string;
    public is_active!: boolean;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}
Topic.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(200),
            allowNull: false,
            unique: true,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    },
    {
        sequelize,
        tableName: 'topics',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
);
export default Topic;
