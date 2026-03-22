-- ============================================================
-- V1__Initial_Schema.sql
-- Library Management System - Oracle Database Schema
-- ============================================================

-- ── Sequences ────────────────────────────────────────────────
CREATE SEQUENCE USERS_SEQ START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE BOOKS_SEQ START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE MEMBERS_SEQ START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE BORROWING_SEQ START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;

-- ── USERS Table ───────────────────────────────────────────────
CREATE TABLE USERS (
    id                      NUMBER PRIMARY KEY,
    username                VARCHAR2(50)  NOT NULL,
    password                VARCHAR2(255) NOT NULL,
    email                   VARCHAR2(150) NOT NULL,
    full_name               VARCHAR2(150),
    role                    VARCHAR2(20)  NOT NULL DEFAULT 'LIBRARIAN',
    enabled                 NUMBER(1)     NOT NULL DEFAULT 1,
    account_non_expired     NUMBER(1)     NOT NULL DEFAULT 1,
    account_non_locked      NUMBER(1)     NOT NULL DEFAULT 1,
    credentials_non_expired NUMBER(1)     NOT NULL DEFAULT 1,
    last_login              TIMESTAMP,
    created_at              TIMESTAMP     NOT NULL,
    updated_at              TIMESTAMP,
    CONSTRAINT uq_users_username UNIQUE (username),
    CONSTRAINT uq_users_email    UNIQUE (email),
    CONSTRAINT chk_users_role    CHECK (role IN ('ADMIN','LIBRARIAN'))
);

CREATE INDEX IDX_USERS_USERNAME ON USERS (username);
CREATE INDEX IDX_USERS_EMAIL    ON USERS (email);

-- ── BOOKS Table ───────────────────────────────────────────────
CREATE TABLE BOOKS (
    id               NUMBER PRIMARY KEY,
    isbn             VARCHAR2(20)   NOT NULL,
    title            VARCHAR2(255)  NOT NULL,
    author           VARCHAR2(150)  NOT NULL,
    publisher        VARCHAR2(100),
    publish_date     DATE,
    genre            VARCHAR2(50),
    description      VARCHAR2(2000),
    total_copies     NUMBER(4)      NOT NULL,
    available_copies NUMBER(4)      NOT NULL,
    cover_image_url  VARCHAR2(500),
    price            NUMBER(10,2),
    pages            NUMBER(5),
    status           VARCHAR2(20)   NOT NULL DEFAULT 'AVAILABLE',
    created_at       TIMESTAMP      NOT NULL,
    updated_at       TIMESTAMP,
    CONSTRAINT uq_books_isbn   UNIQUE (isbn),
    CONSTRAINT chk_books_status CHECK (status IN ('AVAILABLE','UNAVAILABLE','DISCONTINUED')),
    CONSTRAINT chk_books_copies CHECK (available_copies >= 0 AND available_copies <= total_copies)
);

CREATE INDEX IDX_BOOKS_ISBN   ON BOOKS (isbn);
CREATE INDEX IDX_BOOKS_TITLE  ON BOOKS (title);
CREATE INDEX IDX_BOOKS_AUTHOR ON BOOKS (author);
CREATE INDEX IDX_BOOKS_GENRE  ON BOOKS (genre);

-- ── MEMBERS Table ─────────────────────────────────────────────
CREATE TABLE MEMBERS (
    id                      NUMBER PRIMARY KEY,
    membership_number       VARCHAR2(20)  NOT NULL,
    first_name              VARCHAR2(75)  NOT NULL,
    last_name               VARCHAR2(75)  NOT NULL,
    email                   VARCHAR2(150) NOT NULL,
    phone                   VARCHAR2(20),
    address                 VARCHAR2(500),
    date_of_birth           DATE,
    membership_start_date   DATE,
    membership_expiry_date  DATE,
    membership_type         VARCHAR2(20)  NOT NULL DEFAULT 'STANDARD',
    status                  VARCHAR2(20)  NOT NULL DEFAULT 'ACTIVE',
    max_borrow_limit        NUMBER(2)     NOT NULL DEFAULT 5,
    created_at              TIMESTAMP     NOT NULL,
    updated_at              TIMESTAMP,
    CONSTRAINT uq_members_email        UNIQUE (email),
    CONSTRAINT uq_members_membership   UNIQUE (membership_number),
    CONSTRAINT chk_members_type        CHECK (membership_type IN ('STANDARD','PREMIUM','STUDENT','SENIOR')),
    CONSTRAINT chk_members_status      CHECK (status IN ('ACTIVE','SUSPENDED','EXPIRED','CANCELLED'))
);

CREATE INDEX IDX_MEMBERS_EMAIL         ON MEMBERS (email);
CREATE INDEX IDX_MEMBERS_MEMBERSHIP_NO ON MEMBERS (membership_number);
CREATE INDEX IDX_MEMBERS_STATUS        ON MEMBERS (status);

-- ── BORROWING_RECORDS Table ───────────────────────────────────
CREATE TABLE BORROWING_RECORDS (
    id             NUMBER PRIMARY KEY,
    member_id      NUMBER        NOT NULL,
    book_id        NUMBER        NOT NULL,
    borrow_date    DATE          NOT NULL,
    due_date       DATE          NOT NULL,
    return_date    DATE,
    status         VARCHAR2(20)  NOT NULL DEFAULT 'BORROWED',
    fine_amount    NUMBER(10,2)  DEFAULT 0,
    fine_paid      NUMBER(1)     DEFAULT 0,
    notes          VARCHAR2(500),
    renewal_count  NUMBER(2)     DEFAULT 0,
    created_at     TIMESTAMP     NOT NULL,
    updated_at     TIMESTAMP,
    CONSTRAINT fk_borrow_member FOREIGN KEY (member_id) REFERENCES MEMBERS(id),
    CONSTRAINT fk_borrow_book   FOREIGN KEY (book_id)   REFERENCES BOOKS(id),
    CONSTRAINT chk_borrow_status CHECK (status IN ('BORROWED','RETURNED','OVERDUE','RENEWED','LOST'))
);

CREATE INDEX IDX_BORROW_MEMBER   ON BORROWING_RECORDS (member_id);
CREATE INDEX IDX_BORROW_BOOK     ON BORROWING_RECORDS (book_id);
CREATE INDEX IDX_BORROW_STATUS   ON BORROWING_RECORDS (status);
CREATE INDEX IDX_BORROW_DUE_DATE ON BORROWING_RECORDS (due_date);

-- ── Seed Data ─────────────────────────────────────────────────
-- Default admin user  (password: Admin@123  BCrypt hash)
INSERT INTO USERS (id, username, password, email, full_name, role, enabled,
                   account_non_expired, account_non_locked, credentials_non_expired, created_at)
VALUES (USERS_SEQ.NEXTVAL, 'admin',
        '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
        'admin@library.com', 'System Administrator', 'ADMIN',
        1, 1, 1, 1, SYSTIMESTAMP);

-- Default librarian  (password: Lib@12345)
INSERT INTO USERS (id, username, password, email, full_name, role, enabled,
                   account_non_expired, account_non_locked, credentials_non_expired, created_at)
VALUES (USERS_SEQ.NEXTVAL, 'librarian',
        '$2a$10$EqKCCMSFYAaom/mEWkMxNOFJ4m8FwCtiyT7CtVbQrxMiKSmzCmzCK',
        'librarian@library.com', 'Head Librarian', 'LIBRARIAN',
        1, 1, 1, 1, SYSTIMESTAMP);

COMMIT;
