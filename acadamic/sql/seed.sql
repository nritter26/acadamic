-- ==============================================================
-- Departments
-- ==============================================================
CREATE TABLE IF NOT EXISTS departments (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT
);

INSERT INTO departments (id, name, location) VALUES
    (1, 'Engineering', 'New York'),
    (2, 'Marketing', 'San Francisco'),
    (3, 'Sales', 'Chicago'),
    (4, 'Human Resources', 'New York'),
    (5, 'Finance', 'Boston'),
    (6, 'Legal', 'Washington DC'),
    (7, 'Operations', 'Chicago');

-- ==============================================================
-- Employees
-- ==============================================================
CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    department_id INTEGER REFERENCES departments(id),
    salary REAL,
    hire_date TEXT,
    manager_id INTEGER
);

INSERT INTO employees (id, name, email, department_id, salary, hire_date, manager_id) VALUES
    (1, 'Alice Johnson', 'alice@company.com', 1, 95000, '2020-03-15', NULL),
    (2, 'Bob Smith', 'bob@company.com', 1, 85000, '2021-06-01', 1),
    (3, 'Charlie Brown', 'charlie@company.com', 2, 72000, '2022-01-10', 1),
    (4, 'Diana Prince', 'diana@company.com', 2, 68000, '2022-09-20', 3),
    (5, 'Eve Davis', 'eve@company.com', 3, 78000, '2020-11-05', 1),
    (6, 'Frank Miller', 'frank@company.com', 3, 65000, '2023-02-14', 5),
    (7, 'Grace Lee', 'grace@company.com', 4, 62000, '2021-04-22', 1),
    (8, 'Henry Wilson', 'henry@company.com', 5, 88000, '2019-08-30', 1),
    (9, 'Ivy Chen', 'ivy@company.com', 5, 82000, '2020-05-12', 8),
    (10, 'Jack Taylor', 'jack@company.com', 6, 91000, '2018-07-18', NULL),
    (11, 'Karen White', 'karen@company.com', 7, 70000, '2021-10-01', 10),
    (12, 'Leo Martinez', 'leo@company.com', 1, 88000, '2022-03-08', 1),
    (13, 'Mia Anderson', 'mia@company.com', 2, 71000, '2023-06-15', 3),
    (14, 'Noah Thompson', 'noah@company.com', 3, 64000, '2023-09-01', 5),
    (15, 'Olivia Garcia', 'olivia@company.com', 4, 60000, '2022-11-20', 7),
    (16, 'Peter Robinson', 'peter@company.com', 7, 73000, '2020-02-28', 11);

-- ==============================================================
-- Projects
-- ==============================================================
CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    budget REAL,
    start_date TEXT,
    end_date TEXT
);

INSERT INTO projects (id, name, budget, start_date, end_date) VALUES
    (1, 'Project Phoenix', 500000, '2024-01-15', '2024-12-31'),
    (2, 'Project Atlas', 350000, '2024-03-01', '2025-02-28'),
    (3, 'Project Nova', 200000, '2024-06-01', '2024-11-30'),
    (4, 'Project Orion', 750000, '2024-02-01', '2025-06-30'),
    (5, 'Project Vega', 150000, '2024-09-01', '2025-03-31'),
    (6, 'Project Helios', 600000, '2024-04-15', '2025-04-15');

-- ==============================================================
-- Employee-Project Assignments
-- ==============================================================
CREATE TABLE IF NOT EXISTS employee_projects (
    employee_id INTEGER REFERENCES employees(id),
    project_id INTEGER REFERENCES projects(id),
    role TEXT,
    hours_allocated INTEGER,
    PRIMARY KEY (employee_id, project_id)
);

