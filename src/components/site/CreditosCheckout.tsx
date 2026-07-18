import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { redeemCreditToken } from "@/lib/credits.functions";
import { toast } from "sonner";
import { Coins, MessageCircle, KeyRound, ShieldCheck, Loader2 } from "lucide-react";

const WHATSAPP_NUMBER = "5582999097909";
const UNIT_PRICE = 9.9;

const PLANOS = [
  { id: "p1", creditos: 1, destaque: false },
  { id: "p5", creditos: 5, destaque: true },
  { id: "p10", creditos: 10, destaque: false },
  { id: "p25", creditos: 25, destaque: false },
];

function fmtBRL(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function usedTokenKey(userId: string, token: string) {
  return `am_token_used:${userId}:${token}`;
}

export function CreditosCheckout({
  balance,
  onCredited,
  compact = false,
}: {
  balance: number | null;
  onCredited?: (newBalance: number) => void;
  compact?: boolean;
}) {
  const { user } = useSession();
  const [profile, setProfile] = useState<{ nome_completo?: string; documento?: string } | null>(null);
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);
  const redeem = useServerFn(redeemCreditToken);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("nome_completo, documento")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => setProfile(data as any));
  }, [user]);

  function waLink(qty: number) {
    const nome = profile?.nome_completo || "(preencha seu nome no perfil)";
    const cpf = profile?.documento || "(preencha seu CPF no perfil)";
    const total = fmtBRL(qty * UNIT_PRICE);
    const msg =
      `Olá! Quero adquirir *${qty} crédito(s)* na AutoralMusic.\n\n` +
      `👤 Nome: ${nome}\n` +
      `🪪 CPF: ${cpf}\n` +
      `💰 Valor total: ${total} (${qty} × ${fmtBRL(UNIT_PRICE)})\n\n` +
      `Por favor, me envie a chave Pix para liberação do saldo. Após o pagamento aguardo o token de ativação.`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  }

  async function ativar() {
    if (!user) return;
    const t = token.trim().toUpperCase();
    if (!t) return toast.error("Cole o token recebido");

    // 1) checagem local (sessionStorage) contra reuso na mesma sessão
    const key = usedTokenKey(user.id, t);
    if (typeof sessionStorage !== "undefined" && sessionStorage.getItem(key)) {
      return toast.error("Este token já foi utilizado");
    }

    setBusy(true);
    try {
      const res = await redeem({ data: { token: t } });
      if (typeof sessionStorage !== "undefined") sessionStorage.setItem(key, "1");
      toast.success(`+${res.added} crédito(s) ativados! Saldo: ${res.balance}`);
      setToken("");
      onCredited?.(res.balance);
    } catch (e: any) {
      toast.error(e.message || "Falha ao ativar token");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={compact ? "space-y-6" : "space-y-8"}>
      {!compact && (
        <div className="glow-border flex flex-wrap items-center justify-between gap-4 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-xl bg-gradient-primary shadow-neon">
              <Coins className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Saldo atual</p>
              <p className="font-display text-3xl font-bold">{balance ?? "—"}</p>
              <p className="text-xs text-muted-foreground">1 crédito = 1 registro de obra</p>
            </div>
          </div>
          <p className="max-w-sm text-xs text-muted-foreground">
            Cada crédito custa <strong className="text-foreground">{fmtBRL(UNIT_PRICE)}</strong>. Uma contribuição simbólica que
            mantém a AutoralMusic online.
          </p>
        </div>
      )}

      <div>
        <h2 className="font-display text-xl font-semibold">Escolha um plano</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Clique em <strong>Pedir dos planos</strong> — abrimos o WhatsApp com sua mensagem pronta. Após o Pix, você recebe
          um token de liberação para ativar aqui.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PLANOS.map((p) => {
            const total = p.creditos * UNIT_PRICE;
            return (
              <div
                key={p.id}
                className={`glow-border rounded-2xl p-5 ${p.destaque ? "ring-1 ring-primary" : ""}`}
              >
                {p.destaque && (
                  <span className="mb-2 inline-block rounded-full bg-primary/20 px-2 py-0.5 text-[10px] uppercase tracking-widest text-primary">
                    Popular
                  </span>
                )}
                <p className="font-display text-2xl font-bold text-gradient">
                  {p.creditos} <span className="text-base font-medium text-muted-foreground">créd.</span>
                </p>
                <p className="mt-1 text-3xl font-bold">{fmtBRL(total)}</p>
                <p className="text-[11px] text-muted-foreground">
                  {p.creditos} × {fmtBRL(UNIT_PRICE)}
                </p>
                <a
                  href={waLink(p.creditos)}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-neon mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold"
                >
                  <MessageCircle className="h-4 w-4" /> Pedir dos planos
                </a>
              </div>
            );
          })}
        </div>
      </div>

      <div className="glow-border rounded-2xl p-6">
        <div className="flex items-center gap-2 text-primary">
          <KeyRound className="h-4 w-4" />
          <h2 className="font-display text-lg font-semibold text-foreground">Insira o Token de Liberação</h2>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Formato: <span className="font-mono text-foreground">Q-XXXXXXXXXXXX</span> · válido apenas para o CPF cadastrado no seu perfil.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Ex.: 5-9AF3C21B0E77"
            className="w-full rounded-lg border border-border/60 bg-background/60 px-3 py-2 font-mono text-sm uppercase outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
          <button
            onClick={ativar}
            disabled={busy}
            className="btn-neon inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
            {busy ? "Validando…" : "Ativar"}
          </button>
        </div>
        <ul className="mt-4 space-y-1.5 text-[11px] text-muted-foreground">
          <li>🛡️ <strong className="text-foreground">Uso único:</strong> cada token é queimado após a ativação (sessão + banco).</li>
          <li>🔐 <strong className="text-foreground">Amarrado ao CPF:</strong> gerado por SHA-256; não funciona em outra conta.</li>
        </ul>
      </div>
    </div>
  );
}