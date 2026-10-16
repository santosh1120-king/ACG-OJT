-- ============================================
-- ACG OJT - Login Page Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar TEXT,
  google_id TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);

-- 3. Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 4. Policies
CREATE POLICY "Allow inserts" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow reads" ON users FOR SELECT USING (true);
CREATE POLICY "Allow updates" ON users FOR UPDATE USING (true);

-- 5. Auto-update trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- AUTONOMOUS CODING AGENT TABLES
-- ============================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  repository_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS requirements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS agent_runs (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  requirement TEXT NOT NULL,
  status TEXT NOT NULL,
  current_agent TEXT NOT NULL,
  current_task_id TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0,
  approval_state TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agent_run_id UUID REFERENCES agent_runs(id) ON DELETE CASCADE,
  task_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  dependencies JSONB NOT NULL DEFAULT '[]',
  priority INTEGER NOT NULL DEFAULT 1,
  acceptance_criteria JSONB NOT NULL DEFAULT '[]',
  estimated_complexity TEXT NOT NULL,
  validation_commands JSONB NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'pending',
  UNIQUE(agent_run_id, task_id)
);

CREATE TABLE IF NOT EXISTS agent_actions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agent_run_id UUID REFERENCES agent_runs(id) ON DELETE CASCADE,
  agent TEXT NOT NULL,
  action_type TEXT NOT NULL,
  result JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS approvals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agent_run_id UUID REFERENCES agent_runs(id) ON DELETE CASCADE,
  approved BOOLEAN NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS artifacts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agent_run_id UUID REFERENCES agent_runs(id) ON DELETE CASCADE,
  artifact_type TEXT NOT NULL,
  name TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value JSONB NOT NULL DEFAULT '{}',
  UNIQUE(project_id, key)
);

CREATE INDEX IF NOT EXISTS idx_agent_runs_project_id ON agent_runs(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_agent_run_id ON tasks(agent_run_id);
CREATE INDEX IF NOT EXISTS idx_agent_actions_run_id ON agent_actions(agent_run_id);
