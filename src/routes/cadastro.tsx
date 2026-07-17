import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { UserPlus } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";

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

const schema = z.object({
  nome_completo: z.string().trim().min(3, "Informe seu nome completo").max(120),
  documento: z.string().trim().min(11, "CPF ou CNPJ inválido").max(20),
  telefone: z.string().trim().min(10, "Telefone inválido").max(20),
  nome_artistico: z.string().trim().min(2, "Informe seu nome artístico").max(80),
  email: z.string().trim().email("E-mail inválido").max(255),
  senha: z.string().min(8, "Mínimo de 8 caracteres").max(72),
});

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function Cadastro() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nome_completo: "",
    documento: "",
    telefone: "",
    nome_artistico: "",
    email: "",
    senha: "",
  });

  const onChange = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Dados inválidos");
      return;
    }
    setLoading(true);
    const { email, senha, ...meta } = parsed.data;
    const { error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        emailRedirectTo: `${window.location.origin}/painel`,
        data: { ...meta, slug: slugify(meta.nome_artistico) },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Cadastro criado! Confirme seu e-mail para acessar o painel.");
    router.navigate({ to: "/entrar" });
  };

  const google = async () => {
    const res = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (res.error) toast.error("Falha no login com Google");
  };

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

          <button type="button" onClick={google} className="btn-ghost-neon w-full !py-2.5 mb-4 text-sm">
            Entrar com Google
          </button>
          <div className="mb-4 flex items-center gap-3 text-[10px] uppercase tracking-widest text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> ou com e-mail <span className="h-px flex-1 bg-border" />
          </div>

          <form className="space-y-3" onSubmit={submit}>
            <Field label="Nome Completo" value={form.nome_completo} onChange={onChange("nome_completo")} placeholder="Seu nome completo" />
            <Field label="CPF ou CNPJ" value={form.documento} onChange={onChange("documento")} placeholder="000.000.000-00" />
            <Field label="Telefone / WhatsApp" value={form.telefone} onChange={onChange("telefone")} placeholder="(11) 99999-0000" />
            <Field label="Nome Artístico" value={form.nome_artistico} onChange={onChange("nome_artistico")} placeholder="Como você assina suas obras" />
            <Field label="E-mail" type="email" value={form.email} onChange={onChange("email")} placeholder="voce@email.com" />
            <Field label="Senha" type="password" value={form.senha} onChange={onChange("senha")} placeholder="Mínimo 8 caracteres" />
            <button type="submit" disabled={loading} className="btn-neon w-full disabled:opacity-60">
              {loading ? "Criando..." : "Criar minha conta"}
            </button>
            <p className="text-center text-xs text-muted-foreground">
              Já tem conta? <Link to="/entrar" className="text-primary hover:underline">Entrar</Link>
            </p>
          </form>
        </div>
      </section>
    </SiteLayout>
  );
}

function Field({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
}: {
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-lg border border-border bg-input/60 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
      />
    </label>
  );
}