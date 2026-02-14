-- Create payment_methods table
CREATE TABLE IF NOT EXISTS payment_methods (
    name TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default values
INSERT INTO payment_methods (name) VALUES 
('Dinheiro'), ('Crédito'), ('Débito'), ('Pix')
ON CONFLICT (name) DO NOTHING;
