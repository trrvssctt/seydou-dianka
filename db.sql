-- =========================================
-- ENUM
-- =========================================
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- =========================================
-- FONCTIONS
-- =========================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END
$$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- =========================================
-- TABLE : profile  (singleton — identité publique)
-- =========================================
CREATE TABLE public.profile (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name    text NOT NULL DEFAULT 'Seydou DIANKA',
  title_en     text DEFAULT 'AI Automation Engineer',
  title_fr     text DEFAULT 'Ingénieur Automation IA',
  bio_en       text,
  bio_fr       text,
  email        text DEFAULT 'diankaseydou52@gmail.com',
  phone        text DEFAULT '+221 78 131 13 71',
  location     text DEFAULT 'Senegal · Remote worldwide',
  avatar_url   text,
  github_url   text,
  linkedin_url text,
  twitter_url  text,
  calendar_url text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profile ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reads profile"
  ON public.profile FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins manage profile"
  ON public.profile FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER profile_set_updated_at
  BEFORE UPDATE ON public.profile
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================
-- TABLE : user_roles  (rôles découplés des profils)
-- =========================================
CREATE TABLE public.user_roles (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role       public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========================================
-- TABLE : leads  (formulaire de contact)
-- =========================================
CREATE TABLE public.leads (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text NOT NULL,
  email        text NOT NULL,
  company      text,
  role         text,
  mission_type text,
  budget       text,
  message      text NOT NULL,
  status       text NOT NULL DEFAULT 'new',
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a lead"
  ON public.leads FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(name) BETWEEN 1 AND 100
    AND char_length(email) BETWEEN 3 AND 255
    AND char_length(message) BETWEEN 1 AND 2000
  );

CREATE POLICY "Admins view leads"
  ON public.leads FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update leads"
  ON public.leads FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete leads"
  ON public.leads FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =========================================
-- TABLE : case_studies  (études de cas / projets)
-- =========================================
CREATE TABLE public.case_studies (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number             text NOT NULL,
  badge              text,
  title_en           text NOT NULL,
  title_fr           text NOT NULL,
  subtitle           text,
  problem_en         text,
  problem_fr         text,
  solution_en        text,
  solution_fr        text,
  tech               text[] NOT NULL DEFAULT '{}',
  metrics            jsonb  NOT NULL DEFAULT '[]',
  testimonial_en     text,
  testimonial_fr     text,
  testimonial_author text,
  order_index        integer NOT NULL DEFAULT 0,
  published          boolean NOT NULL DEFAULT true,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.case_studies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reads published case_studies"
  ON public.case_studies FOR SELECT
  TO anon, authenticated
  USING (published = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage case_studies"
  ON public.case_studies FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER case_studies_updated
  BEFORE UPDATE ON public.case_studies
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================
-- TABLE : workflows  (automatisations n8n)
-- =========================================
CREATE TABLE public.workflows (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en    text NOT NULL,
  title_fr    text NOT NULL,
  trigger_en  text,
  trigger_fr  text,
  steps_en    text[] NOT NULL DEFAULT '{}',
  steps_fr    text[] NOT NULL DEFAULT '{}',
  nodes       text[] NOT NULL DEFAULT '{}',
  status      text,
  exec_time   text,
  order_index integer NOT NULL DEFAULT 0,
  published   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reads published workflows"
  ON public.workflows FOR SELECT
  TO anon, authenticated
  USING (published = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage workflows"
  ON public.workflows FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER workflows_updated
  BEFORE UPDATE ON public.workflows
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================
-- STORAGE : bucket public "avatars" (photo de profil)
-- =========================================
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

CREATE POLICY "Public can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Admins upload avatars"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update avatars"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'avatars' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete avatars"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'avatars' AND public.has_role(auth.uid(), 'admin'));
