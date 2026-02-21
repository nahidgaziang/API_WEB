#!/bin/bash
sudo mysql -u root <<EOF
CREATE USER IF NOT EXISTS 'lms_user'@'localhost' IDENTIFIED BY 'lms_password';
CREATE DATABASE IF NOT EXISTS lms_system;
GRANT ALL PRIVILEGES ON lms_system.* TO 'lms_user'@'localhost';
FLUSH PRIVILEGES;
EOF

mysql -u lms_user -plms_password lms_system < /home/nahid-pc/Desktop/API_WEB/database/schema.sql
mysql -u lms_user -plms_password lms_system < /home/nahid-pc/Desktop/API_WEB/database/seed.sql

echo "Database setup complete!"
