-- Create tables for Money Travel App

-- 1. Wallets (Pessoas)
CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    budget NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Categories
CREATE TABLE categories (
    name TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Auto Shared Categories
CREATE TABLE auto_shared_categories (
    category_name TEXT PRIMARY KEY REFERENCES categories(name) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.1 Payment Methods
CREATE TABLE payment_methods (
    name TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Transactions (Despesas)
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    description TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    date TIMESTAMPTZ DEFAULT NOW(),
    category TEXT REFERENCES categories(name) ON DELETE SET NULL,
    payer UUID REFERENCES wallets(id) ON DELETE CASCADE, -- Link to Wallet ID
    is_shared BOOLEAN DEFAULT FALSE,
    payment_method TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Exchanges (Câmbio)
CREATE TABLE exchanges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    origin_currency TEXT NOT NULL,
    origin_amount NUMERIC NOT NULL,
    target_amount NUMERIC NOT NULL,
    rate NUMERIC NOT NULL,
    target_wallet TEXT, -- Can be a UUID or 'both'
    location TEXT,
    date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Default Data
INSERT INTO wallets (name, budget) VALUES ('Eu', 0), ('Esposa', 0);

INSERT INTO categories (name) VALUES 
('General'), ('Food'), ('Transport'), ('Home'), ('Shopping'), ('Entertainment');

INSERT INTO auto_shared_categories (category_name) VALUES 
('Food'), ('Transport'), ('Home');

INSERT INTO payment_methods (name) VALUES 
('Dinheiro'), ('Crédito'), ('Débito'), ('Pix');
