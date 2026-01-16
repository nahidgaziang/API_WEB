import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

export interface BankAccountAttributes {
    id?: number;
    user_id: number;
    account_number: string;
    secret: string;
    balance?: number;
    created_at?: Date;
    updated_at?: Date;
}

class BankAccount extends Model<BankAccountAttributes> implements BankAccountAttributes {
    public id!: number;
    public user_id!: number;
    public account_number!: string;
    public secret!: string;
    public balance!: number;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

BankAccount.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
        },
        account_number: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true,
        },
        secret: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        balance: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0.00,
        },
    },
    {
        sequelize,
        tableName: 'bank_accounts',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
);

export default BankAccount;
