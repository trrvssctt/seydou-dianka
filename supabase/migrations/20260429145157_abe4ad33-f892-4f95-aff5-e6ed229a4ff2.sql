
CREATE TABLE public.profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL DEFAULT 'Seydou DIANKA',
  title_en text DEFAULT 'AI Automation Engineer',
  title_fr text DEFAULT 'Ingénieur Automation IA',
  bio_en text,
  bio_fr text,
  email text DEFAULT 'diankaseydou52@gmail.com',
  phone text DEFAULT '+221 78 131 13 71',
  location text DEFAULT 'Senegal · Remote worldwide',
  avatar_url text,
  github_url text,
  linkedin_url text,
  twitter_url text,
  calendar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profile ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reads profile" ON public.profile FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage profile" ON public.profile FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE TRIGGER profile_set_updated_at BEFORE UPDATE ON public.profile
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.profile (full_name, email, phone) VALUES ('Seydou DIANKA', 'diankaseydou52@gmail.com', '+221 78 131 13 71');

-- Storage bucket for avatars
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

CREATE POLICY "Public can view avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Admins upload avatars" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update avatars" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete avatars" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND has_role(auth.uid(), 'admin'));
