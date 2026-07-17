import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useSession } from "@/hooks/use-session";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/_authenticated/perfil")({
  head: () => ({
    meta: [
      { title: "Meu Perfil — AutoralMusic" },
      { name: "description", content: "Atualize seus dados de compositor." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PerfilPage,
});

type Profile = {
  nome_completo: string;
  documento: string | null;
  nome_artistico: string | null;
  slug: string | null;
  telefone: string | null;
  bio: string | null;
  avatar_url: string | null;
};

function slugify(v: string) {
  return v
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

function PerfilPage() {
  const { user } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [p, setP] = useState<Profile>({
    nome_completo: "",
    documento: "",
    nome_artistico: "",
    slug: "",
    telefone: "",
    bio: "",
    avatar_url: "",
  });

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("nome_completo, documento, nome_artistico, slug, telefone, bio, avatar_url")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setP(data as Profile);
        setLoading(false);
      });
  }, [user]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const payload = {
      ...p,
      slug: p.slug ? slugify(p.slug) : p.nome_artistico ? slugify(p.nome_artistico) : null,
    };
    const { error } = await supabase.from("profiles").update(payload).eq("id", user.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Perfil atualizado.");
  }

  return (
    <SiteLayout>
      <section className="mx-auto max-w-3xl px-4 py-12">
        <Link to="/painel" className="mb-6 inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-3 w-3" /> Voltar ao painel
        </Link>
        <h1 className="font-display text-3xl font-bold text-gradient">Meu Perfil</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Estes dados aparecem no seu certificado e no seu portfólio público.
        </p>

        {loading ? (
          <p className="mt-10 text-sm text-muted-foreground">Carregando…</p>
        ) : (
          <form onSubmit={save} className="glow-border mt-8 space-y-5 rounded-2xl p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nome completo">
                <Input value={p.nome_completo ?? ""} onChange={(e) => setP({ ...p, nome_completo: e.target.value })} required />
              </Field>
              <Field label="CPF / CNPJ">
                <Input value={p.documento ?? ""} onChange={(e) => setP({ ...p, documento: e.target.value })} />
              </Field>
              <Field label="Nome artístico">
                <Input value={p.nome_artistico ?? ""} onChange={(e) => setP({ ...p, nome_artistico: e.target.value })} />
              </Field>
              <Field label="Slug do portfólio">
                <Input
                  value={p.slug ?? ""}
                  onChange={(e) => setP({ ...p, slug: e.target.value })}
                  placeholder="ex: joao-silva"
                />
              </Field>
              <Field label="Telefone / WhatsApp">
                <Input value={p.telefone ?? ""} onChange={(e) => setP({ ...p, telefone: e.target.value })} />
              </Field>
              <Field label="URL do avatar">
                <Input value={p.avatar_url ?? ""} onChange={(e) => setP({ ...p, avatar_url: e.target.value })} placeholder="https://…" />
              </Field>
            </div>
            <Field label="Bio">
              <Textarea rows={4} value={p.bio ?? ""} onChange={(e) => setP({ ...p, bio: e.target.value })} placeholder="Conte sua trajetória para gravadoras e fãs" />
            </Field>

            <div className="flex items-center justify-between gap-3">
              {p.slug && (
                <Link to="/portfolio/$slug" params={{ slug: p.slug }} className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                  Ver portfólio público <ExternalLink className="h-3 w-3" />
                </Link>
              )}
              <Button type="submit" disabled={saving} className="btn-neon ml-auto">
                {saving ? "Salvando…" : "Salvar alterações"}
              </Button>
            </div>
          </form>
        )}
      </section>
    </SiteLayout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-widest text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}