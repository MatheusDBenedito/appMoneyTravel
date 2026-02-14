-- Add icon column to categories table
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT 'Wallet';

-- Update existing categories with default icons
UPDATE categories SET icon = 'Coffee' WHERE name IN ('Alimentação', 'Food', 'Restaurante', 'Lanche');
UPDATE categories SET icon = 'Car' WHERE name IN ('Transporte', 'Transport', 'Uber', 'Táxi', 'Combustível');
UPDATE categories SET icon = 'Home' WHERE name IN ('Hospedagem', 'Home', 'Hotel', 'Airbnb', 'Casa');
UPDATE categories SET icon = 'ShoppingBag' WHERE name IN ('Compras', 'Shopping', 'Mercado', 'Presentes');
UPDATE categories SET icon = 'Film' WHERE name IN ('Lazer', 'Entertainment', 'Passeio', 'Cinema');
UPDATE categories SET icon = 'Plane' WHERE name IN ('Passagem', 'Voo', 'Trem', 'Ônibus');
UPDATE categories SET icon = 'Heart' WHERE name IN ('Saúde', 'Health', 'Farmácia');
UPDATE categories SET icon = 'Wallet' WHERE icon IS NULL OR icon = '';
