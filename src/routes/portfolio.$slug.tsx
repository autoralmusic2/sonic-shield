import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Music4, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/portfolio/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `Portfólio de ${params.slug} — AutoralMusic` },
      { name: "description", content: `Obras registradas por ${params.slug} na AutoralMusic.` },
      { property: "og:title", content: `Portfólio de ${params.slug} — AutoralMusic` },
      { property: "og:description", content: "Obras autorais com registro criptográfico verificável." },
    ],
  }),
  component: PublicPortfolio,
});

type Profile = {
  id: string;
  nome_completo: string;
  nome_artistico: string | null;
  bio: string | null;
  avatar_url: string | null;
  slug: string;
};

type Obra = {
  id: string;
  titulo: string;
  genero: string | null;
  ano: number | null;
  verification_code: string;
};

function PublicPortfolio() {
  const { slug } = Route.useParams();
  const [profile, setProfile] = useState<Profile | null | "not-found">(null);
  const [obras, setObras] = useState<Obra[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, nome_completo, nome_artistico, bio, avatar_url, slug")
        .eq("slug", slug)
        .maybeSingle();
      if (!data) {
        setProfile("not-found");
        return;
      }
      setProfile(data as Profile);
      const { data: obs } = await supabase
        .from("obras")
        .select("id, titulo, genero, ano, verification_code")
        .eq("user_id", (data as Profile).id)
        .order("registered_at", { ascending: false });
      setObras((obs as any) ?? []);
    })();
  }, [slug]);

  if (profile === "not-found") {
    return (
      <SiteLayout>
        <section className="mx-auto max-w-2xl px-4 py-24 text-center">
          <h1 className="font-display text-3xl font-bold">Portfólio não encontrado</h1>
          <p className="mt-2 text-sm text-muted-foreground">O link "{slug}" não corresponde a nenhum compositor.</p>
        </section>
      </SiteLayout>
    );
  }

  if (!profile) {
    return (
      <SiteLayout>
        <section className="mx-auto max-w-2xl px-4 py-24 text-center text-sm text-muted-foreground">Carregando…</section>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="mx-auto max-w-4xl px-4 py-12">
        <div className="glow-border flex flex-wrap items-center gap-6 rounded-2xl p-6">
          <div className="h-20 w-20 overflow-hidden rounded-full bg-gradient-primary shadow-neon">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.nome_artistico ?? profile.nome_completo} className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full w-full place-items-center font-display text-2xl text-primary-foreground">
                {(profile.nome_artistico ?? profile.nome_completo).slice(0, 1)}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs uppercase tracking-widest text-primary">Compositor</p>
            <h1 className="font-display text-3xl font-bold text-gradient">
              {profile.nome_artistico ?? profile.nome_completo}
            </h1>
            {profile.bio && <p className="mt-2 text-sm text-muted-foreground">{profile.bio}</p>}
          </div>
        </div>

        <h2 className="mt-10 font-display text-xl font-semibold">Obras registradas ({obras.length})</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {obras.map((o) => (
            <Link
              key={o.id}
              to="/verificador"
              search={{ code: o.verification_code } as any}
              className="glow-border group flex items-center gap-3 rounded-xl p-4"
            >
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-primary">
                <Music4 className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium group-hover:text-primary">{o.titulo}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {o.genero ?? "—"}{o.ano ? ` · ${o.ano}` : ""}
                </p>
              </div>
              <ShieldCheck className="h-4 w-4 text-primary opacity-0 transition group-hover:opacity-100" />
            </Link>
          ))}
          {obras.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhuma obra pública ainda.</p>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}