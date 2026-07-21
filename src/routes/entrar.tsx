import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { LogIn } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/entrar")({
  head: () => ({
    meta: [
      { title: "Área do Compositor — AutoralMusic" },
      { name: "description", content: "Entre na sua Área do Compositor para gerenciar obras, créditos e portfólio." },
      { property: "og:title", content: "Área do Compositor — AutoralMusic" },
      { property: "og:description", content: "Acesse sua Área do Compositor." },
    ],
  }),
  component: Entrar,
});

function Entrar() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !senha) {
      toast.error("Preencha e-mail e senha");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    setLoading(false);
    if (error) {
      toast.error(error.message === "Invalid login credentials" ? "E-mail ou senha inválidos" : error.message);
      return;
    }
    toast.success("Bem-vindo(a) de volta!");
    router.navigate({ to: "/painel" });
  };

  const forgot = async () => {
    if (!email) {
      toast.error("Informe seu e-mail primeiro");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });
    if (error) toast.error(error.message);
    else toast.success("Enviamos um link de recuperação para o seu e-mail");
  };

  return (
    <SiteLayout>
      <section className="mx-auto max-w-md px-4 py-16">
        <div className="glow-border rounded-2xl p-8">
          <div className="mb-6 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-gradient-primary shadow-neon">
              <LogIn className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="mt-4 font-display text-2xl font-bold">Área do Compositor</h1>
            <p className="mt-1 text-sm text-muted-foreground">Acesso para autores já cadastrados</p>
          </div>

          <form className="space-y-4" onSubmit={submit}>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-muted-foreground">E-mail de Acesso</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@email.com"
                className="w-full rounded-lg border border-border bg-input/60 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-muted-foreground">Senha</span>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-border bg-input/60 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </label>
            <div className="text-right">
              <button type="button" onClick={forgot} className="text-xs text-primary hover:underline">Esqueceu a senha?</button>
            </div>
            <button type="submit" disabled={loading} className="btn-neon w-full disabled:opacity-60">
              {loading ? "Entrando..." : "Entrar"}
            </button>
            <p className="text-center text-xs text-muted-foreground">
              Não tem conta? <Link to="/cadastro" className="text-accent hover:underline">Cadastre-se grátis</Link>
            </p>
          </form>
        </div>
      </section>
    </SiteLayout>
  );
}