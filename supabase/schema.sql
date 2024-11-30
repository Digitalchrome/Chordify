-- Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  user_id uuid references auth.users on delete cascade not null,
  username text unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint username_length check (char_length(username) >= 3)
);

-- Create saved_progressions table
create table public.saved_progressions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  progression jsonb not null,
  voicings jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create voicing_presets table
create table public.voicing_presets (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  voicing_type text not null,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.saved_progressions enable row level security;
alter table public.voicing_presets enable row level security;

-- Create policies
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = user_id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = user_id);

create policy "Users can view their own progressions"
  on public.saved_progressions for select
  using (auth.uid() = user_id);

create policy "Users can insert their own progressions"
  on public.saved_progressions for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own progressions"
  on public.saved_progressions for update
  using (auth.uid() = user_id);

create policy "Users can delete their own progressions"
  on public.saved_progressions for delete
  using (auth.uid() = user_id);

create policy "Users can view their own presets"
  on public.voicing_presets for select
  using (auth.uid() = user_id);

create policy "Users can insert their own presets"
  on public.voicing_presets for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own presets"
  on public.voicing_presets for update
  using (auth.uid() = user_id);

create policy "Users can delete their own presets"
  on public.voicing_presets for delete
  using (auth.uid() = user_id);

-- Create function to handle user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, user_id, username)
  values (new.id, new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for new user creation
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
