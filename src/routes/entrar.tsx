import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { LogIn } from "lucide-react";

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

          <form className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-muted-foreground">E-mail de Acesso</span>
              <input type="email" placeholder="voce@email.com"
                className="w-full rounded-lg border border-border bg-input/60 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-muted-foreground">Senha</span>
              <input type="password" placeholder="••••••••"
                className="w-full rounded-lg border border-border bg-input/60 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40" />
            </label>
            <div className="text-right">
              <a href="#" className="text-xs text-primary hover:underline">Esqueceu a senha?</a>
            </div>
            <button type="button" className="btn-neon w-full">Entrar</button>
            <p className="text-center text-xs text-muted-foreground">
              Não tem uma conta? <Link to="/cadastro" className="text-accent hover:underline">Cadastre-se grátis</Link>
            </p>
          </form>
          <p className="mt-4 text-center text-[11px] text-muted-foreground">
            Login completo será ativado na Fase 2 com Lovable Cloud.
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}