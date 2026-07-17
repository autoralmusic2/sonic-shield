import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { z } from "zod";
import { ShieldCheck, Search as SearchIcon, AlertTriangle } from "lucide-react";

const searchSchema = z.object({ code: z.string().optional() });

export const Route = createFileRoute("/verificador")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Verificador de Autenticidade — AutoralMusic" },
      { name: "description", content: "Valide um registro autoral pelo código AM-XXXXXXXX-AAAA e consulte o hash SHA-256 da obra." },
      { property: "og:title", content: "Verificador de Autenticidade — AutoralMusic" },
      { property: "og:description", content: "Valide registros autorais com hash SHA-256 e código público." },
    ],
  }),
  component: Verificador,
});

type ObraPub = {
  verification_code: string;
  titulo: string;
  genero: string | null;
  idioma: string | null;
  ano: number | null;
  isrc: string | null;
  co_autores: { nome: string; participacao: number }[];
  hash_sha256: string;
  registered_at: string;
  user_id: string;
};

type Autor = { nome_completo: string | null; nome_artistico: string | null; slug: string | null };

function Verificador() {
  const { code: initial } = Route.useSearch();
  const [code, setCode] = useState(initial ?? "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ obra: ObraPub; autor: Autor | null } | null>(null);
  const [notFound, setNotFound] = useState(false);

  async function lookup(c: string) {
    const clean = c.trim().toUpperCase();
    if (!clean) return;
    setLoading(true);
    setNotFound(false);
    setResult(null);
    const { data: obra } = await supabase
      .from("obras")
      .select("verification_code, titulo, genero, idioma, ano, isrc, co_autores, hash_sha256, registered_at, user_id")
      .eq("verification_code", clean)
      .maybeSingle();
    if (!obra) { setNotFound(true); setLoading(false); return; }
    const { data: autor } = await supabase
      .from("profiles")
      .select("nome_completo, nome_artistico, slug")
      .eq("id", (obra as ObraPub).user_id)
      .maybeSingle();
    setResult({ obra: obra as ObraPub, autor: (autor as Autor | null) });
    setLoading(false);
  }

  useEffect(() => { if (initial) lookup(initial); }, [initial]);

  return (
    <SiteLayout>
      <section className="mx-auto max-w-3xl px-4 py-12">
        <p className="text-xs uppercase tracking-[0.3em] text-primary">Blindagem Autoral</p>
        <h1 className="mt-1 font-display text-3xl font-bold md:text-4xl">
          Verificador de <span className="text-gradient">Autenticidade</span>
        </h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Insira o código AM-XXXXXXXX-AAAA para consultar os dados públicos e o hash SHA-256 da obra registrada.
        </p>

        <form
          onSubmit={(e) => { e.preventDefault(); lookup(code); }}
          className="mt-6 flex gap-2"
        >
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="AM-XXXXXXXX-2026"
            className="flex-1 rounded-lg border border-border/60 bg-background/60 px-4 py-3 font-mono text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
          <button className="btn-neon inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold">
            <SearchIcon className="h-4 w-4" /> Verificar
          </button>
        </form>

        {loading && <p className="mt-6 text-sm text-muted-foreground">Consultando…</p>}

        {notFound && (
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-destructive" />
            <p>Nenhum registro encontrado para esse código.</p>
          </div>
        )}

        {result && (
          <article className="glow-border mt-6 rounded-2xl p-6">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <ShieldCheck className="h-3.5 w-3.5" /> Registro autêntico
            </div>
            <h2 className="font-display text-2xl font-bold">{result.obra.titulo}</h2>
            <p className="text-sm text-muted-foreground">
              por <span className="text-foreground">{result.autor?.nome_artistico || result.autor?.nome_completo || "Autor(a)"}</span>
            </p>

            <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
              <Row k="Código público" v={result.obra.verification_code} mono />
              <Row k="Registrado em" v={new Date(result.obra.registered_at).toLocaleString("pt-BR")} />
              <Row k="Gênero" v={result.obra.genero || "—"} />
              <Row k="Idioma / Ano" v={`${result.obra.idioma || "—"} · ${result.obra.ano || "—"}`} />
              {result.obra.isrc && <Row k="ISRC" v={result.obra.isrc} />}
              {result.obra.co_autores?.length > 0 && (
                <Row
                  k="Coautores"
                  v={result.obra.co_autores.map((c) => `${c.nome} (${c.participacao}%)`).join(", ")}
                />
              )}
            </dl>

            <div className="mt-5 rounded-lg border border-border/60 bg-background/40 p-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Hash SHA-256 da obra</p>
              <p className="mt-1 break-all font-mono text-xs text-accent">{result.obra.hash_sha256}</p>
            </div>
          </article>
        )}
      </section>
    </SiteLayout>
  );
}

function Row({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">{k}</dt>
      <dd className={mono ? "font-mono text-foreground" : "text-foreground"}>{v}</dd>
    </div>
  );
}