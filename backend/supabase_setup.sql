CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar TEXT,
  google_id TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (for registration)
CREATE POLICY "Allow anonymous inserts" ON users
  FOR INSERT WITH CHECK (true);

-- Allow authenticated reads
CREATE POLICY "Allow authenticated reads" ON users
  FOR SELECT USING (true);