INSERT INTO employee_projects (employee_id, project_id, role, hours_allocated) VALUES
    (1, 1, 'Lead', 200),
    (2, 1, 'Developer', 400),
    (2, 2, 'Developer', 200),
    (3, 2, 'Analyst', 300),
    (4, 2, 'Analyst', 250),
    (5, 3, 'Lead', 180),
    (6, 3, 'Developer', 350),
    (7, 4, 'Coordinator', 150),
    (8, 4, 'Lead', 220),
    (9, 4, 'Developer', 380),
    (10, 5, 'Lead', 160),
    (11, 5, 'Developer', 300),
    (12, 1, 'Developer', 350),
    (12, 6, 'Lead', 250),
    (13, 6, 'Analyst', 280),
    (14, 3, 'Developer', 320),
    (15, 6, 'Coordinator', 120),
    (16, 5, 'Developer', 280);

-- ==============================================================
-- Categories
-- ==============================================================
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT
);

INSERT INTO categories (id, name, description) VALUES
    (1, 'Electronics', 'Electronic devices and accessories'),
    (2, 'Clothing', 'Apparel and fashion items'),
    (3, 'Books', 'Printed and digital books'),
    (4, 'Home & Garden', 'Home improvement and garden supplies'),
    (5, 'Sports', 'Sports equipment and gear'),
    (6, 'Food & Beverages', 'Edible goods and drinks');

-- ==============================================================
-- Products
-- ==============================================================
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    price REAL,
    category_id INTEGER REFERENCES categories(id),
    stock INTEGER
);

INSERT INTO products (id, name, price, category_id, stock) VALUES
    (1, 'Wireless Headphones', 79.99, 1, 150),
    (2, 'Bluetooth Speaker', 49.99, 1, 200),
    (3, 'USB-C Hub', 34.99, 1, 300),
    (4, 'Cotton T-Shirt', 19.99, 2, 500),
    (5, 'Denim Jeans', 59.99, 2, 250),
    (6, 'Winter Jacket', 129.99, 2, 100),
    (7, 'JavaScript: The Good Parts', 29.99, 3, 75),
    (8, 'Clean Code', 39.99, 3, 120),
    (9, 'Design Patterns', 44.99, 3, 60),
    (10, 'Indoor Plant Pot', 24.99, 4, 180),
    (11, 'Garden Shears', 15.99, 4, 90),
    (12, 'LED Desk Lamp', 45.99, 4, 140),
    (13, 'Yoga Mat', 34.99, 5, 220),
    (14, 'Resistance Bands Set', 24.99, 5, 170),
    (15, 'Water Bottle', 14.99, 6, 400),
    (16, 'Coffee Beans 1lb', 12.99, 6, 85);

-- ==============================================================
-- Customers
-- ==============================================================
CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    city TEXT,
    signup_date TEXT
);

INSERT INTO customers (id, name, email, city, signup_date) VALUES
    (1, 'Acme Corp', 'orders@acme.com', 'New York', '2022-01-15'),
    (2, 'Globex Inc', 'info@globex.com', 'San Francisco', '2022-03-20'),
    (3, 'Initech', 'billing@initech.com', 'Austin', '2022-06-10'),
    (4, 'Hooli', 'sales@hooli.com', 'Palo Alto', '2023-01-05'),
    (5, 'Stark Industries', 'contact@stark.com', 'Los Angeles', '2023-02-14'),
    (6, 'Wayne Enterprises', 'procurement@wayne.com', 'Gotham', '2023-04-01'),
    (7, 'Umbrella Corp', 'orders@umbrella.com', 'Raccoon City', '2023-05-20');

-- ==============================================================
-- Orders
-- ==============================================================
CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id),
    order_date TEXT,
    status TEXT,
    total REAL
);

INSERT INTO orders (id, customer_id, order_date, status, total) VALUES
    (1, 1, '2024-01-10', 'delivered', 159.97),
    (2, 1, '2024-02-15', 'delivered', 89.98),
    (3, 2, '2024-01-20', 'delivered', 234.95),
    (4, 3, '2024-03-05', 'delivered', 44.99),
    (5, 4, '2024-03-10', 'shipped', 129.98),
    (6, 5, '2024-04-01', 'shipped', 59.99),
    (7, 6, '2024-04-15', 'processing', 194.97),
    (8, 7, '2024-05-01', 'processing', 74.98),
    (9, 1, '2024-05-10', 'pending', 109.98),
    (10, 2, '2024-05-15', 'pending', 49.99),
    (11, 3, '2024-05-20', 'pending', 174.96),
    (12, 4, '2024-06-01', 'shipped', 89.97);

