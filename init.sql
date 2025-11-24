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

-- Index on date
CREATE INDEX idx_transaction_date ON transactions(date);

INSERT INTO categories (type, name, color) VALUES
-- Income Categories (type = TRUE)
(TRUE, 'Salary', '#3D9970'),        -- Green for positive cash flow
(TRUE, 'Investments', '#2ECC40'),   -- Bright green for growth
(TRUE, 'Gift/Refund', '#85144B'),     -- Maroon
(TRUE, 'Freelance', '#FFDC00'),      -- Yellow

-- Outcome Categories (type = FALSE)
(FALSE, 'Rent/Mortgage', '#FF4136'),  -- Red for major outcomes
(FALSE, 'Groceries', '#0074D9'),     -- Blue for essentials
(FALSE, 'Transportation', '#01FF70'),-- Light green
(FALSE, 'Utilities', '#7FDBFF'),     -- Light blue
(FALSE, 'Entertainment', '#B10DC9'), -- Purple for discretionary spending
(FALSE, 'Debt Payments', '#F012BE'); -- Pink/Magenta for debt