-- ============================================================
-- V2__Sample_Data.sql
-- Sample books and members for development/testing
-- ============================================================

-- Sample Books
INSERT INTO BOOKS (id, isbn, title, author, publisher, publish_date, genre, description,
                   total_copies, available_copies, price, pages, status, created_at)
VALUES (BOOKS_SEQ.NEXTVAL, '978-0-06-112008-4', 'To Kill a Mockingbird', 'Harper Lee',
        'J. B. Lippincott & Co.', DATE '1960-07-11', 'Fiction',
        'A story of racial injustice and the destruction of innocence.',
        5, 5, 12.99, 324, 'AVAILABLE', SYSTIMESTAMP);

INSERT INTO BOOKS (id, isbn, title, author, publisher, publish_date, genre, description,
                   total_copies, available_copies, price, pages, status, created_at)
VALUES (BOOKS_SEQ.NEXTVAL, '978-0-7432-7356-5', '1984', 'George Orwell',
        'Secker & Warburg', DATE '1949-06-08', 'Dystopian Fiction',
        'A dystopian novel about totalitarianism and surveillance.',
        8, 8, 10.99, 328, 'AVAILABLE', SYSTIMESTAMP);

INSERT INTO BOOKS (id, isbn, title, author, publisher, publish_date, genre, description,
                   total_copies, available_copies, price, pages, status, created_at)
VALUES (BOOKS_SEQ.NEXTVAL, '978-0-7432-7357-2', 'The Great Gatsby', 'F. Scott Fitzgerald',
        'Scribner', DATE '1925-04-10', 'Fiction',
        'A portrait of the Jazz Age in all of its decadence and excess.',
        4, 4, 9.99, 180, 'AVAILABLE', SYSTIMESTAMP);

INSERT INTO BOOKS (id, isbn, title, author, publisher, publish_date, genre, description,
                   total_copies, available_copies, price, pages, status, created_at)
VALUES (BOOKS_SEQ.NEXTVAL, '978-0-316-76948-0', 'The Catcher in the Rye', 'J.D. Salinger',
        'Little, Brown and Company', DATE '1951-07-16', 'Fiction',
        'Coming-of-age story narrated by Holden Caulfield.',
        3, 3, 11.49, 277, 'AVAILABLE', SYSTIMESTAMP);

INSERT INTO BOOKS (id, isbn, title, author, publisher, publish_date, genre, description,
                   total_copies, available_copies, price, pages, status, created_at)
VALUES (BOOKS_SEQ.NEXTVAL, '978-0-7432-7358-9', 'Clean Code', 'Robert C. Martin',
        'Prentice Hall', DATE '2008-08-01', 'Technology',
        'A handbook of agile software craftsmanship.',
        6, 6, 34.99, 431, 'AVAILABLE', SYSTIMESTAMP);

INSERT INTO BOOKS (id, isbn, title, author, publisher, publish_date, genre, description,
                   total_copies, available_copies, price, pages, status, created_at)
VALUES (BOOKS_SEQ.NEXTVAL, '978-0-201-63361-0', 'Design Patterns', 'Gang of Four',
        'Addison-Wesley', DATE '1994-10-21', 'Technology',
        'Elements of reusable object-oriented software.',
        4, 4, 44.99, 395, 'AVAILABLE', SYSTIMESTAMP);

INSERT INTO BOOKS (id, isbn, title, author, publisher, publish_date, genre, description,
                   total_copies, available_copies, price, pages, status, created_at)
VALUES (BOOKS_SEQ.NEXTVAL, '978-0-14-028329-7', 'Of Mice and Men', 'John Steinbeck',
        'Covici Friede', DATE '1937-01-01', 'Fiction',
        'A novella about the dreams and friendship of two displaced migrant workers.',
        5, 5, 8.99, 112, 'AVAILABLE', SYSTIMESTAMP);

-- Sample Members
INSERT INTO MEMBERS (id, membership_number, first_name, last_name, email, phone, address,
                     membership_type, status, max_borrow_limit,
                     membership_start_date, membership_expiry_date, created_at)
VALUES (MEMBERS_SEQ.NEXTVAL, 'LIB-2024-000001', 'Arjun', 'Sharma',
        'arjun.sharma@email.com', '+919876543210', '12 MG Road, Bengaluru, Karnataka',
        'PREMIUM', 'ACTIVE', 10,
        DATE '2024-01-15', DATE '2025-01-15', SYSTIMESTAMP);

INSERT INTO MEMBERS (id, membership_number, first_name, last_name, email, phone, address,
                     membership_type, status, max_borrow_limit,
                     membership_start_date, membership_expiry_date, created_at)
VALUES (MEMBERS_SEQ.NEXTVAL, 'LIB-2024-000002', 'Priya', 'Nair',
        'priya.nair@email.com', '+919812345678', '45 Koramangala, Bengaluru, Karnataka',
        'STANDARD', 'ACTIVE', 5,
        DATE '2024-03-01', DATE '2025-03-01', SYSTIMESTAMP);

INSERT INTO MEMBERS (id, membership_number, first_name, last_name, email, phone, address,
                     membership_type, status, max_borrow_limit,
                     membership_start_date, membership_expiry_date, created_at)
VALUES (MEMBERS_SEQ.NEXTVAL, 'LIB-2024-000003', 'Rahul', 'Verma',
        'rahul.verma@email.com', '+919898765432', '78 Indiranagar, Bengaluru, Karnataka',
        'STUDENT', 'ACTIVE', 5,
        DATE '2024-06-01', DATE '2025-06-01', SYSTIMESTAMP);

COMMIT;
