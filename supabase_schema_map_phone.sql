-- Function to manually map user by phone (Post-Signup)
-- Needed because the initial INSERT trigger might miss it if phone wasn't provided at sign up.

create or replace function public.manual_map_user_by_phone(target_phone text)
returns void as $$
declare
  current_user_id uuid;
begin
  -- Get ID of executing user
  current_user_id := auth.uid();
  
  -- Update friends table where phone matches
  update public.friends
  set linked_user_id = current_user_id
  where phone = target_phone 
    and linked_user_id is null;
    
  -- Also update the auth.users phone column if possible?
  -- Updating auth.users directly is restricted. Use Supabase Auth API for that.
  -- But we can assume the caller has handled the Auth metadata update.
end;
$$ language plpgsql security definer;
