CREATE TYPE public.app_role AS ENUM ('admin','user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own roles readable" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE TABLE public.galeria_fotos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  edicao text NOT NULL DEFAULT '2025',
  caminho text NOT NULL,
  alt text NOT NULL DEFAULT 'Foto da Ação Entre Amigos',
  ordem integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.galeria_fotos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.galeria_fotos TO authenticated;
GRANT ALL ON public.galeria_fotos TO service_role;
ALTER TABLE public.galeria_fotos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fotos publicas" ON public.galeria_fotos FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin insere fotos" ON public.galeria_fotos FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin edita fotos" ON public.galeria_fotos FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin remove fotos" ON public.galeria_fotos FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

ALTER PUBLICATION supabase_realtime ADD TABLE public.galeria_fotos;

CREATE POLICY "galeria leitura publica" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'galeria');
CREATE POLICY "galeria upload admin" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'galeria' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "galeria delete admin" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'galeria' AND public.has_role(auth.uid(),'admin'));