import User from './User';
import BankAccount from './BankAccount';
import Course from './Course';
import CourseMaterial from './CourseMaterial';
import Enrollment from './Enrollment';
import Certificate from './Certificate';
import Transaction from './Transaction';

User.hasOne(BankAccount, { foreignKey: 'user_id', as: 'bank_account' });
BankAccount.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(Course, { foreignKey: 'instructor_id', as: 'courses' });
Course.belongsTo(User, { foreignKey: 'instructor_id', as: 'instructor' });

Course.hasMany(CourseMaterial, { foreignKey: 'course_id', as: 'materials' });
CourseMaterial.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });

User.hasMany(Enrollment, { foreignKey: 'learner_id', as: 'enrollments' });
Enrollment.belongsTo(User, { foreignKey: 'learner_id', as: 'learner' });

Course.hasMany(Enrollment, { foreignKey: 'course_id', as: 'enrollments' });
Enrollment.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });

Enrollment.hasOne(Certificate, { foreignKey: 'enrollment_id', as: 'certificate' });
Certificate.belongsTo(Enrollment, { foreignKey: 'enrollment_id', as: 'enrollment' });

export {
    User,
    BankAccount,
    Course,
    CourseMaterial,
    Enrollment,
    Certificate,
    Transaction,
};
