-- Enable RLS on generations table if not enabled
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;

-- Drop existing delete policy if it exists to avoid conflicts
DROP POLICY IF EXISTS "Users can delete their own generations" ON generations;

-- Create a policy that allows users to delete rows where user_id matches their own ID
CREATE POLICY "Users can delete their own generations"
ON generations
FOR DELETE
USING (auth.uid() = user_id);
