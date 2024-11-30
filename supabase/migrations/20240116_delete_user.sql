-- Create a function to delete a user and their data
create or replace function public.delete_user(user_email text)
returns void
language plpgsql
security definer
as $$
declare
    v_user_id uuid;
begin
    -- Get the user ID from auth.users
    select id into v_user_id
    from auth.users
    where email = user_email;

    -- If user exists, delete their data
    if v_user_id is not null then
        -- Delete user's data from your app tables
        -- Add more delete statements here for other tables
        delete from auth.users where id = v_user_id;
    end if;
end;
$$;
