-- Create table for storing generated content history
create table if not exists generated_content (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  campaign_id uuid references campaigns(id),
  type text not null, -- 'ugc', 'static', 'email', 'message'
  title text,
  content jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies
alter table generated_content enable row level security;

create policy "Users can view their own content"
  on generated_content for select
  using (auth.uid() = user_id);

create policy "Users can insert their own content"
  on generated_content for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own content"
  on generated_content for update
  using (auth.uid() = user_id);

create policy "Users can delete their own content"
  on generated_content for delete
  using (auth.uid() = user_id);
