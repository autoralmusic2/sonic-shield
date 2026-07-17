import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useSession } from "@/hooks/use-session";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, Coins, Check } from "lucide-react";

export const Route = createFileRoute("/_authenticated/creditos")({
  head: () => ({
    meta: [
      { title: "Créditos & Planos — AutoralMusic" },
      { name: "description", content: "Recarregue tokens para registrar novas obras." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CreditosPage,
});

const PLANOS = [
  { id: "start", nome: "Start", creditos: 5, preco: "R$ 49", bonus: "" },
  { id: "pro", nome: "Pro", creditos: 15, preco: "R$ 129", bonus: "+2 grátis", destaque: true },
  { id: "studio", nome: "Studio", creditos: 40, preco: "R$ 299", bonus: "+8 grátis" },
];

type Tx = { id: string; delta: number; motivo: string; created_at: string };

function CreditosPage() {
  const { user } = useSession();
  const [wallet, setWallet] = useState<{ balance: number; plano: string } | null>(null);
  const [tx, setTx] = useState<Tx[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    if (!user) return;
    const [{ data: w }, { data: t }] = await Promise.all([
      supabase.from("credits").select("balance, plano").eq("user_id", user.id).maybeSingle(),
      supabase.from("credit_transactions").select("id, delta, motivo, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
    ]);
    setWallet(w as any);
    setTx((t as any) ?? []);
  }

  useEffect(() => {
    load();
  }, [user]);

  async function comprar(plano: (typeof PLANOS)[number]) {
    if (!user || !wallet) return;
    setBusy(plano.id);
    const novoSaldo = wallet.balance + plano.creditos;
    const { error: e1 } = await supabase.from("credits").upsert({ user_id: user.id, balance: novoSaldo, plano: plano.id });
    if (e1) {
      toast.error(e1.message);
      setBusy(null);
      return;
    }
    await supabase.from("credit_transactions").insert({ user_id: user.id, delta: plano.creditos, motivo: `Compra do plano ${plano.nome}` });
    toast.success(`+${plano.creditos} créditos adicionados (demo)`);
    setBusy(null);
    load();
  }

  return (
    <SiteLayout>
      <section className="mx-auto max-w-5xl px-4 py-12">
        <Link to="/painel" className="mb-6 inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-3 w-3" /> Voltar ao painel
        </Link>
        <h1 className="font-display text-3xl font-bold text-gradient">Créditos & Planos</h1>

        <div className="glow-border mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-xl bg-gradient-primary shadow-neon">
              <Coins className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Saldo atual</p>
              <p className="font-display text-3xl font-bold">{wallet?.balance ?? "—"}</p>
              <p className="text-xs text-muted-foreground">Plano: {wallet?.plano ?? "free"}</p>
            </div>
          </div>
          <p className="max-w-sm text-xs text-muted-foreground">
            Cada registro de música consome 1 crédito. Compras nesta página são simuladas — o gateway de pagamento entra na próxima fase.
          </p>
        </div>

        <h2 className="mt-10 font-display text-xl font-semibold">Escolher plano</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {PLANOS.map((p) => (
            <div
              key={p.id}
              className={`glow-border rounded-2xl p-6 ${p.destaque ? "ring-1 ring-primary" : ""}`}
            >
              {p.destaque && (
                <span className="mb-3 inline-block rounded-full bg-primary/20 px-2 py-0.5 text-[10px] uppercase tracking-widest text-primary">
                  Mais popular
                </span>
              )}
              <p className="font-display text-lg font-semibold">{p.nome}</p>
              <p className="mt-1 text-3xl font-bold text-gradient">{p.preco}</p>
              <p className="text-sm text-muted-foreground">
                {p.creditos} créditos {p.bonus && <span className="text-primary">{p.bonus}</span>}
              </p>
              <ul className="mt-4 space-y-1.5 text-xs text-muted-foreground">
                <li className="flex items-center gap-2"><Check className="h-3 w-3 text-primary" /> Certificado PDF com hash SHA-256</li>
                <li className="flex items-center gap-2"><Check className="h-3 w-3 text-primary" /> Verificação pública por QR code</li>
                <li className="flex items-center gap-2"><Check className="h-3 w-3 text-primary" /> Portfólio incluído</li>
              </ul>
              <Button className="btn-neon mt-5 w-full" disabled={busy === p.id} onClick={() => comprar(p)}>
                {busy === p.id ? "Processando…" : "Contratar"}
              </Button>
            </div>
          ))}
        </div>

        <h2 className="mt-10 font-display text-xl font-semibold">Histórico</h2>
        <div className="mt-4 space-y-2">
          {tx.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma movimentação ainda.</p>}
          {tx.map((t) => (
            <div key={t.id} className="glow-border flex items-center justify-between rounded-xl px-4 py-3 text-sm">
              <span>{t.motivo}</span>
              <span className={t.delta >= 0 ? "text-primary" : "text-destructive"}>
                {t.delta >= 0 ? "+" : ""}
                {t.delta}
              </span>
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}