-- ==============================================================
-- Order Items
-- ==============================================================
CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id),
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER,
    unit_price REAL
);

INSERT INTO order_items (id, order_id, product_id, quantity, unit_price) VALUES
    (1, 1, 1, 1, 79.99),
    (2, 1, 15, 2, 14.99),
    (3, 1, 16, 2, 12.99),
    (4, 2, 4, 3, 19.99),
    (5, 2, 13, 1, 34.99),
    (6, 3, 2, 1, 49.99),
    (7, 3, 5, 2, 59.99),
    (8, 3, 8, 1, 39.99),
    (9, 4, 9, 1, 44.99),
    (10, 5, 6, 1, 129.99),
    (11, 6, 5, 1, 59.99),
    (12, 7, 1, 1, 79.99),
    (13, 7, 3, 1, 34.99),
    (14, 7, 10, 1, 24.99),
    (15, 7, 15, 2, 14.99),
    (16, 8, 13, 1, 34.99),
    (17, 8, 15, 1, 14.99),
    (18, 8, 16, 1, 12.99),
    (19, 9, 7, 1, 29.99),
    (20, 9, 4, 2, 19.99),
    (21, 9, 13, 1, 34.99),
    (22, 10, 2, 1, 49.99),
    (23, 11, 5, 1, 59.99),
    (24, 11, 14, 3, 24.99),
    (25, 11, 15, 2, 14.99),
    (26, 12, 4, 2, 19.99),
    (27, 12, 15, 1, 14.99),
    (28, 12, 13, 1, 34.99);

-- ==============================================================
-- Reviews
-- ==============================================================
CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY,
    product_id INTEGER REFERENCES products(id),
    customer_id INTEGER REFERENCES customers(id),
    rating INTEGER,
    comment TEXT,
    review_date TEXT
);

INSERT INTO reviews (id, product_id, customer_id, rating, comment, review_date) VALUES
    (1, 1, 1, 5, 'Excellent sound quality!', '2024-01-20'),
    (2, 1, 3, 4, 'Great value for the price', '2024-03-10'),
    (3, 2, 2, 5, 'Love this speaker', '2024-02-01'),
    (4, 4, 1, 3, 'Decent shirt, runs small', '2024-02-20'),
    (5, 5, 4, 4, 'Great fit and quality', '2024-03-15'),
    (6, 7, 5, 5, 'Must read for any developer', '2024-04-05'),
    (7, 8, 2, 4, 'Very practical advice', '2024-01-25'),
    (8, 13, 6, 5, 'Perfect for daily yoga', '2024-04-20'),
    (9, 15, 7, 4, 'Keeps water cold all day', '2024-05-05'),
    (10, 16, 1, 5, 'Best coffee in town', '2024-05-15');

-- ==============================================================
-- Students
-- ==============================================================
CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    enrollment_year INTEGER
);

INSERT INTO students (id, name, email, enrollment_year) VALUES
    (1, 'Alice Wonder', 'alice.wonder@university.edu', 2022),
    (2, 'Bob Builder', 'bob.builder@university.edu', 2022),
    (3, 'Carol Crusher', 'carol.crusher@university.edu', 2023),
    (4, 'Dave Driver', 'dave.driver@university.edu', 2023),
    (5, 'Eve Explorer', 'eve.explorer@university.edu', 2024),
    (6, 'Frank Farmer', 'frank.farmer@university.edu', 2024),
    (7, 'Grace Gardener', 'grace.gardener@university.edu', 2024);

-- ==============================================================
-- Courses
-- ==============================================================
CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY,
    code TEXT NOT NULL,
    title TEXT NOT NULL,
    credits INTEGER,
    department_id INTEGER REFERENCES departments(id)
);

