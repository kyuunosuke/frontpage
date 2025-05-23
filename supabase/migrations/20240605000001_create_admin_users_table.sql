-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add is_super_admin column to admin_users
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT false;

-- Enable row level security
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create policies for admin_users table
DROP POLICY IF EXISTS "Admin users can view all admin users" ON admin_users;
CREATE POLICY "Admin users can view all admin users"
  ON admin_users
  FOR SELECT
  USING (
    auth.uid() IN (SELECT user_id FROM admin_users)
  );

DROP POLICY IF EXISTS "Only super admins can insert admin users" ON admin_users;
CREATE POLICY "Only super admins can insert admin users"
  ON admin_users
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (SELECT user_id FROM admin_users WHERE is_super_admin = true)
  );

DROP POLICY IF EXISTS "Only super admins can update admin users" ON admin_users;
CREATE POLICY "Only super admins can update admin users"
  ON admin_users
  FOR UPDATE
  USING (
    auth.uid() IN (SELECT user_id FROM admin_users WHERE is_super_admin = true)
  );

DROP POLICY IF EXISTS "Only super admins can delete admin users" ON admin_users;
CREATE POLICY "Only super admins can delete admin users"
  ON admin_users
  FOR DELETE
  USING (
    auth.uid() IN (SELECT user_id FROM admin_users WHERE is_super_admin = true)
  );

-- Create policies for competitions table
DROP POLICY IF EXISTS "Admin users can view all competitions" ON competitions;
CREATE POLICY "Admin users can view all competitions"
  ON competitions
  FOR SELECT
  USING (
    auth.uid() IN (SELECT user_id FROM admin_users)
  );

DROP POLICY IF EXISTS "Admin users can insert competitions" ON competitions;
CREATE POLICY "Admin users can insert competitions"
  ON competitions
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (SELECT user_id FROM admin_users)
  );

DROP POLICY IF EXISTS "Admin users can update competitions" ON competitions;
CREATE POLICY "Admin users can update competitions"
  ON competitions
  FOR UPDATE
  USING (
    auth.uid() IN (SELECT user_id FROM admin_users)
  );

DROP POLICY IF EXISTS "Admin users can delete competitions" ON competitions;
CREATE POLICY "Admin users can delete competitions"
  ON competitions
  FOR DELETE
  USING (
    auth.uid() IN (SELECT user_id FROM admin_users)
  );

-- Add realtime support
alter publication supabase_realtime add table admin_users;