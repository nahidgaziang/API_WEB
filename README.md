# LMS - Learning Management System

A comprehensive Learning Management System built with Node.js, Express, MySQL, and Vanilla JavaScript.

## 🎯 Features

### For Learners
- **User Registration & Login** with role-based authentication
- **Bank Account Setup** for course purchases
- **Browse All Courses** (5 courses available)
- **Purchase Courses** with secure payment processing
- **Access Course Materials** (text, video, audio, MCQ)
- **Complete Courses** and earn certificates
- **View Certificates** with unique certificate codes
- **Check Account Balance**

### For Instructors
- **Upload Courses** and receive lump sum payment immediately
- **Add Course Materials** (text, video, audio, MCQ quizzes)
- **View Course Statistics**
- **Claim Pending Payments** from course sales
- **Check Account Balance**

### For LMS Organization
- Manage 5 courses across 3 instructors
- Process learner enrollments
- Facilitate instructor payments
- Transaction management

## 🛠️ Technology Stack

- **Backend**: Node.js, Express, TypeScript
- **Database**: MySQL (via XAMPP)
- **ORM**: Sequelize
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcrypt for password hashing
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **API**: REST

## 📋 Prerequisites

- Node.js v18+ installed
- XAMPP installed (MySQL running)
- Git (optional)

## 🚀 Installation & Setup

### Step 1: Start XAMPP
1. Open XAMPP Control Panel
2. Start **MySQL** service
3. Click **Admin** to open phpMyAdmin

### Step 2: Create Database
1. In phpMyAdmin, click **New**
2. Database name: `lms_system`
3. Collation: `utf8mb4_general_ci`
4. Click **Create**

### Step 3: Run Database Schema
1. In phpMyAdmin, select `lms_system` database
2. Go to **SQL** tab
3. Copy entire content from `database/schema.sql`
4. Paste and click **Go**
5. Verify 7 tables are created

### Step 4: Seed Database with Sample Data
1. Go to **SQL** tab again
2. Copy entire content from `database/seed.sql`
3. Paste and click **Go**
4. Verify data is inserted

### Step 5: Install Backend Dependencies
```bash
cd backend
npm install
```

### Step 6: Start Backend Server
```bash
npm run dev
```

You should see:
```
✅ Database connection established successfully
✅ Database models synchronized
🚀 Server running on http://localhost:5000
```

### Step 7: Install Frontend Dependencies
Open a new terminal:
```bash
cd frontend
npm install
```

### Step 8: Start Frontend Dev Server
```bash
npm run dev
```

The browser should automatically open at `http://localhost:8080`

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile

### Bank
- `POST /api/bank/setup` - Setup bank account
- `GET /api/bank/balance` - Get account balance
- `POST /api/bank/transaction` - Process transaction

### Learner
- `GET /api/learner/courses` - Get all courses
- `POST /api/learner/enroll` - Enroll in course
- `GET /api/learner/my-courses` - Get enrolled courses
- `GET /api/learner/courses/:id/materials` - Get course materials
- `POST /api/learner/complete-course` - Mark course complete
- `GET /api/learner/certificates` - Get certificates

### Instructor
- `POST /api/instructor/courses` - Upload new course
- `POST /api/instructor/materials` - Upload materials
- `GET /api/instructor/my-courses` - Get instructor courses
- `GET /api/instructor/pending-transactions` - Get pending payments
- `POST /api/instructor/claim-payment` - Claim payment

## 🗄️ Database Structure

### Tables
1. **users** - All system users (learners, instructors, admin)
2. **bank_accounts** - Bank accounts for transactions
3. **courses** - 5 courses in the system
4. **course_materials** - Text, video, audio, MCQ content
5. **enrollments** - Learner course registrations
6. **certificates** - Generated certificates
7. **transactions** - All financial transactions

## 💰 Transaction Flow

### Learner Purchases Course
1. Learner selects course (e.g., ৳799)
2. Enters account secret
3. System validates balance
4. Deducts from learner account
5. Adds to LMS account
6. Creates enrollment record

### Instructor Uploads Course
1. Instructor creates course
2. Sets upload payment (e.g., ৳2000)
3. LMS immediately pays instructor
4. Course becomes available to learners

### Instructor Claims Course Sales Payment
1. Course is sold to learner
2. LMS creates transaction record
3. Instructor validates transaction
4. Enters account secret
5. Payment transferred from LMS to instructor

## 🎨 Project Structure

```
WebProject2/
├── backend/
│   ├── src/
│   │   ├── config/        # Database & app config
│   │   ├── models/        # Sequelize models
│   │   ├── controllers/   # Business logic
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Auth & error handling
│   │   ├── utils/         # Helper functions
│   │   └── server.ts      # Express app
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── css/
│   ├── js/
│   ├── learner/          # Learner pages
│   ├── instructor/       # Instructor pages
│   └── *.html           # Main pages
└── database/
    ├── schema.sql        # Database structure
    └── seed.sql          # Sample data
```

## 🐛 Troubleshooting

### MySQL Connection Error
**Problem:** `ER_ACCESS_DENIED_FOR_USER`  
**Solution:** Check `DB_USER` and `DB_PASSWORD` in `backend/.env`

### CORS Error
**Problem:** `Access to fetch blocked by CORS`  
**Solution:** Ensure backend has `app.use(cors())` configured

### Port Already in Use
**Problem:** `EADDRINUSE :::5000`  
**Solution:**
```bash
lsof -i :5000
kill -9 <PID>
```

### Frontend 404 Errors
**Problem:** JavaScript files not loading  
**Solution:** Ensure you're serving from `frontend` directory

## ✅ Testing the System

### Test 1: Learner Journey
1. Register as learner
2. Setup bank account (Account: LEARN999, Secret: test123, Balance: 10000)
3. Browse courses
4. Purchase "Web Development Fundamentals" (৳799)
5. Access course materials
6. Complete course
7. View certificate

### Test 2: Instructor Journey
1. Login as instructor (`john_doe` / `instructor123`)
2. Upload new course
3. Add materials (text, video)
4. View pending payments
5. Claim payment with secret `mysecret`
6. Check updated balance

##  🔒 Security Features

- **Password Hashing**: bcrypt (10 rounds)
- **JWT Authentication**: Token-based auth with 7-day expiry
- **Bank Secret Hashing**: Secure transaction authorization
- **Role-Based Access Control**: Separate permissions for learners/instructors
- **SQL Injection Protection**: Sequelize parameterized queries
- **Database Transactions**: ACID-compliant payment processing

## 📝 License

This project is for educational purposes.

## 👨‍💻 Author

Built as part of an LMS project assignment.

---

**Enjoy using the LMS! 🎓**