INSERT INTO courses (id, code, title, credits, department_id) VALUES
    (1, 'CS101', 'Introduction to Programming', 4, 1),
    (2, 'CS201', 'Data Structures', 4, 1),
    (3, 'CS301', 'Database Systems', 3, 1),
    (4, 'CS401', 'Algorithms', 4, 1),
    (5, 'MATH101', 'Calculus I', 4, NULL),
    (6, 'MATH201', 'Linear Algebra', 3, NULL),
    (7, 'ENG101', 'English Composition', 3, NULL),
    (8, 'BUS101', 'Business Fundamentals', 3, 3);

-- ==============================================================
-- Enrollments
-- ==============================================================
CREATE TABLE IF NOT EXISTS enrollments (
    id INTEGER PRIMARY KEY,
    student_id INTEGER REFERENCES students(id),
    course_id INTEGER REFERENCES courses(id),
    semester TEXT,
    grade TEXT,
    enrollment_date TEXT
);

INSERT INTO enrollments (id, student_id, course_id, semester, grade, enrollment_date) VALUES
    (1, 1, 1, 'Fall 2022', 'A', '2022-09-01'),
    (2, 1, 5, 'Fall 2022', 'A-', '2022-09-01'),
    (3, 1, 7, 'Fall 2022', 'B+', '2022-09-01'),
    (4, 2, 1, 'Fall 2022', 'B', '2022-09-01'),
    (5, 2, 5, 'Fall 2022', 'B-', '2022-09-01'),
    (6, 2, 7, 'Fall 2022', 'C+', '2022-09-01'),
    (7, 1, 2, 'Spring 2023', 'A', '2023-01-15'),
    (8, 1, 6, 'Spring 2023', 'A-', '2023-01-15'),
    (9, 2, 2, 'Spring 2023', 'B+', '2023-01-15'),
    (10, 3, 1, 'Fall 2023', 'A', '2023-09-01'),
    (11, 3, 5, 'Fall 2023', 'B+', '2023-09-01'),
    (12, 4, 1, 'Fall 2023', 'C', '2023-09-01'),
    (13, 4, 7, 'Fall 2023', 'C-', '2023-09-01'),
    (14, 3, 3, 'Spring 2024', 'A-', '2024-01-15'),
    (15, 4, 2, 'Spring 2024', 'B', '2024-01-15'),
    (16, 5, 1, 'Fall 2024', NULL, '2024-09-01'),
    (17, 5, 5, 'Fall 2024', NULL, '2024-09-01'),
    (18, 6, 1, 'Fall 2024', NULL, '2024-09-01'),
    (19, 7, 1, 'Fall 2024', NULL, '2024-09-01'),
    (20, 7, 7, 'Fall 2024', NULL, '2024-09-01');

-- ==============================================================
-- Blog Posts
-- ==============================================================
CREATE TABLE IF NOT EXISTS blog_posts (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    body TEXT,
    author_id INTEGER REFERENCES employees(id),
    published_at TEXT,
    view_count INTEGER
);

INSERT INTO blog_posts (id, title, body, author_id, published_at, view_count) VALUES
    (1, 'Getting Started with SQL', 'SQL is a powerful language for querying databases...', 1, '2024-01-10 09:00:00', 1520),
    (2, 'Advanced JOIN Techniques', 'Learn about INNER, LEFT, RIGHT, and FULL OUTER JOINs...', 2, '2024-02-05 10:30:00', 980),
    (3, 'Window Functions 101', 'Window functions allow you to perform calculations across rows...', 1, '2024-03-12 14:00:00', 2100),
    (4, 'Indexing Strategies', 'Proper indexing can dramatically improve query performance...', 8, '2024-04-01 08:45:00', 750),
    (5, 'CTEs vs Subqueries', 'When should you use a CTE over a subquery?...', 9, '2024-04-20 11:00:00', 630),
    (6, 'Query Optimization Tips', 'Tips and tricks for writing faster SQL queries...', 1, '2024-05-15 09:30:00', 1850);

-- ==============================================================
-- Comments
-- ==============================================================
CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY,
    post_id INTEGER REFERENCES blog_posts(id),
    commenter_name TEXT,
    body TEXT,
    created_at TEXT
);

