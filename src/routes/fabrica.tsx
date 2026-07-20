import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Radio, ThumbsUp, ThumbsDown, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/fabrica")({
  head: () => ({
    meta: [
      { title: "Fábrica de Canções — AutoralMusic" },
      { name: "description", content: "Rádio pública ao vivo de obras registradas com curtir/rejeitar." },
      { property: "og:title", content: "Fábrica de Canções — AutoralMusic" },
      { property: "og:description", content: "Descubra e vote em obras inéditas registradas." },
    ],
  }),
  component: Fabrica,
});

type Row = {
  id: string;
  titulo: string;
  genero: string | null;
  tipo_registro: string | null;
  verification_code: string;
  registered_at: string;
  user_id: string;
};
type Autor = { id: string; nome_artistico: string | null; nome_completo: string | null; slug: string | null };

function loadVotes(): Record<string, { up: number; down: number }> {
  if (typeof localStorage === "undefined") return {};
  try { return JSON.parse(localStorage.getItem("am_votes") || "{}"); } catch { return {}; }
}
function saveVotes(v: Record<string, { up: number; down: number }>) {
  try { localStorage.setItem("am_votes", JSON.stringify(v)); } catch {}
}

function Fabrica() {
  const [rows, setRows] = useState<Row[]>([]);
  const [autores, setAutores] = useState<Record<string, Autor>>({});
  const [votes, setVotes] = useState<Record<string, { up: number; down: number }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setVotes(loadVotes());
    (async () => {
      const { data } = await supabase
        .from("obras")
        .select("id, titulo, genero, tipo_registro, verification_code, registered_at, user_id")
        .order("registered_at", { ascending: false })
        .limit(30);
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

  function vote(id: string, kind: "up" | "down") {
    const next = { ...votes, [id]: { up: votes[id]?.up || 0, down: votes[id]?.down || 0 } };
    next[id][kind] += 1;
    setVotes(next);
    saveVotes(next);
  }

  return (
    <SiteLayout>
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-lg bg-gradient-primary shadow-neon animate-neon-pulse">
            <Radio className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-primary">Ao vivo agora</p>
            <h1 className="font-display text-3xl font-bold md:text-4xl">
              Fábrica de <span className="text-gradient">Canções</span>
            </h1>
          </div>
        </div>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Rádio pública das obras registradas na AutoralMusic. Curta ou rejeite para ajudar a impulsionar o ranking Hit Parade.
          O áudio permanece protegido — apenas os metadados são exibidos publicamente.
        </p>

        {loading && <p className="mt-8 text-sm text-muted-foreground">Carregando fila…</p>}

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((r) => {
            const a = autores[r.user_id];
            const nome = a?.nome_artistico || a?.nome_completo || "Autor(a)";
            const v = votes[r.id] || { up: 0, down: 0 };
            return (
              <article key={r.id} className="glow-border rounded-2xl p-5">
                <div className="mb-3 flex items-center gap-2 text-[10px] uppercase tracking-widest text-primary">
                  <ShieldCheck className="h-3.5 w-3.5" /> Protegido
                </div>
                <h2 className="font-display text-lg font-semibold">{r.titulo}</h2>
                <p className="text-xs text-muted-foreground">
                  {a?.slug ? (
                    <Link to="/portfolio/$slug" params={{ slug: a.slug }} className="hover:text-primary">{nome}</Link>
                  ) : nome}
                  {r.genero ? ` · ${r.genero}` : ""}
                </p>
                <p className="mt-3 font-mono text-[10px] text-muted-foreground">{r.verification_code}</p>
                <div className="mt-4 flex items-center justify-between">
                  <button
                    onClick={() => vote(r.id, "up")}
                    className="inline-flex items-center gap-1 rounded-lg border border-border/60 px-3 py-1.5 text-xs hover:border-primary hover:text-primary"
                  >
                    <ThumbsUp className="h-3.5 w-3.5" /> {v.up}
                  </button>
                  <button
                    onClick={() => vote(r.id, "down")}
                    className="inline-flex items-center gap-1 rounded-lg border border-border/60 px-3 py-1.5 text-xs hover:border-destructive hover:text-destructive"
                  >
                    <ThumbsDown className="h-3.5 w-3.5" /> {v.down}
                  </button>
                  <Link
                    to="/verificador"
                    search={{ code: r.verification_code }}
                    className="text-xs text-primary hover:underline"
                  >
                    Verificar
                  </Link>
                </div>
              </article>
            );
          })}
          {!loading && rows.length === 0 && (
            <p className="col-span-full text-center text-sm text-muted-foreground">Nenhuma obra na fila ainda.</p>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}