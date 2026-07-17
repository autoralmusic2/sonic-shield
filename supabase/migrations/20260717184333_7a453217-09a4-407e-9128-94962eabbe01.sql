
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS cep text,
  ADD COLUMN IF NOT EXISTS logradouro text,
  ADD COLUMN IF NOT EXISTS numero text,
  ADD COLUMN IF NOT EXISTS complemento text,
  ADD COLUMN IF NOT EXISTS bairro text,
  ADD COLUMN IF NOT EXISTS cidade text,
  ADD COLUMN IF NOT EXISTS uf text;

ALTER TABLE public.obras
  ADD COLUMN IF NOT EXISTS endereco jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS qualificacao jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS tipo_registro text NOT NULL DEFAULT 'obra_completa',
  ADD COLUMN IF NOT EXISTS arquivo_path text,
  ADD COLUMN IF NOT EXISTS arquivo_nome text,
  ADD COLUMN IF NOT EXISTS arquivo_tamanho bigint,
  ADD COLUMN IF NOT EXISTS arquivo_mime text,
  ADD COLUMN IF NOT EXISTS hash_sha512 text,
  ADD COLUMN IF NOT EXISTS hash_arquivo_sha256 text,
  ADD COLUMN IF NOT EXISTS hash_arquivo_sha512 text,
  ADD COLUMN IF NOT EXISTS ia_nivel text NOT NULL DEFAULT 'humana',
  ADD COLUMN IF NOT EXISTS ia_detalhes text,
  ADD COLUMN IF NOT EXISTS aceite_legal_at timestamptz;

CREATE OR REPLACE FUNCTION public.consume_credit(_user uuid, _motivo text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE new_balance integer;
BEGIN
  UPDATE public.credits
    SET balance = balance - 1, updated_at = now()
    WHERE user_id = _user AND balance > 0
    RETURNING balance INTO new_balance;
  IF new_balance IS NULL THEN
    RAISE EXCEPTION 'Saldo insuficiente' USING ERRCODE = 'P0001';
  END IF;
  INSERT INTO public.credit_transactions (user_id, delta, motivo)
    VALUES (_user, -1, _motivo);
  RETURN new_balance;
END;
$$;

REVOKE ALL ON FUNCTION public.consume_credit(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.consume_credit(uuid, text) TO authenticated;
