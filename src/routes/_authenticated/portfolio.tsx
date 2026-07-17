import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useSession } from "@/hooks/use-session";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, Copy, ExternalLink, Music4 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/portfolio")({
  head: () => ({
    meta: [
      { title: "Meu Portfólio — AutoralMusic" },
      { name: "description", content: "Compartilhe sua página pública com gravadoras e produtores." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PortfolioPage,
});

function PortfolioPage() {
  const { user } = useSession();
  const [profile, setProfile] = useState<{ nome_artistico: string | null; slug: string | null; bio: string | null } | null>(null);
  const [obras, setObras] = useState<{ id: string; titulo: string; verification_code: string; genero: string | null }[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("nome_artistico, slug, bio").eq("id", user.id).maybeSingle().then(({ data }) => setProfile(data));
    supabase.from("obras").select("id, titulo, verification_code, genero").eq("user_id", user.id).order("registered_at", { ascending: false }).then(({ data }) => setObras((data as any) ?? []));
  }, [user]);

  const publicUrl = profile?.slug ? `${typeof window !== "undefined" ? window.location.origin : ""}/portfolio/${profile.slug}` : "";

  return (
    <SiteLayout>
      <section className="mx-auto max-w-4xl px-4 py-12">
        <Link to="/painel" className="mb-6 inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-3 w-3" /> Voltar ao painel
        </Link>
        <h1 className="font-display text-3xl font-bold text-gradient">Meu Portfólio</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sua página pública lista todas as obras registradas — ideal para enviar a gravadoras.
        </p>

        <div className="glow-border mt-8 rounded-2xl p-6">
          {profile?.slug ? (
            <>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">URL pública</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <code className="rounded-md bg-black/40 px-3 py-2 text-sm text-primary">{publicUrl}</code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(publicUrl);
                    toast.success("Link copiado");
                  }}
                >
                  <Copy className="mr-2 h-3 w-3" /> Copiar
                </Button>
                <Link to="/portfolio/$slug" params={{ slug: profile.slug }} className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                  Abrir <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </>
          ) : (
            <div className="text-sm text-muted-foreground">
              Você ainda não definiu um slug.{" "}
              <Link to="/perfil" className="text-primary hover:underline">
                Configure seu perfil
              </Link>{" "}
              para gerar sua URL pública.
            </div>
          )}
        </div>

        <h2 className="mt-10 font-display text-xl font-semibold">Obras no portfólio ({obras.length})</h2>
        <div className="mt-4 grid gap-3">
          {obras.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Nenhuma obra ainda.{" "}
              <Link to="/registrar" className="text-primary hover:underline">
                Registre a primeira
              </Link>
              .
            </p>
          )}
          {obras.map((o) => (
            <div key={o.id} className="glow-border flex items-center gap-3 rounded-xl px-4 py-3">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-primary">
                <Music4 className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{o.titulo}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {o.genero ?? "—"} · {o.verification_code}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}