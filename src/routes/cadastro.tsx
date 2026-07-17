import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { UserPlus } from "lucide-react";

export const Route = createFileRoute("/cadastro")({
  head: () => ({
    meta: [
      { title: "Criar Conta — AutoralMusic" },
      { name: "description", content: "Cadastre-se grátis e ganhe 1 crédito de cortesia para blindar sua primeira obra." },
      { property: "og:title", content: "Criar Conta — AutoralMusic" },
      { property: "og:description", content: "Cadastre-se grátis e ganhe 1 crédito de cortesia." },
    ],
  }),
  component: Cadastro,
});

function Cadastro() {
  return (
    <SiteLayout>
      <section className="mx-auto max-w-md px-4 py-16">
        <div className="glow-border rounded-2xl p-8">
          <div className="mb-6 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-gradient-primary shadow-neon">
              <UserPlus className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="mt-4 font-display text-2xl font-bold">Criar Conta</h1>
            <p className="mt-1 text-sm text-muted-foreground">Ficha cadastral do autor · 1 crédito grátis</p>
          </div>

          <form className="space-y-4">
            <Field label="Nome Completo" placeholder="Seu nome completo" />
            <Field label="CPF ou CNPJ" placeholder="000.000.000-00" />
            <Field label="E-mail" type="email" placeholder="voce@email.com" />
            <Field label="Senha" type="password" placeholder="••••••••" />
            <button type="button" className="btn-neon w-full">Criar minha conta</button>
            <p className="text-center text-xs text-muted-foreground">
              Já tem conta? <Link to="/entrar" className="text-primary hover:underline">Entrar na Área do Compositor</Link>
            </p>
          </form>
          <p className="mt-4 text-center text-[11px] text-muted-foreground">
            O cadastro completo com autenticação será ativado na Fase 2.
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}

function Field({ label, type = "text", placeholder }: { label: string; type?: string; placeholder?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-muted-foreground">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full rounded-lg border border-border bg-input/60 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
      />
    </label>
  );
}