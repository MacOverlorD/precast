-- Fix database schema for timestamp columns
-- This script changes INTEGER columns to BIGINT for timestamp fields

-- Drop existing tables and recreate them with correct schema
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS history CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS queue CASCADE;
DROP TABLE IF EXISTS cranes CASCADE;

-- Recreate tables with correct BIGINT types for timestamps
CREATE TABLE cranes (
  id TEXT PRIMARY KEY
);

CREATE TABLE queue (
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

CREATE TABLE bookings (
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

CREATE TABLE history (
  id TEXT PRIMARY KEY,
  crane TEXT NOT NULL,
  piece TEXT NOT NULL,
  start_ts BIGINT,
  end_ts BIGINT,
  duration_min INTEGER,
  status TEXT
);

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT CHECK(role IN ('engineer','manager','admin')) NOT NULL DEFAULT 'engineer',
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL
);

-- Insert default data
INSERT INTO cranes(id) VALUES
('CRANE 1'), ('CRANE 2'), ('CRANE 3')
ON CONFLICT (id) DO NOTHING;
