-- 邮箱地址表
CREATE TABLE IF NOT EXISTS email_addresses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email_address TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 邮件内容表
CREATE TABLE IF NOT EXISTS email_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email_address TEXT NOT NULL,
    received_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    sender TEXT NOT NULL,
    subject TEXT,
    body TEXT,
    verification_code TEXT,
    is_deleted BOOLEAN DEFAULT 0,
    is_read BOOLEAN DEFAULT 0,
    FOREIGN KEY (email_address) REFERENCES email_addresses(email_address)
); 