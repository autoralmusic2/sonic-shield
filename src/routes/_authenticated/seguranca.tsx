import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useSession } from "@/hooks/use-session";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, KeyRound, LogOut, Mail, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/_authenticated/seguranca")({
  head: () => ({
    meta: [
      { title: "Segurança — AutoralMusic" },
      { name: "description", content: "Troque sua senha e encerre sessões ativas." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SegurancaPage,
});

function SegurancaPage() {
  const { user } = useSession();
  const navigate = useNavigate();
  const [novaSenha, setNovaSenha] = useState("");
  const [confirma, setConfirma] = useState("");
  const [saving, setSaving] = useState(false);

  async function trocarSenha(e: React.FormEvent) {
    e.preventDefault();
    if (novaSenha.length < 8) {
      toast.error("A senha precisa ter ao menos 8 caracteres");
      return;
    }
    if (novaSenha !== confirma) {
      toast.error("As senhas não conferem");
      return;
    }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: novaSenha });
    setSaving(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Senha atualizada");
      setNovaSenha("");
      setConfirma("");
    }
  }

  async function reenviarReset() {
    if (!user?.email) return;
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/entrar`,
    });
    if (error) toast.error(error.message);
    else toast.success("E-mail de redefinição enviado");
  }

  async function sairTudo() {
    await supabase.auth.signOut({ scope: "global" });
    toast.success("Todas as sessões foram encerradas");
    navigate({ to: "/entrar" });
  }

  return (
    <SiteLayout>
      <section className="mx-auto max-w-2xl px-4 py-12">
        <Link to="/painel" className="mb-6 inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-3 w-3" /> Voltar ao painel
        </Link>
        <h1 className="font-display text-3xl font-bold text-gradient">Segurança</h1>

        <div className="glow-border mt-6 rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">Conta</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </div>

        <form onSubmit={trocarSenha} className="glow-border mt-6 space-y-4 rounded-2xl p-6">
          <div className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-primary" />
            <h2 className="font-display text-lg font-semibold">Trocar senha</h2>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Nova senha</Label>
            <Input type="password" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} minLength={8} required />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Confirmar nova senha</Label>
            <Input type="password" value={confirma} onChange={(e) => setConfirma(e.target.value)} minLength={8} required />
          </div>
          <Button className="btn-neon" type="submit" disabled={saving}>
            {saving ? "Salvando…" : "Atualizar senha"}
          </Button>
        </form>

        <div className="glow-border mt-6 space-y-3 rounded-2xl p-6">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-primary" />
            <h2 className="font-display text-lg font-semibold">Redefinir por e-mail</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Enviaremos um link para redefinir sua senha caso você a tenha esquecido.
          </p>
          <Button variant="outline" onClick={reenviarReset}>
            Enviar link de redefinição
          </Button>
        </div>

        <div className="glow-border mt-6 space-y-3 rounded-2xl p-6">
          <div className="flex items-center gap-2">
            <LogOut className="h-4 w-4 text-destructive" />
            <h2 className="font-display text-lg font-semibold">Encerrar todas as sessões</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Desloga sua conta em todos os dispositivos e navegadores.
          </p>
          <Button variant="destructive" onClick={sairTudo}>
            Sair de todos os dispositivos
          </Button>
        </div>
      </section>
    </SiteLayout>
  );
}