USE lms_system;

INSERT INTO users (username, email, password, role, full_name) VALUES
('lmsadmin', 'admin@lms.com', 'admin123', 'lms_admin', 'LMS Administrator');

INSERT INTO users (username, email, password, role, full_name) VALUES
('john_doe', 'john@example.com', 'instructor123', 'instructor', 'Dr. John Doe'),
('jane_smith', 'jane@example.com', 'instructor123', 'instructor', 'Prof. Jane Smith'),
('bob_wilson', 'bob@example.com', 'instructor123', 'instructor', 'Dr. Bob Wilson');

INSERT INTO users (username, email, password, role, full_name) VALUES
('alice_brown', 'alice@example.com', 'learner123', 'learner', 'Alice Brown'),
('charlie_davis', 'charlie@example.com', 'learner123', 'learner', 'Charlie Davis'),
('diana_evans', 'diana@example.com', 'learner123', 'learner', 'Diana Evans');

INSERT INTO bank_accounts (user_id, account_number, secret, balance) VALUES
(1, 'LMS1000000001', 'mysecret', 1000000.00);

INSERT INTO bank_accounts (user_id, account_number, secret, balance) VALUES
(2, 'INST000002', 'mysecret', 5000.00),
(3, 'INST000003', 'mysecret', 5000.00),
(4, 'INST000004', 'mysecret', 5000.00);

INSERT INTO bank_accounts (user_id, account_number, secret, balance) VALUES
(5, 'LEARN000005', 'mysecret', 10000.00),
(6, 'LEARN000006', 'mysecret', 10000.00),
(7, 'LEARN000007', 'mysecret', 10000.00);

INSERT INTO courses (title, description, instructor_id, price, upload_payment, status) VALUES
('Web Development Fundamentals', 'Learn HTML, CSS, and JavaScript from scratch', 2, 799.00, 2000.00, 'active'),
('Data Science with Python', 'Master data analysis and visualization with Python', 3, 999.00, 2500.00, 'active'),
('Machine Learning Basics', 'Introduction to machine learning algorithms', 2, 1299.00, 3000.00, 'active'),
('Mobile App Development', 'Build native mobile apps with React Native', 4, 899.00, 2200.00, 'active'),
('Cloud Computing with AWS', 'Learn AWS services and cloud deployment', 3, 1099.00, 2800.00, 'active');

INSERT INTO course_materials (course_id, title, type, content, file_url, order_index) VALUES
(1, 'Introduction to HTML', 'text', 'HTML stands for HyperText Markup Language. It is the standard markup language for creating web pages.', NULL, 1),
(1, 'HTML Basic Structure', 'video', NULL, 'https://example.com/video1.mp4', 2),
(1, 'CSS Styling Basics', 'text', 'CSS is used to style HTML elements. You can change colors, fonts, layouts, and more.', NULL, 3),
(1, 'Quiz: Web Fundamentals', 'mcq', '{"questions": [{"q": "What does HTML stand for?", "options": ["Hyper Text Markup Language", "High Tech Modern Language"], "answer": 0}]}', NULL, 4);

INSERT INTO course_materials (course_id, title, type, content, file_url, order_index) VALUES
(2, 'Introduction to Python', 'text', 'Python is a high-level, interpreted programming language known for its simplicity.', NULL, 1),
(2, 'Data Analysis Tutorial', 'video', NULL, 'https://example.com/python-data.mp4', 2),
(2, 'Working with Pandas', 'text', 'Pandas is a powerful data manipulation library in Python.', NULL, 3);

INSERT INTO course_materials (course_id, title, type, content, file_url, order_index) VALUES
(3, 'What is Machine Learning?', 'text', 'Machine learning is a subset of artificial intelligence that enables systems to learn from data.', NULL, 1),
(3, 'ML Algorithms Overview', 'video', NULL, 'https://example.com/ml-intro.mp4', 2);

INSERT INTO course_materials (course_id, title, type, content, file_url, order_index) VALUES
(4, 'Introduction to React Native', 'text', 'React Native allows you to build mobile applications using JavaScript and React.', NULL, 1),
(4, 'Building Your First App', 'video', NULL, 'https://example.com/react-native.mp4', 2);

INSERT INTO course_materials (course_id, title, type, content, file_url, order_index) VALUES
(5, 'AWS Basics', 'text', 'Amazon Web Services (AWS) is a comprehensive cloud computing platform.', NULL, 1),
(5, 'EC2 and S3 Tutorial', 'video', NULL, 'https://example.com/aws-tutorial.mp4', 2),
(5, 'Quiz: Cloud Concepts', 'mcq', '{"questions": [{"q": "What does EC2 stand for?", "options": ["Elastic Compute Cloud", "Easy Cloud Computing"], "answer": 0}]}', NULL, 3);

INSERT INTO enrollments (learner_id, course_id, status) VALUES
(5, 1, 'in_progress');

INSERT INTO transactions (from_account, to_account, amount, transaction_type, reference_id, status, created_at, completed_at) VALUES
('LEARN000005', 'LMS1000000001', 799.00, 'course_purchase', 1, 'completed', NOW(), NOW()),
('LMS1000000001', 'INST000002', 2000.00, 'upload_payment', 1, 'completed', NOW(), NOW());

SELECT 'Database seeded successfully!' AS message;
SELECT COUNT(*) AS total_users FROM users;
SELECT COUNT(*) AS total_courses FROM courses;
SELECT COUNT(*) AS total_materials FROM course_materials;
SELECT COUNT(*) AS total_bank_accounts FROM bank_accounts;
