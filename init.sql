-- init.sql

-- Create Category table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    type BOOLEAN NOT NULL,
    name VARCHAR(100) NOT NULL,
    color CHAR(7)
);

-- Create Transaction table
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    type BOOLEAN NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    category_id INT REFERENCES categories(id) ON DELETE SET NULL,
    description TEXT,
    date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create Debt table
CREATE TABLE debts (
    id SERIAL PRIMARY KEY,
    type BOOLEAN NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    category_id INT REFERENCES categories(id) ON DELETE SET NULL,
    transaction_id INT references transactions(id) on delete set NULL,
    person TEXT NOT NULL,
    description TEXT,
    date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status BOOLEAN NOT NULL
)

-- Index on date
CREATE INDEX idx_transaction_date ON transactions(date);

INSERT INTO categories (type, name, color) VALUES
-- Income Categories (type = TRUE)
(FALSE, 'Salary', '#3D9970'),        -- Green for positive cash flow
(FALSE, 'Investments', '#2ECC40'),   -- Bright green for growth
(FALSE, 'Gift/Refund', '#85144B'),     -- Maroon
(FALSE, 'Freelance', '#FFDC00'),      -- Yellow

-- Expense Categories (type = FALSE)
(TRUE, 'Rent/Mortgage', '#FF4136'),  -- Red for major expenses
(TRUE, 'Groceries', '#0074D9'),     -- Blue for essentials
(TRUE, 'Transportation', '#01FF70'),-- Light green
(TRUE, 'Utilities', '#7FDBFF'),     -- Light blue
(TRUE, 'Entertainment', '#B10DC9'), -- Purple for discretionary spending
(TRUE, 'Debt Payments', '#F012BE'); -- Pink/Magenta for debt

SELECT id, name, type, color FROM categories WHERE type = true;

commit;