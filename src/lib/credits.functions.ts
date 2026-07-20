import { createServerFn } from "@tanstack/react-start";
import { createHash } from "node:crypto";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

function onlyDigits(s: string) {
  return (s || "").replace(/\D/g, "");
}

function computeTokenHash(cpfDigits: string, qty: number, secret: string) {
  const h = createHash("sha256")
    .update(`${cpfDigits}|${qty}|${secret}`, "utf8")
    .digest("hex")
    .toUpperCase();
  return h.slice(0, 12);
}

/**
 * Admin-only token generation. The admin key never leaves the server —
 * the caller must send the same key stored in AUTORAL_ADMIN_KEY.
 */
export const generateCreditToken = createServerFn({ method: "POST" })
  .inputValidator((data: { key: string; cpf: string; quantity: number }) => data)
  .handler(async ({ data }) => {
    const secret = process.env.AUTORAL_ADMIN_KEY || "HLC231920";
    if (data.key !== secret) throw new Error("Chave de administrador inválida");

    const cpf = onlyDigits(data.cpf);
    if (cpf.length !== 11) throw new Error("CPF inválido (11 dígitos)");

    const qty = Number(data.quantity);
    if (!Number.isInteger(qty) || qty < 1 || qty > 500) {
      throw new Error("Quantidade inválida (1 a 500)");
    }

    const hash = computeTokenHash(cpf, qty, secret);
    return { token: `${qty}-${hash}`, cpf, quantity: qty };
  });

/**
 * Authenticated redeem. Reads the user's CPF from the profile,
 * recomputes the hash, and — if valid — atomically credits the wallet.
 * Reuse is blocked by a unique index on credit_transactions.motivo.
 */
export const redeemCreditToken = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { token: string }) => data)
  .handler(async ({ data, context }) => {
    const secret = process.env.AUTORAL_ADMIN_KEY || "HLC231920";

    const token = (data.token || "").trim().toUpperCase();
    const match = token.match(/^(\d{1,3})-([A-F0-9]{12})$/);
    if (!match) throw new Error("Formato de token inválido");
    const qty = parseInt(match[1], 10);
    const hashPart = match[2];

    const { supabase, userId } = context;
    const { data: profile, error: pErr } = await supabase
      .from("profiles")
      .select("documento")
      .eq("id", userId)
      .maybeSingle();
    if (pErr) throw pErr;

    const cpf = onlyDigits(profile?.documento || "");
    if (cpf.length !== 11) {
      throw new Error("Cadastre seu CPF no perfil antes de ativar tokens");
    }

    const expected = computeTokenHash(cpf, qty, secret);
    if (expected !== hashPart) {
      throw new Error("Token inválido para este CPF");
    }

    const { data: newBalance, error: rErr } = await supabase.rpc("redeem_token_credits", {
      _user: userId,
      _qty: qty,
      _token: token,
    });
    if (rErr) {
      // Postgres unique_violation → mensagem amigável
      if ((rErr as any).code === "P0001" || /já utilizado/i.test(rErr.message)) {
        throw new Error("Este token já foi utilizado");
      }
      throw rErr;
    }

    return { balance: newBalance as number, added: qty };
  });