INSERT INTO comments (id, post_id, commenter_name, body, created_at) VALUES
    (1, 1, 'SQLNewbie', 'Great article! Very helpful for beginners.', '2024-01-11 10:00:00'),
    (2, 1, 'DataWizard', 'Nice overview. You might also cover UNION next time.', '2024-01-12 15:30:00'),
    (3, 2, 'JoinMaster', 'Finally I understand LEFT JOINs! Thanks!', '2024-02-06 09:00:00'),
    (4, 2, 'CodeCraft', 'Could you add examples with multiple JOINs?', '2024-02-10 14:00:00'),
    (5, 3, 'AnalystPro', 'Window functions changed my life. Great post!', '2024-03-13 11:00:00'),
    (6, 3, 'SQLNewbie', 'Can you explain ROWS vs RANGE?', '2024-03-14 08:00:00'),
    (7, 4, 'DBA_Dave', 'Good advice on index maintenance.', '2024-04-02 10:00:00'),
    (8, 6, 'QueryMaster', 'Point #3 about EXPLAIN ANALYZE is gold!', '2024-05-16 09:00:00');

-- ==============================================================
-- Suppliers
-- ==============================================================
CREATE TABLE IF NOT EXISTS suppliers (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    contact_email TEXT,
    city TEXT,
    rating INTEGER
);

INSERT INTO suppliers (id, name, contact_email, city, rating) VALUES
    (1, 'TechSupply Co', 'sales@techsupply.com', 'Shenzhen', 5),
    (2, 'GlobalTextiles Inc', 'orders@globaltextiles.com', 'Mumbai', 4),
    (3, 'PrintWise Ltd', 'info@printwise.com', 'Hong Kong', 4),
    (4, 'GreenGrow Supplies', 'contact@greengrow.com', 'Amsterdam', 5),
    (5, 'SportEquip Direct', 'sales@ sportequip.com', 'Portland', 3),
    (6, 'FreshSource Foods', 'orders@freshsource.com', 'Chicago', 4);

-- ==============================================================
-- Purchase Orders
-- ==============================================================
CREATE TABLE IF NOT EXISTS purchase_orders (
    id INTEGER PRIMARY KEY,
    supplier_id INTEGER REFERENCES suppliers(id),
    order_date TEXT,
    expected_date TEXT,
    status TEXT
);

INSERT INTO purchase_orders (id, supplier_id, order_date, expected_date, status) VALUES
    (1, 1, '2024-01-05', '2024-01-20', 'received'),
    (2, 1, '2024-03-10', '2024-03-25', 'received'),
    (3, 2, '2024-02-01', '2024-02-20', 'received'),
    (4, 3, '2024-04-15', '2024-05-01', 'shipped'),
    (5, 4, '2024-05-01', '2024-05-20', 'shipped'),
    (6, 5, '2024-05-10', '2024-06-01', 'pending'),
    (7, 1, '2024-06-01', '2024-06-15', 'pending');

-- ==============================================================
-- Purchase Order Items
-- ==============================================================
CREATE TABLE IF NOT EXISTS purchase_order_items (
    id INTEGER PRIMARY KEY,
    po_id INTEGER REFERENCES purchase_orders(id),
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER,
    unit_cost REAL
);

INSERT INTO purchase_order_items (id, po_id, product_id, quantity, unit_cost) VALUES
    (1, 1, 1, 100, 45.00),
    (2, 1, 2, 200, 28.00),
    (3, 1, 3, 300, 18.00),
    (4, 2, 1, 150, 44.00),
    (5, 2, 12, 200, 22.00),
    (6, 3, 4, 500, 10.00),
    (7, 3, 5, 250, 32.00),
    (8, 4, 9, 200, 24.00),
    (9, 5, 10, 300, 14.00),
    (10, 5, 11, 150, 8.00),
    (11, 6, 13, 300, 18.00),
    (12, 6, 14, 200, 12.00),
    (13, 7, 1, 200, 43.00),
    (14, 7, 15, 500, 7.00);

-- ==============================================================
-- Accounts
-- ==============================================================
CREATE TABLE IF NOT EXISTS accounts (
    id INTEGER PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id),
    account_number TEXT NOT NULL,
    account_type TEXT,
    balance REAL,
    opened_date TEXT
);

