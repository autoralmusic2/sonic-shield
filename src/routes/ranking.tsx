import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Trophy, Music4 } from "lucide-react";

export const Route = createFileRoute("/ranking")({
  head: () => ({
    meta: [
      { title: "Hit Parade — AutoralMusic" },
      { name: "description", content: "Ranking semanal das músicas registradas na AutoralMusic." },
      { property: "og:title", content: "Hit Parade — AutoralMusic" },
      { property: "og:description", content: "Top obras da comunidade." },
    ],
  }),
  component: Ranking,
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

function Ranking() {
  const [rows, setRows] = useState<Row[]>([]);
  const [autores, setAutores] = useState<Record<string, Autor>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("obras")
        .select("id, titulo, genero, verification_code, registered_at, user_id")
        .order("registered_at", { ascending: false })
        .limit(50);
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
      }
      setLoading(false);
    })();
  }, []);

  return (
    <SiteLayout>
      <section className="mx-auto max-w-5xl px-4 py-12">
        <p className="text-xs uppercase tracking-[0.3em] text-primary">Hit Parade</p>
        <h1 className="mt-1 font-display text-4xl font-bold">
          Top <span className="text-gradient">obras da comunidade</span>
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Ranking das obras registradas mais recentemente. Em breve, ordenação por engajamento na Fábrica de Canções.
        </p>

        {loading && <p className="mt-8 text-sm text-muted-foreground">Carregando…</p>}

        <ol className="mt-8 space-y-2">
          {rows.map((r, i) => {
            const a = autores[r.user_id];
            const nome = a?.nome_artistico || a?.nome_completo || "Autor(a)";
            return (
              <li key={r.id} className="glow-border flex items-center gap-4 rounded-xl p-4">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-primary font-display text-sm font-bold text-primary-foreground">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate font-display text-lg font-semibold">{r.titulo}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {a?.slug ? (
                      <Link to="/portfolio/$slug" params={{ slug: a.slug }} className="hover:text-primary">{nome}</Link>
                    ) : nome}
                    {r.genero ? ` · ${r.genero}` : ""}
                  </p>
                </div>
                <Link
                  to="/verificador"
                  search={{ code: r.verification_code }}
                  className="rounded-lg border border-border/60 px-3 py-1.5 text-xs hover:border-primary hover:text-primary"
                >
                  Verificar
                </Link>
              </li>
            );
          })}
          {!loading && rows.length === 0 && (
            <li className="rounded-xl border border-border/60 p-6 text-center text-sm text-muted-foreground">
              <Music4 className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
              Ainda não há obras registradas.
            </li>
          )}
        </ol>

        <div className="mt-10 flex items-center gap-3 text-xs text-muted-foreground">
          <Trophy className="h-4 w-4 text-accent" /> O ranking é atualizado automaticamente a cada novo registro.
        </div>
      </section>
    </SiteLayout>
  );
}