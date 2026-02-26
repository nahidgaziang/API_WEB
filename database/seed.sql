USE lms_system;

INSERT INTO
    topics (name, description, is_active)
VALUES (
        'Web Development Fundamentals',
        'HTML, CSS, JavaScript and the basics of building websites',
        1
    ),
    (
        'Data Science with Python',
        'Data analysis and visualization using Python and pandas',
        1
    ),
    (
        'Machine Learning Basics',
        'Introduction to ML algorithms and practical applications',
        1
    ),
    (
        'Mobile App Development',
        'Building cross-platform mobile applications',
        1
    ),
    (
        'Cloud Computing with AWS',
        'Deploying and managing applications in the AWS cloud',
        1
    );

INSERT INTO
    users (
        username,
        email,
        password,
        role,
        full_name
    )
VALUES (
        'lmsadmin',
        'admin@lms.com',
        'admin123',
        'lms_admin',
        'LMS Administrator'
    );

INSERT INTO
    users (
        username,
        email,
        password,
        role,
        full_name
    )
VALUES (
        'nahid',
        'nahid@gmail.com',
        '12345678',
        'instructor',
        'Nahid Gazi'
    ),
    (
        'rahat',
        'rahat@gmail.com',
        '12345678',
        'instructor',
        'Rahat Ahmed'
    ),
    (
        'bob_wilson',
        'bob@example.com',
        '12345678',
        'instructor',
        'Dr. Bob Wilson'
    );

INSERT INTO
    users (
        username,
        email,
        password,
        role,
        full_name
    )
VALUES (
        'nahids',
        'nahids@gmail.com',
        '12345678',
        'learner',
        'Nahid Gazi'
    ),
    (
        'rahats',
        'rahats@gmail.com',
        '12345678',
        'learner',
        'Rahat Ahmed'
    ),
    (
        'bobs',
        'bobs@example.com',
        'learner123',
        'learner',
        'bob'
    );

INSERT INTO
    bank_accounts (
        user_id,
        account_number,
        secret,
        balance
    )
VALUES (
        1,
        'LMS1000000001',
        '12345678',
        1000000.00
    );

INSERT INTO
    bank_accounts (
        user_id,
        account_number,
        secret,
        balance
    )
VALUES (
        2,
        'INST000002',
        '12345678',
        5000.00
    ),
    (
        3,
        'INST000003',
        '12345678',
        5000.00
    ),
    (
        4,
        'INST000004',
        '12345678',
        5000.00
    );

INSERT INTO
    bank_accounts (
        user_id,
        account_number,
        secret,
        balance
    )
VALUES (
        5,
        'LEARN000005',
        '12345678',
        10000.00
    ),
    (
        6,
        'LEARN000006',
        '12345678',
        10000.00
    ),
    (
        7,
        'LEARN000007',
        'learner123',
        10000.00
    );

SELECT 'Database seeded successfully!' AS message;

SELECT COUNT(*) AS total_users FROM users;

SELECT COUNT(*) AS total_bank_accounts FROM bank_accounts;