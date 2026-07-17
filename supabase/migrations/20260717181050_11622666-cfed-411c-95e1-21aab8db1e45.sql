CREATE TABLE public.obras (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  verification_code TEXT NOT NULL UNIQUE,
  titulo TEXT NOT NULL,
  genero TEXT,
  idioma TEXT,
  ano INTEGER,
  isrc TEXT,
  descricao TEXT,
  letra TEXT,
  co_autores JSONB NOT NULL DEFAULT '[]'::jsonb,
  hash_sha256 TEXT NOT NULL,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX obras_user_id_idx ON public.obras(user_id);
CREATE INDEX obras_verification_code_idx ON public.obras(verification_code);

GRANT SELECT ON public.obras TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.obras TO authenticated;
GRANT ALL ON public.obras TO service_role;

ALTER TABLE public.obras ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Obras são públicas para consulta" ON public.obras
  FOR SELECT USING (true);

CREATE POLICY "Autor pode inserir suas obras" ON public.obras
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Autor pode atualizar suas obras" ON public.obras
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Autor pode remover suas obras" ON public.obras
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_obras_updated_at
  BEFORE UPDATE ON public.obras
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();