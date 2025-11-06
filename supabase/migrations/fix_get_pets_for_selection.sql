-- Fix get_pets_for_selection: use avatar_url and explicit casts to match return type

CREATE OR REPLACE FUNCTION public.get_pets_for_selection()
RETURNS TABLE (
  id UUID,
  name TEXT,
  breed TEXT,
  avatar_url TEXT,
  owner_name TEXT,
  owner_email TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id::UUID,
    p.name::TEXT,
    p.breed::TEXT,
    p.avatar_url::TEXT,
    prof.full_name::TEXT as owner_name,
    prof.email::TEXT as owner_email
  FROM public.pets_pet p
  LEFT JOIN public.profiles_pet prof ON p.owner_id = prof.id
  WHERE p.is_active = true
  ORDER BY p.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.get_pets_for_selection() TO authenticated;