
CREATE UNIQUE INDEX IF NOT EXISTS credit_tx_token_unique
  ON public.credit_transactions (motivo)
  WHERE motivo LIKE 'token:%';

CREATE OR REPLACE FUNCTION public.redeem_token_credits(_user uuid, _qty integer, _token text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE new_balance integer;
BEGIN
  IF _qty <= 0 OR _qty > 1000 THEN
    RAISE EXCEPTION 'Quantidade inválida' USING ERRCODE = 'P0001';
  END IF;

  -- Registro do token (falha por unique index se já usado)
  BEGIN
    INSERT INTO public.credit_transactions (user_id, delta, motivo)
    VALUES (_user, _qty, 'token:' || _token);
  EXCEPTION WHEN unique_violation THEN
    RAISE EXCEPTION 'Token já utilizado' USING ERRCODE = 'P0001';
  END;

  INSERT INTO public.credits (user_id, balance, plano)
  VALUES (_user, _qty, 'free')
  ON CONFLICT (user_id) DO UPDATE
    SET balance = public.credits.balance + EXCLUDED.balance,
        updated_at = now()
  RETURNING balance INTO new_balance;

  RETURN new_balance;
END;
$$;
