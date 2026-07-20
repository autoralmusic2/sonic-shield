import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Search as SearchIcon } from "lucide-react";

const GENEROS = ["", "Sertanejo", "Pop", "Trap", "Funk", "MPB", "Rock", "R&B", "Eletrônico", "Reggae", "Gospel", "Outros"];

export const Route = createFileRoute("/busca")({
  head: () => ({
    meta: [
      { title: "Busca Inteligente — AutoralMusic" },
      { name: "description", content: "Pesquise obras por título, trechos de letra e filtre por gênero." },
      { property: "og:title", content: "Busca Inteligente — AutoralMusic" },
      { property: "og:description", content: "Descubra obras protegidas na AutoralMusic." },
    ],
  }),
  component: Busca,
});

type Row = {
  id: string;
  titulo: string;
  genero: string | null;
  verification_code: string;
  registered_at: string;
  user_id: string;
};
type Autor = { id: string; nome_artistico: string | null; nome_completo: string | null; slug: string | null };

function Busca() {
  const [q, setQ] = useState("");
  const [genero, setGenero] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [autores, setAutores] = useState<Record<string, Autor>>({});
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    let query = supabase
      .from("obras")
      .select("id, titulo, genero, verification_code, registered_at, user_id")
      .order("registered_at", { ascending: false })
      .limit(60);
    if (q.trim()) {
      const term = `%${q.trim()}%`;
      query = query.or(`titulo.ilike.${term},letra.ilike.${term},verification_code.ilike.${term}`);
    }
    if (genero) query = query.eq("genero", genero);
    const { data } = await query;
    const list = (data as Row[]) || [];
    setRows(list);
    const ids = Array.from(new Set(list.map((r) => r.user_id)));
    if (ids.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, nome_artistico, nome_completo, slug")
        .in("id", ids);
      const map: Record<string, Autor> = {};
      (profs || []).forEach((p: any) => (map[p.id] = p));
      setAutores(map);
    } else setAutores({});
    setLoading(false);
  }

  useEffect(() => { run(); }, []);

  return (
    <SiteLayout>
      <section className="mx-auto max-w-5xl px-4 py-12">
        <p className="text-xs uppercase tracking-[0.3em] text-primary">Busca Inteligente</p>
        <h1 className="mt-1 font-display text-4xl font-bold">
          Encontre <span className="text-gradient">obras protegidas</span>
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Pesquise por título, trechos da letra ou código de verificação. Filtre por gênero para refinar.
        </p>

        <form
          onSubmit={(e) => { e.preventDefault(); run(); }}
          className="mt-6 flex flex-col gap-3 sm:flex-row"
        >
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Ex.: sertão, AM-XXXX, trecho de letra…"
            className="flex-1 rounded-lg border border-border/60 bg-background/60 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
          <select
            value={genero}
            onChange={(e) => setGenero(e.target.value)}
            className="rounded-lg border border-border/60 bg-background/60 px-3 py-3 text-sm outline-none focus:border-primary"
          >
            {GENEROS.map((g) => <option key={g} value={g}>{g || "Todos os gêneros"}</option>)}
          </select>
          <button className="btn-neon inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold">
            <SearchIcon className="h-4 w-4" /> Buscar
          </button>
        </form>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {loading && <p className="text-sm text-muted-foreground">Buscando…</p>}
          {!loading && rows.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhuma obra encontrada.</p>
          )}
          {rows.map((r) => {
            const a = autores[r.user_id];
            const nome = a?.nome_artistico || a?.nome_completo || "Autor(a)";
            return (
              <article key={r.id} className="glow-border rounded-xl p-4">
                <p className="font-display text-lg font-semibold">{r.titulo}</p>
                <p className="text-xs text-muted-foreground">
                  {a?.slug ? (
                    <Link to="/portfolio/$slug" params={{ slug: a.slug }} className="hover:text-primary">{nome}</Link>
                  ) : nome}
                  {r.genero ? ` · ${r.genero}` : ""}
                </p>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="font-mono text-muted-foreground">{r.verification_code}</span>
                  <Link
                    to="/verificador"
                    search={{ code: r.verification_code }}
                    className="rounded-lg border border-border/60 px-3 py-1 hover:border-primary hover:text-primary"
                  >
                    Verificar
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </SiteLayout>
  );
}