-- Add 'features' column if it's missing
alter table generations add column if not exists features text;

-- Add 'tone' column if it's missing
alter table generations add column if not exists tone text;

-- Force reload of Supabase schema cache
notify pgrst, 'reload config';
