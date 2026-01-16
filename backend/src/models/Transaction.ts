import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

export interface TransactionAttributes {
    id?: number;
    from_account: string;
    to_account: string;
    amount: number;
    transaction_type: 'course_purchase' | 'instructor_payment' | 'upload_payment';
    reference_id?: number;
    status?: 'pending' | 'validated' | 'completed' | 'failed';
    created_at?: Date;
    validated_at?: Date;
    completed_at?: Date;
}

class Transaction extends Model<TransactionAttributes> implements TransactionAttributes {
    public id!: number;
    public from_account!: string;
    public to_account!: string;
    public amount!: number;
    public transaction_type!: 'course_purchase' | 'instructor_payment' | 'upload_payment';
    public reference_id!: number;
    public status!: 'pending' | 'validated' | 'completed' | 'failed';
    public readonly created_at!: Date;
    public validated_at!: Date;
    public completed_at!: Date;
}

Transaction.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        from_account: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        to_account: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        transaction_type: {
            type: DataTypes.ENUM('course_purchase', 'instructor_payment', 'upload_payment'),
            allowNull: false,
        },
        reference_id: {
            type: DataTypes.INTEGER,
        },
        status: {
            type: DataTypes.ENUM('pending', 'validated', 'completed', 'failed'),
            defaultValue: 'pending',
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        validated_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        completed_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'transactions',
        timestamps: false,
    }
);

export default Transaction;
