import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useSession } from "@/hooks/use-session";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { generateCertificatePDF } from "@/lib/obra-certificate";
import { toast } from "sonner";
import { Download, Music4, Plus, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/_authenticated/obras")({
  head: () => ({
    meta: [
      { title: "Minhas Obras — AutoralMusic" },
      { name: "description", content: "Lista das suas obras registradas com hash SHA-256 e certificado PDF." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MinhasObras,
});

type Obra = {
  id: string;
  verification_code: string;
  titulo: string;
  genero: string | null;
  idioma: string | null;
  ano: number | null;
  isrc: string | null;
  descricao: string | null;
  co_autores: { nome: string; participacao: number }[];
  hash_sha256: string;
  registered_at: string;
  tipo_registro?: string | null;
  ia_nivel?: string | null;
  ia_detalhes?: string | null;
  hash_arquivo_sha256?: string | null;
  hash_arquivo_sha512?: string | null;
  hash_sha512?: string | null;
  endereco?: Record<string, string> | null;
};

function MinhasObras() {
  const { user } = useSession();
  const [obras, setObras] = useState<Obra[] | null>(null);
  const [profile, setProfile] = useState<{ nome_completo: string | null; documento: string | null; nome_artistico: string | null } | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("obras")
      .select("id, verification_code, titulo, genero, idioma, ano, isrc, descricao, co_autores, hash_sha256, hash_sha512, hash_arquivo_sha256, hash_arquivo_sha512, tipo_registro, ia_nivel, ia_detalhes, endereco, registered_at")
      .eq("user_id", user.id)
      .order("registered_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) toast.error(error.message);
        setObras((data as Obra[] | null) ?? []);
      });
    supabase
      .from("profiles")
      .select("nome_completo, documento, nome_artistico")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => setProfile(data));
  }, [user]);

  async function downloadPDF(o: Obra) {
    const end = o.endereco || {};
    const endStr = end.logradouro
      ? `${end.logradouro}, ${end.numero || "s/n"}${end.complemento ? " - " + end.complemento : ""} — ${end.bairro || ""}, ${end.cidade || ""}/${end.uf || ""} · CEP ${end.cep || ""}`
      : null;
    await generateCertificatePDF({
      verification_code: o.verification_code,
      titulo: o.titulo,
      genero: o.genero,
      idioma: o.idioma,
      ano: o.ano,
      isrc: o.isrc,
      descricao: o.descricao,
      co_autores: o.co_autores ?? [],
      hash_sha256: o.hash_sha256,
      hash_sha512: o.hash_sha512 ?? null,
      hash_arquivo_sha256: o.hash_arquivo_sha256 ?? null,
      hash_arquivo_sha512: o.hash_arquivo_sha512 ?? null,
      tipo_registro: o.tipo_registro ?? null,
      ia_nivel: o.ia_nivel ?? null,
      ia_detalhes: o.ia_detalhes ?? null,
      endereco: endStr,
      registered_at: o.registered_at,
      autor_nome: profile?.nome_completo || user?.email || "",
      autor_documento: profile?.documento ?? null,
      autor_artistico: profile?.nome_artistico ?? null,
      verify_url: `${window.location.origin}/verificador?code=${o.verification_code}`,
    });
  }

  return (
    <SiteLayout>
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-primary">Acervo</p>
            <h1 className="mt-1 font-display text-3xl font-bold">
              Minhas <span className="text-gradient">Obras</span>
            </h1>
          </div>
          <Link to="/registrar" className="btn-neon inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold">
            <Plus className="h-4 w-4" /> Registrar nova
          </Link>
        </div>

        {obras === null ? (
          <p className="text-sm text-muted-foreground">Carregando…</p>
        ) : obras.length === 0 ? (
          <div className="glow-border rounded-2xl p-10 text-center">
            <Music4 className="mx-auto mb-3 h-8 w-8 text-primary" />
            <h3 className="font-display text-lg font-semibold">Nenhuma obra registrada</h3>
            <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
              Comece agora — o primeiro registro é grátis com sua conta.
            </p>
            <Link to="/registrar" className="btn-neon mt-5 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold">
              <Plus className="h-4 w-4" /> Registrar minha primeira obra
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {obras.map((o) => (
              <article key={o.id} className="glow-border rounded-2xl p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="font-display text-lg font-semibold text-foreground">{o.titulo}</h3>
                    <p className="text-xs text-muted-foreground">
                      {o.genero || "—"} · {o.idioma || "—"} · {o.ano || "—"}
                    </p>
                    <p className="mt-2 inline-flex items-center gap-2 rounded-md bg-primary/10 px-2 py-1 text-xs text-primary">
                      <ShieldCheck className="h-3.5 w-3.5" /> {o.verification_code}
                    </p>
                    <p className="mt-2 break-all font-mono text-[10px] leading-tight text-muted-foreground">
                      sha256: {o.hash_sha256}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => downloadPDF(o)}
                      className="btn-neon inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold"
                    >
                      <Download className="h-4 w-4" /> Certificado PDF
                    </button>
                    <Link
                      to="/verificador"
                      search={{ code: o.verification_code }}
                      className="text-xs text-muted-foreground hover:text-primary"
                    >
                      Página pública →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </SiteLayout>
  );
}