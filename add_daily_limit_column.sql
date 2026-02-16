-- Add last_reset_at column to track daily limit resets
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS last_reset_at timestamp with time zone DEFAULT now();

-- Update existing profiles to have a valid date
UPDATE profiles SET last_reset_at = now() WHERE last_reset_at IS NULL;
