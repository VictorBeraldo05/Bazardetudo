ALTER TABLE customers
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE customers
SET is_admin = TRUE
WHERE email = 'admin@bazardetudo.com';
