-- Database initialization script for Helpdesk Ticketing System
-- This file is automatically executed when PostgreSQL container starts

-- Create the database if it doesn't exist (usually handled by POSTGRES_DB env var)
-- CREATE DATABASE helpdesk_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT CHECK (role IN ('user', 'admin')) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL
);

-- Tickets table with enhanced features
CREATE TABLE IF NOT EXISTS tickets (
    id SERIAL PRIMARY KEY,
    user_email TEXT NOT NULL REFERENCES users(email),
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
    status TEXT CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')) DEFAULT 'open',
    category TEXT CHECK (category IN ('general', 'technical', 'billing', 'account', 'feature_request', 'bug_report')) DEFAULT 'general',
    assigned_to TEXT REFERENCES users(email),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL
);

-- Ticket comments table
CREATE TABLE IF NOT EXISTS ticket_comments (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    user_email TEXT NOT NULL REFERENCES users(email),
    comment TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories table for better organization
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    color TEXT DEFAULT '#6B7280',
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_tickets_user_email ON tickets(user_email);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(priority);
CREATE INDEX IF NOT EXISTS idx_tickets_category ON tickets(category);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned_to ON tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at);
CREATE INDEX IF NOT EXISTS idx_ticket_comments_ticket_id ON ticket_comments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_comments_user_email ON ticket_comments(user_email);

-- Insert default categories
INSERT INTO categories (name, description, color) VALUES
    ('General', 'General inquiries and requests', '#6B7280'),
    ('Technical', 'Technical support and IT issues', '#DC2626'),
    ('Billing', 'Billing and payment related issues', '#059669'),
    ('Account', 'Account management and access issues', '#7C3AED'),
    ('Feature Request', 'New feature suggestions', '#2563EB'),
    ('Bug Report', 'Software bugs and issues', '#EA580C')
ON CONFLICT (name) DO NOTHING;

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions (optional, depends on your setup)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO helpdesk_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO helpdesk_user;
