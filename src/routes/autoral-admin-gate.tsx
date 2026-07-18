import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useServerFn } from "@tanstack/react-start";
import { generateCreditToken } from "@/lib/credits.functions";
import { useState } from "react";
import { toast } from "sonner";
import { ShieldAlert, Copy, KeyRound, Loader2 } from "lucide-react";

export const Route = createFileRoute("/autoral-admin-gate")({
  head: () => ({
    meta: [
      { title: "Página não encontrada" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  validateSearch: (s: Record<string, unknown>) => ({ key: (s.key as string) || "" }),
  component: AdminGate,
});

function AdminGate() {
  const { key } = Route.useSearch();
  // Sem chave => renderiza uma página 404 falsa
  if (!key) return <FakeNotFound />;
  return <AdminPanel adminKey={key} />;
}

function FakeNotFound() {
  return (
    <SiteLayout>
      <section className="mx-auto max-w-xl px-4 py-24 text-center">
        <p className="font-display text-6xl font-bold text-muted-foreground">404</p>
        <h1 className="mt-3 font-display text-2xl">Página não encontrada</h1>
        <p className="mt-2 text-sm text-muted-foreground">O endereço acessado não existe ou foi movido.</p>
      </section>
    </SiteLayout>
  );
}

function AdminPanel({ adminKey }: { adminKey: string }) {
  const gen = useServerFn(generateCreditToken);
  const [cpf, setCpf] = useState("");
  const [qty, setQty] = useState(5);
  const [token, setToken] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [invalid, setInvalid] = useState(false);

  async function gerar() {
    setBusy(true);
    setToken(null);
    try {
      const r = await gen({ data: { key: adminKey, cpf, quantity: Number(qty) } });
      setToken(r.token);
      setInvalid(false);
    } catch (e: any) {
      if (/chave/i.test(e.message)) setInvalid(true);
      toast.error(e.message || "Falha ao gerar token");
    } finally {
      setBusy(false);
    }
  }

  if (invalid) return <FakeNotFound />;

  return (
    <SiteLayout>
      <section className="mx-auto max-w-2xl px-4 py-16">
        <div className="glow-border rounded-2xl p-8">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-gradient-primary shadow-neon">
              <ShieldAlert className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-primary">Painel Interno</p>
              <h1 className="font-display text-2xl font-bold">Gerador de Tokens</h1>
            </div>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Emite um token único amarrado ao CPF do cliente. O token será validado pelo próprio sistema no ato do resgate.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_140px]">
            <label className="block">
              <span className="mb-1 block text-xs uppercase tracking-wider text-muted-foreground">CPF do cliente</span>
              <input
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                placeholder="000.000.000-00"
                className="w-full rounded-lg border border-border/60 bg-background/60 px-3 py-2 font-mono text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs uppercase tracking-wider text-muted-foreground">Créditos</span>
              <input
                type="number"
                min={1}
                max={500}
                value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
                className="w-full rounded-lg border border-border/60 bg-background/60 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </label>
          </div>

          <button
            onClick={gerar}
            disabled={busy}
            className="btn-neon mt-5 inline-flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
            {busy ? "Gerando…" : "Gerar token"}
          </button>

          {token && (
            <div className="mt-6 rounded-xl border border-primary/40 bg-primary/5 p-4">
              <p className="text-[10px] uppercase tracking-widest text-primary">Token gerado</p>
              <div className="mt-2 flex items-center justify-between gap-3">
                <code className="break-all font-mono text-lg text-foreground">{token}</code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(token);
                    toast.success("Copiado");
                  }}
                  className="grid h-9 w-9 place-items-center rounded-lg border border-border/60 hover:border-primary hover:text-primary"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">
                Envie ao cliente. Uso único, amarrado ao CPF informado.
              </p>
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}