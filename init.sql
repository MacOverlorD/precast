-- Create tables for precast management system

-- Cranes table
CREATE TABLE IF NOT EXISTS cranes (
  id TEXT PRIMARY KEY
);

-- Queue table
CREATE TABLE IF NOT EXISTS queue (
  crane_id TEXT,
  ord INTEGER,
  piece TEXT,
  note TEXT,
  status TEXT CHECK(status IN ('pending','working','success','error')) NOT NULL DEFAULT 'pending',
  started_at BIGINT,
  ended_at BIGINT,
  PRIMARY KEY(crane_id, ord),
  FOREIGN KEY(crane_id) REFERENCES cranes(id)
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  crane TEXT NOT NULL,
  item TEXT NOT NULL,
  requester TEXT NOT NULL,
  phone TEXT NOT NULL,
  purpose TEXT NOT NULL,
  start_ts BIGINT NOT NULL,
  end_ts BIGINT NOT NULL,
  note TEXT,
  status TEXT CHECK(status IN ('รอการอนุมัติ','อนุมัติ','ปฏิเสธ')) NOT NULL DEFAULT 'รอการอนุมัติ',
  created_at BIGINT NOT NULL
);

-- History table
CREATE TABLE IF NOT EXISTS history (
  id TEXT PRIMARY KEY,
  crane TEXT NOT NULL,
  piece TEXT NOT NULL,
  start_ts BIGINT,
  end_ts BIGINT,
  duration_min INTEGER,
  status TEXT
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT CHECK(role IN ('engineer','manager','admin')) NOT NULL DEFAULT 'engineer',
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL
);

-- Insert default cranes
INSERT INTO cranes (id) VALUES
  ('CRANE 1'),
  ('CRANE 2'),
  ('CRANE 3')
ON CONFLICT (id) DO NOTHING;

-- Fix column types for existing tables (if they exist with wrong types)
DO $$
BEGIN
    -- Alter queue table columns to BIGINT if they're not already
    BEGIN
        ALTER TABLE queue ALTER COLUMN started_at TYPE BIGINT;
    EXCEPTION
        WHEN undefined_column THEN null;
    END;

    BEGIN
        ALTER TABLE queue ALTER COLUMN ended_at TYPE BIGINT;
    EXCEPTION
        WHEN undefined_column THEN null;
    END;

    -- Alter bookings table columns to BIGINT if they're not already
    BEGIN
        ALTER TABLE bookings ALTER COLUMN start_ts TYPE BIGINT;
    EXCEPTION
        WHEN undefined_column THEN null;
    END;

    BEGIN
        ALTER TABLE bookings ALTER COLUMN end_ts TYPE BIGINT;
    EXCEPTION
        WHEN undefined_column THEN null;
    END;

    BEGIN
        ALTER TABLE bookings ALTER COLUMN created_at TYPE BIGINT;
    EXCEPTION
        WHEN undefined_column THEN null;
    END;

    -- Alter history table columns to BIGINT if they're not already
    BEGIN
        ALTER TABLE history ALTER COLUMN start_ts TYPE BIGINT;
    EXCEPTION
        WHEN undefined_column THEN null;
    END;

    BEGIN
        ALTER TABLE history ALTER COLUMN end_ts TYPE BIGINT;
    EXCEPTION
        WHEN undefined_column THEN null;
    END;

    -- Alter users table columns to BIGINT if they're not already
    BEGIN
        ALTER TABLE users ALTER COLUMN created_at TYPE BIGINT;
    EXCEPTION
        WHEN undefined_column THEN null;
    END;

    BEGIN
        ALTER TABLE users ALTER COLUMN updated_at TYPE BIGINT;
    EXCEPTION
        WHEN undefined_column THEN null;
    END;
END $$;

-- Insert default admin user
INSERT INTO users (id, username, password_hash, role, created_at, updated_at)
VALUES (
  'admin_' || ROUND(EXTRACT(EPOCH FROM NOW()) * 1000),
  'admin',
  '$2a$10$rOZ8kVqW7v7v7v7v7v7v7v7v7v7v7v7v7v7v7v7v7v7v7v7v7v7v7v7v7', -- admin123
  'admin',
  ROUND(EXTRACT(EPOCH FROM NOW()) * 1000),
  ROUND(EXTRACT(EPOCH FROM NOW()) * 1000)
)
ON CONFLICT (username) DO NOTHING;
