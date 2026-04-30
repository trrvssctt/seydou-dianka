-- Roles enum + table
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Admins view roles" ON public.user_roles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Leads
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  role TEXT,
  mission_type TEXT,
  budget TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a lead" ON public.leads FOR INSERT TO anon, authenticated
  WITH CHECK (
    char_length(name) BETWEEN 1 AND 100
    AND char_length(email) BETWEEN 3 AND 255
    AND char_length(message) BETWEEN 1 AND 2000
  );
CREATE POLICY "Admins view leads" ON public.leads FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update leads" ON public.leads FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete leads" ON public.leads FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Case studies
CREATE TABLE public.case_studies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number TEXT NOT NULL,
  badge TEXT,
  title_en TEXT NOT NULL,
  title_fr TEXT NOT NULL,
  subtitle TEXT,
  problem_en TEXT,
  problem_fr TEXT,
  solution_en TEXT,
  solution_fr TEXT,
  tech TEXT[] NOT NULL DEFAULT '{}',
  metrics JSONB NOT NULL DEFAULT '[]'::jsonb,
  testimonial_en TEXT,
  testimonial_fr TEXT,
  testimonial_author TEXT,
  order_index INT NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.case_studies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reads published case_studies" ON public.case_studies FOR SELECT TO anon, authenticated
  USING (published = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage case_studies" ON public.case_studies FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Workflows
CREATE TABLE public.workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en TEXT NOT NULL,
  title_fr TEXT NOT NULL,
  trigger_en TEXT,
  trigger_fr TEXT,
  steps_en TEXT[] NOT NULL DEFAULT '{}',
  steps_fr TEXT[] NOT NULL DEFAULT '{}',
  nodes TEXT[] NOT NULL DEFAULT '{}',
  status TEXT,
  exec_time TEXT,
  order_index INT NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reads published workflows" ON public.workflows FOR SELECT TO anon, authenticated
  USING (published = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage workflows" ON public.workflows FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE TRIGGER case_studies_updated BEFORE UPDATE ON public.case_studies
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER workflows_updated BEFORE UPDATE ON public.workflows
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();