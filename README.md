# LMS - Learning Management System

A full-stack Learning Management System (LMS) built with **Node.js**, **Express**, **TypeScript**, **MySQL**, and **Vanilla JavaScript**. Supports learner and instructor workflows including course purchasing, material access, payment processing, and certificate generation.

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Quick Start with Docker](#quick-start-with-docker)
- [Manual Setup (Local)](#manual-setup-local)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [Test Accounts](#test-accounts)
- [Transaction Flow](#transaction-flow)
- [Troubleshooting](#troubleshooting)

---

## Features

### Learner

- Register and login with JWT authentication
- Setup bank account and check balance
- Browse and purchase courses (secure payment)
- Access course materials (text, video, audio, MCQ)
- Mark courses complete and earn certificates
- Download certificates with unique certificate codes

### Instructor

- Upload courses and receive lump-sum payment
- Add course materials (text, video, audio, MCQ quizzes)
- View pending course sale payments
- Claim payments from learner course purchases
- View account balance and course statistics

---

## Architecture

```
Browser → Nginx (port 8080) → Static files (HTML/CSS/JS)
                            → /api/* proxy → Express API (port 5000) → MySQL (port 3307)
```

| Service  | Technology        | Port (host) |
| -------- | ----------------- | ----------- |
| Frontend | Nginx (static)    | 8080        |
| Backend  | Node.js / Express | 5000        |
| Database | MySQL 8.0         | 3307        |

---

## Quick Start with Docker

> **Requirements:** [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/) installed.

```bash
git clone https://github.com/nahidgaziang/API_WEB.git
cd API_WEB
docker compose up -d
```

That's it. Docker will:

1. Start a MySQL 8.0 container and auto-run `schema.sql` + `seed.sql`
2. Build and start the backend Node.js API
3. Build and start the frontend Nginx server

Open **http://localhost:8080** in your browser.

### Useful Docker Commands

```bash
# View running containers
docker compose ps

# View logs for a specific service
docker logs lms-backend
docker logs lms-frontend
docker logs lms-db

# Stop all containers
docker compose down

# Stop and delete all data (fresh start)
docker compose down -v

# Rebuild after code changes
docker compose build --no-cache
docker compose up -d
```

---

## Manual Setup (Local)

### Prerequisites

- Node.js v18+
- MySQL 8.0 (running locally)

### Step 1: Clone the repository

```bash
git clone https://github.com/nahidgaziang/API_WEB.git
cd API_WEB
```

### Step 2: Set up the database

Run these commands in your terminal (requires `sudo` on Linux):

```bash
bash setup-db.sh
```

This script will:

- Create a MySQL user `lms_user` with password `lms_password`
- Create the `lms_system` database
- Run `database/schema.sql` to create all tables
- Run `database/seed.sql` to populate sample data

> **Note:** If you are on a system where MySQL root uses a password, edit `setup-db.sh` to add `-p<your-password>` to the sudo mysql command.

### Step 3: Configure the backend

The `.env` file is already pre-configured for the default setup:

```env
PORT=5000
DB_HOST=127.0.0.1
DB_USER=lms_user
DB_PASSWORD=lms_password
DB_NAME=lms_system
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
LMS_ACCOUNT_NUMBER=LMS1000000001
LMS_INITIAL_BALANCE=1000000
```

### Step 4: Start the backend

```bash
cd backend
npm install
npm run dev
```

You should see:

```
Database connection established successfully
Database models synchronized
Server running on http://localhost:5000
```

### Step 5: Update frontend API URL (for local development only)

Open `frontend/js/api.js` and change:

```js
// For local dev (non-Docker):
const API_BASE_URL = "http://localhost:5000/api";

// For Docker (default):
const API_BASE_URL = "/api";
```

### Step 6: Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:8080** in your browser.

---

## Project Structure

```
API_WEB/
├── backend/
│   ├── src/
│   │   ├── config/          # database.ts, config.ts
│   │   ├── controllers/     # auth, bank, learner, instructor
│   │   ├── middleware/      # auth.ts, roleCheck.ts, errorHandler.ts
│   │   ├── models/          # Sequelize models (7 tables)
│   │   ├── routes/          # auth, bank, learner, instructor routes
│   │   ├── utils/           # jwt.ts, helpers.ts
│   │   └── server.ts
│   ├── Dockerfile
│   ├── .env
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── api.js           # all API request functions
│   │   └── auth.js          # auth utilities & localStorage helpers
│   ├── learner/             # 6 learner pages
│   ├── instructor/          # 4 instructor pages
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── database/
│   ├── schema.sql           # creates 7 tables
│   └── seed.sql             # inserts sample users, courses, and transactions
├── docker-compose.yml
├── setup-db.sh              # one-command local DB setup
└── README.md
```

---

## API Reference

### Authentication

| Method | Endpoint             | Description                    |
| ------ | -------------------- | ------------------------------ |
| POST   | `/api/auth/register` | Register a new user            |
| POST   | `/api/auth/login`    | Login and receive JWT          |
| GET    | `/api/auth/profile`  | Get authenticated user profile |

### Bank

| Method | Endpoint                | Description           |
| ------ | ----------------------- | --------------------- |
| POST   | `/api/bank/setup`       | Create a bank account |
| GET    | `/api/bank/balance`     | Get account balance   |
| POST   | `/api/bank/transaction` | Process a transaction |

### Learner (requires auth + learner role)

| Method | Endpoint                             | Description                     |
| ------ | ------------------------------------ | ------------------------------- |
| GET    | `/api/learner/courses`               | List all available courses      |
| POST   | `/api/learner/enroll`                | Purchase and enroll in a course |
| GET    | `/api/learner/my-courses`            | List enrolled courses           |
| GET    | `/api/learner/courses/:id/materials` | Get course materials            |
| POST   | `/api/learner/complete-course`       | Mark a course as complete       |
| GET    | `/api/learner/certificates`          | List earned certificates        |

### Instructor (requires auth + instructor role)

| Method | Endpoint                               | Description                   |
| ------ | -------------------------------------- | ----------------------------- |
| POST   | `/api/instructor/courses`              | Upload a new course           |
| POST   | `/api/instructor/materials`            | Add material to a course      |
| GET    | `/api/instructor/my-courses`           | List instructor's courses     |
| GET    | `/api/instructor/pending-transactions` | Get pending payments to claim |
| POST   | `/api/instructor/claim-payment`        | Claim a pending payment       |

---

## Test Accounts

Pre-seeded with the following accounts (all bank secrets are `mysecret`):

### Instructors

| Username   | Password      | Account    | Balance |
| ---------- | ------------- | ---------- | ------- |
| john_doe   | instructor123 | INST000002 | 5000 Tk |
| jane_smith | instructor123 | INST000003 | 5000 Tk |
| bob_wilson | instructor123 | INST000004 | 5000 Tk |

### Learners

| Username      | Password   | Account     | Balance  |
| ------------- | ---------- | ----------- | -------- |
| alice_brown   | learner123 | LEARN000005 | 10000 Tk |
| charlie_davis | learner123 | LEARN000006 | 10000 Tk |
| diana_evans   | learner123 | LEARN000007 | 10000 Tk |

### Pre-loaded Courses

| Title                        | Price   | Instructor       |
| ---------------------------- | ------- | ---------------- |
| Web Development Fundamentals | 799 Tk  | Dr. John Doe     |
| Data Science with Python     | 999 Tk  | Prof. Jane Smith |
| Machine Learning Basics      | 1299 Tk | Dr. John Doe     |
| Mobile App Development       | 899 Tk  | Dr. Bob Wilson   |
| Cloud Computing with AWS     | 1099 Tk | Prof. Jane Smith |

---

## Transaction Flow

### Learner Purchases a Course

1. Learner selects a course and enters bank account secret
2. System deducts course price from learner's account
3. Amount is added to the LMS organization account
4. Enrollment is created
5. A pending `instructor_payment` record is created for the instructor to claim

### Instructor Uploads a Course

1. Instructor fills in course details and upload payment amount
2. LMS immediately transfers the upload payment to the instructor
3. Course becomes available to all learners

### Instructor Claims Course Sale Payment

1. A pending payment appears on the instructor dashboard
2. Instructor clicks "Claim" and enters bank account secret
3. Payment is transferred from LMS to instructor's account

---

## Troubleshooting

### Docker: Port already in use

If port 8080 or 5000 is busy, edit `docker-compose.yml` and change the host port:

```yaml
ports:
  - "9090:80" # change 8080 to any free port
```

### Docker: Database not seeding

The SQL init scripts only run on a **fresh volume**. To force a re-seed:

```bash
docker compose down -v
docker compose up -d
```

### Local: Access denied for MySQL

Your system's MySQL root uses `auth_socket`. Run the setup script with sudo:

```bash
bash setup-db.sh
```

### Local: Backend not connecting

Ensure the `.env` values match your MySQL setup and that the `lms_system` database exists.

### CORS errors in browser

Ensure the frontend is accessing the backend through the Nginx proxy (`/api/`) and not directly via a hardcoded localhost URL when running in Docker.

---

## Technology Stack

| Layer            | Technology                                  |
| ---------------- | ------------------------------------------- |
| Language         | TypeScript (backend), JavaScript (frontend) |
| Backend          | Node.js, Express.js                         |
| ORM              | Sequelize                                   |
| Database         | MySQL 8.0                                   |
| Auth             | JWT (jsonwebtoken)                          |
| Security         | bcrypt (password + secret hashing)          |
| Frontend         | HTML5, CSS3, Vanilla JavaScript             |
| Reverse Proxy    | Nginx                                       |
| Containerization | Docker, Docker Compose                      |

---

## License

This project is for educational purposes.
