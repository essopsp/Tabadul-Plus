-- إنشاء قاعدة البيانات
CREATE DATABASE tebadel_plus_db;

-- استخدام قاعدة البيانات
\c tebadel_plus_db

-- إنشاء جدول العملاء
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- إنشاء جدول الحسابات
CREATE TABLE accounts (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id),
    balance_usd DECIMAL(10, 2) DEFAULT 0,
    balance_lyd DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- إنشاء جدول المعاملات
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    account_id INTEGER REFERENCES accounts(id),
    type VARCHAR(10) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    rate DECIMAL(10, 4) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- تعديل جدول المعاملات ليشمل إمكانية المعاملات غير المكتملة وإدارة الأرصدة الدائنة والمدينة للعملاء
ALTER TABLE transactions
ADD COLUMN is_completed BOOLEAN DEFAULT false,
ADD COLUMN remaining_amount DECIMAL(10, 2) DEFAULT 0;

-- Add paid_amount column to transactions table
ALTER TABLE transactions ADD COLUMN paid_amount DECIMAL(10, 2);

-- Update existing rows to set paid_amount equal to amount (assuming all existing transactions were fully paid)
UPDATE transactions SET paid_amount = amount;

-- Make paid_amount NOT NULL for future insertions
ALTER TABLE transactions ALTER COLUMN paid_amount SET NOT NULL;

-- Add a new column to the transactions table
ALTER TABLE transactions ADD COLUMN created_by VARCHAR(100);

-- إنشاء جدول أسعار الصرف
CREATE TABLE exchange_rates (
    id SERIAL PRIMARY KEY,
    rate_usd_to_lyd DECIMAL(10, 4) NOT NULL,
    rate_lyd_to_usd DECIMAL(10, 4) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- إضافة بعض البيانات الأولية لأسعار الصرف
INSERT INTO exchange_rates (rate_usd_to_lyd, rate_lyd_to_usd) VALUES (4.8000, 0.2083);

-- إضافة جدول جديد لتتبع أرصدة العملاء
CREATE TABLE customer_balances (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id),
    balance_usd DECIMAL(10, 2) DEFAULT 0,
    balance_lyd DECIMAL(10, 2) DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);