import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useSession } from "@/hooks/use-session";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Music4, Radio, User, Coins, ShieldCheck, FileSignature, Search } from "lucide-react";

export const Route = createFileRoute("/_authenticated/painel")({
  head: () => ({
    meta: [
      { title: "Área do Compositor — AutoralMusic" },
      { name: "description", content: "Menu interno do compositor: cadastrar obra, portfólio, créditos, contratos e mais." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Painel,
});

type Profile = {
  nome_completo: string | null;
  nome_artistico: string | null;
  slug: string | null;
};

function Painel() {
  const { user } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("nome_completo, nome_artistico, slug")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => setProfile(data));
  }, [user]);

  const items = [
    { icon: Music4, title: "Registrar Música", desc: "Blinde sua obra em blockchain (5 passos)", to: "/painel" },
    { icon: Radio, title: "Minhas Obras", desc: "Gerencie certificados, contratos e status", to: "/painel" },
    { icon: User, title: "Meu Perfil", desc: "Dados cadastrais, foto e bio", to: "/painel" },
    { icon: Search, title: "Meu Portfólio", desc: "Página pública para gravadoras", to: "/painel" },
    { icon: Coins, title: "Créditos & Planos", desc: "Comprar tokens e ver histórico", to: "/painel" },
    { icon: FileSignature, title: "Contratos", desc: "Cessão de direitos e split sheet", to: "/painel" },
    { icon: ShieldCheck, title: "Segurança", desc: "Trocar senha e sessões ativas", to: "/painel" },
  ];

  return (
    <SiteLayout>
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.3em] text-primary">Área do Compositor</p>
          <h1 className="mt-1 font-display text-3xl font-bold">
            Olá, <span className="text-gradient">{profile?.nome_artistico || profile?.nome_completo || user?.email}</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Escolha uma ação abaixo. Novos módulos serão liberados nas próximas fases.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <Link
              key={it.title}
              to={it.to}
              className="glow-border group rounded-2xl p-6 transition hover:-translate-y-0.5"
            >
              <div className="mb-4 grid h-11 w-11 place-items-center rounded-lg bg-gradient-primary shadow-neon">
                <it.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <h3 className="font-display text-lg font-semibold group-hover:text-primary">{it.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{it.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}