-- Fix RLS policies for system_settings_pet table
-- This allows anonymous users to read public settings

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow anonymous read public settings" ON system_settings_pet;
DROP POLICY IF EXISTS "Allow authenticated read all settings" ON system_settings_pet;

-- Create policy to allow anonymous users to read public settings
CREATE POLICY "Allow anonymous read public settings" 
ON system_settings_pet 
FOR SELECT 
TO anon 
USING (is_public = true);

-- Create policy to allow authenticated users to read all settings
CREATE POLICY "Allow authenticated read all settings" 
ON system_settings_pet 
FOR SELECT 
TO authenticated 
USING (true);

-- Ensure RLS is enabled
ALTER TABLE system_settings_pet ENABLE ROW LEVEL SECURITY;

-- Verify the policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'system_settings_pet';