-- Function to safely increment generation count
create or replace function increment_generation_count(user_id uuid)
returns void as $$
begin
  update public.profiles
  set generation_count = generation_count + 1
  where id = user_id;
end;
$$ language plpgsql security definer;
