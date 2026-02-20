-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Everyone can view active announcements" ON announcements;

-- Recreate SELECT policy
CREATE POLICY "Everyone can view active announcements" 
ON announcements FOR SELECT 
USING (is_active = true);

-- Add INSERT policy for admins
CREATE POLICY "Admins can insert announcements" 
ON announcements FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role IN ('admin', 'super_admin')
  )
);

-- Add UPDATE policy for admins
CREATE POLICY "Admins can update announcements" 
ON announcements FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role IN ('admin', 'super_admin')
  )
);

-- Add DELETE policy for admins
CREATE POLICY "Admins can delete announcements" 
ON announcements FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role IN ('admin', 'super_admin')
  )
);
