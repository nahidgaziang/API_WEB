import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

export interface UserAttributes {
    id?: number;
    username: string;
    email: string;
    password: string;
    role: 'learner' | 'instructor' | 'lms_admin';
    full_name: string;
    created_at?: Date;
    updated_at?: Date;
}

class User extends Model<UserAttributes> implements UserAttributes {
    public id!: number;
    public username!: string;
    public email!: string;
    public password!: string;
    public role!: 'learner' | 'instructor' | 'lms_admin';
    public full_name!: string;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

User.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        username: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
        },
        email: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        role: {
            type: DataTypes.ENUM('learner', 'instructor', 'lms_admin'),
            allowNull: false,
        },
        full_name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: 'users',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
);

export default User;
