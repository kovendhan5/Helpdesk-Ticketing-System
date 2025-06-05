-- Add missing columns to tickets table
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS category TEXT CHECK (category IN ('general', 'technical', 'billing', 'account', 'feature_request', 'bug_report')) DEFAULT 'general';
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS assigned_to TEXT;  
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP NULL;

-- Update status constraint to include 'closed'
ALTER TABLE tickets DROP CONSTRAINT IF EXISTS tickets_status_check;
ALTER TABLE tickets ADD CONSTRAINT tickets_status_check CHECK (status IN ('open', 'in_progress', 'resolved', 'closed'));

-- Create ticket_comments table
CREATE TABLE IF NOT EXISTS ticket_comments (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    user_email TEXT NOT NULL REFERENCES users(email),
    comment TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    color TEXT DEFAULT '#6B7280',
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tickets_category ON tickets(category);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned_to ON tickets(assigned_to);
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

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_tickets_updated_at ON tickets;
CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
