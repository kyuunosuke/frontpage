-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Admin users can view all admin users" ON admin_users;
DROP POLICY IF EXISTS "Only super admins can insert admin users" ON admin_users;
DROP POLICY IF EXISTS "Only super admins can update admin users" ON admin_users;
DROP POLICY IF EXISTS "Only super admins can delete admin users" ON admin_users;

-- Allow public access for inserting admin users during signup
CREATE POLICY "Allow public insert to admin_users"
ON admin_users
FOR INSERT
TO authenticated, anon
WITH CHECK (true);

-- Allow authenticated users to view their own admin record
CREATE POLICY "Users can view their own admin record"
ON admin_users
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow super admins to manage other admin users
CREATE POLICY "Super admins can view all admin users"
ON admin_users
FOR SELECT
TO authenticated
USING (auth.uid() IN (SELECT user_id FROM admin_users WHERE is_super_admin = true));

CREATE POLICY "Super admins can update admin users"
ON admin_users
FOR UPDATE
TO authenticated
USING (auth.uid() IN (SELECT user_id FROM admin_users WHERE is_super_admin = true));

CREATE POLICY "Super admins can delete admin users"
ON admin_users
FOR DELETE
TO authenticated
USING (auth.uid() IN (SELECT user_id FROM admin_users WHERE is_super_admin = true));

-- Allow public access for inserting users during signup
DROP POLICY IF EXISTS "Allow public insert to users" ON users;
CREATE POLICY "Allow public insert to users"
ON users
FOR INSERT
TO authenticated, anon
WITH CHECK (true);

-- Allow users to view their own user record
DROP POLICY IF EXISTS "Users can view their own user record" ON users;
CREATE POLICY "Users can view their own user record"
ON users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Allow admins to view all users
DROP POLICY IF EXISTS "Admins can view all users" ON users;
CREATE POLICY "Admins can view all users"
ON users
FOR SELECT
TO authenticated
USING (auth.uid() IN (SELECT user_id FROM admin_users));