INSERT INTO accounts (id, customer_id, account_number, account_type, balance, opened_date) VALUES
    (1, 1, 'ACC-1001', 'checking', 50000.00, '2022-01-15'),
    (2, 1, 'ACC-1002', 'savings', 150000.00, '2022-01-15'),
    (3, 2, 'ACC-2001', 'checking', 35000.00, '2022-03-20'),
    (4, 3, 'ACC-3001', 'checking', 25000.00, '2022-06-10'),
    (5, 4, 'ACC-4001', 'checking', 120000.00, '2023-01-05'),
    (6, 4, 'ACC-4002', 'savings', 300000.00, '2023-01-05'),
    (7, 5, 'ACC-5001', 'checking', 75000.00, '2023-02-14'),
    (8, 6, 'ACC-6001', 'checking', 200000.00, '2023-04-01'),
    (9, 7, 'ACC-7001', 'checking', 15000.00, '2023-05-20');

-- ==============================================================
-- Transactions
-- ==============================================================
CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY,
    account_id INTEGER REFERENCES accounts(id),
    transaction_date TEXT,
    amount REAL,
    type TEXT,
    description TEXT
);

INSERT INTO transactions (id, account_id, transaction_date, amount, type, description) VALUES
    (1, 1, '2024-01-05', 5000.00, 'deposit', 'Client payment'),
    (2, 1, '2024-01-10', -1200.00, 'withdrawal', 'Office supplies'),
    (3, 1, '2024-01-15', -2500.00, 'withdrawal', 'Software licenses'),
    (4, 1, '2024-02-01', 5000.00, 'deposit', 'Client payment'),
    (5, 1, '2024-02-10', -800.00, 'withdrawal', 'Utilities'),
    (6, 2, '2024-01-05', 2000.00, 'deposit', 'Interest payment'),
    (7, 2, '2024-02-05', 2000.00, 'deposit', 'Interest payment'),
    (8, 2, '2024-03-05', 2000.00, 'deposit', 'Interest payment'),
    (9, 3, '2024-01-10', 10000.00, 'deposit', 'Wire transfer'),
    (10, 3, '2024-01-20', -3000.00, 'withdrawal', 'Rent payment'),
    (11, 3, '2024-02-10', 10000.00, 'deposit', 'Wire transfer'),
    (12, 3, '2024-02-20', -3000.00, 'withdrawal', 'Rent payment'),
    (13, 4, '2024-03-01', 15000.00, 'deposit', 'Seed funding'),
    (14, 4, '2024-03-15', -500.00, 'withdrawal', 'Domain registration'),
    (15, 4, '2024-04-01', -2000.00, 'withdrawal', 'Hosting fees'),
    (16, 5, '2024-01-05', 25000.00, 'deposit', 'Investment round'),
    (17, 5, '2024-02-05', -5000.00, 'withdrawal', 'Equipment purchase'),
    (18, 5, '2024-03-05', -3000.00, 'withdrawal', 'Marketing expenses'),
    (19, 5, '2024-04-05', 25000.00, 'deposit', 'Investment round'),
    (20, 6, '2024-01-10', 5000.00, 'deposit', 'Transfer from checking'),
    (21, 6, '2024-02-10', 5000.00, 'deposit', 'Transfer from checking'),
    (22, 6, '2024-03-10', 5000.00, 'deposit', 'Transfer from checking'),
    (23, 7, '2024-04-01', 15000.00, 'deposit', 'Contract payment'),
    (24, 7, '2024-04-15', -2000.00, 'withdrawal', 'Office lease'),
    (25, 8, '2024-01-20', 50000.00, 'deposit', 'Initial deposit'),
    (26, 8, '2024-02-20', -10000.00, 'withdrawal', 'Payroll'),
    (27, 8, '2024-03-20', -5000.00, 'withdrawal', 'Inventory purchase'),
    (28, 8, '2024-04-20', 30000.00, 'deposit', 'Revenue deposit'),
    (29, 9, '2024-05-01', 10000.00, 'deposit', 'Initial deposit'),
    (30, 9, '2024-05-15', -500.00, 'withdrawal', 'Service fee');
