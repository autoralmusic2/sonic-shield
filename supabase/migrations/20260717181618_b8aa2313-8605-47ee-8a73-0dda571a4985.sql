
-- Credits wallet per user
CREATE TABLE public.credits (
  user_id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 3,
  plano TEXT NOT NULL DEFAULT 'free',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.credits TO authenticated;
GRANT ALL ON public.credits TO service_role;

ALTER TABLE public.credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own credits" ON public.credits
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users insert own credits" ON public.credits
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own credits" ON public.credits
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Log of credit purchases / consumptions (for history UI)
CREATE TABLE public.credit_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  delta INTEGER NOT NULL,
  motivo TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.credit_transactions TO authenticated;
GRANT ALL ON public.credit_transactions TO service_role;

ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own tx" ON public.credit_transactions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users insert own tx" ON public.credit_transactions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Trigger to bootstrap credits row on signup (3 free credits)
CREATE OR REPLACE FUNCTION public.handle_new_user_credits()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.credits (user_id, balance, plano)
  VALUES (NEW.id, 3, 'free')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_credits ON auth.users;
CREATE TRIGGER on_auth_user_created_credits
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_credits();

-- Backfill for existing users
INSERT INTO public.credits (user_id, balance, plano)
SELECT id, 3, 'free' FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- Public read of profiles by slug for public portfolios
CREATE POLICY "Public read profiles by slug" ON public.profiles
  FOR SELECT TO anon, authenticated USING (slug IS NOT NULL);

GRANT SELECT ON public.profiles TO anon;
