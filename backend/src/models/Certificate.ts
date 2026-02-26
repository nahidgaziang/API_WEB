import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
export interface CertificateAttributes {
    id?: number;
    enrollment_id: number;
    certificate_code: string;
    issue_date?: Date;
}
class Certificate extends Model<CertificateAttributes> implements CertificateAttributes {
    public id!: number;
    public enrollment_id!: number;
    public certificate_code!: string;
    public readonly issue_date!: Date;
}
Certificate.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        enrollment_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
        },
        certificate_code: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
        },
        issue_date: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        tableName: 'certificates',
        timestamps: false,
    }
);
export default Certificate;
