REVOKE EXECUTE ON FUNCTION public.has_role(UUID, app_role) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM anon, authenticated, public;
ALTER FUNCTION public.set_updated_at() SET search_path = public;