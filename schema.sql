-- Create the generations table
create table generations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  product_name text not null,
  description text not null,
  marketplace text not null,
  features text,
  tone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table generations enable row level security;

-- Create policy to allow users to see ONLY their own generations
create policy "Users can view their own generations"
  on generations for select
  using ( auth.uid() = user_id );

-- Create policy to allow users to insert ONLY their own generations
create policy "Users can insert their own generations"
  on generations for insert
  with check ( auth.uid() = user_id );
