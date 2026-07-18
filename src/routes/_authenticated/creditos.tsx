import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useSession } from "@/hooks/use-session";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";
import { CreditosCheckout } from "@/components/site/CreditosCheckout";

export const Route = createFileRoute("/_authenticated/creditos")({
  head: () => ({
    meta: [
      { title: "Créditos & Planos — AutoralMusic" },
      { name: "description", content: "Compre créditos via WhatsApp/Pix e ative com token seguro." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CreditosPage,
});

type Tx = { id: string; delta: number; motivo: string; created_at: string };

function CreditosPage() {
  const { user } = useSession();
  const [balance, setBalance] = useState<number | null>(null);
  const [tx, setTx] = useState<Tx[]>([]);

  async function load() {
    if (!user) return;
    const [{ data: w }, { data: t }] = await Promise.all([
      supabase.from("credits").select("balance").eq("user_id", user.id).maybeSingle(),
      supabase.from("credit_transactions").select("id, delta, motivo, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
    ]);
    setBalance((w?.balance as number) ?? 0);
    setTx((t as any) ?? []);
  }

  useEffect(() => {
    load();
  }, [user]);

  return (
    <SiteLayout>
      <section className="mx-auto max-w-5xl px-4 py-12">
        <Link to="/painel" className="mb-6 inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-3 w-3" /> Voltar ao painel
        </Link>
        <h1 className="font-display text-3xl font-bold text-gradient">Créditos & Planos</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Contribuição simbólica que ajuda a manter o site online. Pagamento via Pix pelo WhatsApp.
        </p>

        <div className="mt-8">
          <CreditosCheckout balance={balance} onCredited={() => load()} />
        </div>

        <h2 className="mt-10 font-display text-xl font-semibold">Histórico</h2>
        <div className="mt-4 space-y-2">
          {tx.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma movimentação ainda.</p>}
          {tx.map((t) => (
            <div key={t.id} className="glow-border flex items-center justify-between rounded-xl px-4 py-3 text-sm">
              <span className="truncate pr-3">{t.motivo}</span>
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