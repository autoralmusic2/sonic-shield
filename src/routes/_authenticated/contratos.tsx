import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useSession } from "@/hooks/use-session";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { generateContractPDF } from "@/lib/obra-contract";
import { ArrowLeft, FileSignature, Download } from "lucide-react";

export const Route = createFileRoute("/_authenticated/contratos")({
  head: () => ({
    meta: [
      { title: "Contratos — AutoralMusic" },
      { name: "description", content: "Gere contratos de cessão de direitos e split sheets vinculados às suas obras." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ContratosPage,
});

type Obra = {
  id: string;
  titulo: string;
  verification_code: string;
  hash_sha256: string;
  registered_at: string;
  co_autores: { nome: string; participacao: number }[];
};

function ContratosPage() {
  const { user } = useSession();
  const [obras, setObras] = useState<Obra[]>([]);
  const [profile, setProfile] = useState<{ nome_completo: string; documento: string | null; nome_artistico: string | null } | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [cessionarioNome, setCessionarioNome] = useState("");
  const [cessionarioDoc, setCessionarioDoc] = useState("");

  useEffect(() => {
    if (!user) return;
    supabase
      .from("obras")
      .select("id, titulo, verification_code, hash_sha256, registered_at, co_autores")
      .eq("user_id", user.id)
      .order("registered_at", { ascending: false })
      .then(({ data }) => setObras((data as any) ?? []));
    supabase
      .from("profiles")
      .select("nome_completo, documento, nome_artistico")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => setProfile(data as any));
  }, [user]);

  function gerar(o: Obra, tipo: "cessao" | "split") {
    if (!profile) return;
    if (tipo === "cessao" && (!cessionarioNome || !cessionarioDoc)) {
      toast.error("Preencha nome e documento do cessionário");
      return;
    }
    generateContractPDF({
      tipo,
      titulo: o.titulo,
      verification_code: o.verification_code,
      hash_sha256: o.hash_sha256,
      registered_at: o.registered_at,
      autor_nome: profile.nome_completo,
      autor_documento: profile.documento,
      autor_artistico: profile.nome_artistico,
      co_autores: o.co_autores ?? [],
      cessionario: tipo === "cessao" ? { nome: cessionarioNome, documento: cessionarioDoc } : undefined,
    });
    toast.success("Contrato gerado");
  }

  return (
    <SiteLayout>
      <section className="mx-auto max-w-4xl px-4 py-12">
        <Link to="/painel" className="mb-6 inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-3 w-3" /> Voltar ao painel
        </Link>
        <h1 className="font-display text-3xl font-bold text-gradient">Contratos</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Gere contratos de cessão de direitos ou split sheets em PDF, com o hash SHA-256 da obra como prova de integridade.
        </p>

        {obras.length === 0 ? (
          <p className="mt-10 text-sm text-muted-foreground">
            Nenhuma obra registrada.{" "}
            <Link to="/registrar" className="text-primary hover:underline">
              Registrar agora
            </Link>
          </p>
        ) : (
          <div className="mt-8 space-y-3">
            {obras.map((o) => (
              <div key={o.id} className="glow-border rounded-2xl p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-primary">
                    <FileSignature className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{o.titulo}</p>
                    <p className="truncate text-xs text-muted-foreground">{o.verification_code}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => gerar(o, "split")}>
                    <Download className="mr-2 h-3 w-3" /> Split Sheet
                  </Button>
                  <Button size="sm" onClick={() => setOpenId(openId === o.id ? null : o.id)} className="btn-neon">
                    Cessão de direitos
                  </Button>
                </div>
                {openId === o.id && (
                  <div className="mt-4 grid gap-3 rounded-xl border border-primary/20 bg-black/20 p-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Nome do cessionário</Label>
                      <Input value={cessionarioNome} onChange={(e) => setCessionarioNome(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">CPF / CNPJ</Label>
                      <Input value={cessionarioDoc} onChange={(e) => setCessionarioDoc(e.target.value)} />
                    </div>
                    <div className="sm:col-span-2 flex justify-end">
                      <Button className="btn-neon" onClick={() => gerar(o, "cessao")}>
                        <Download className="mr-2 h-3 w-3" /> Gerar contrato
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </SiteLayout>
  );
}