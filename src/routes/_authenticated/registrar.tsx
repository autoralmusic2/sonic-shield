import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useSession } from "@/hooks/use-session";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import {
  canonicalize,
  generateVerificationCode,
  sha256Hex,
  type CoAutor,
} from "@/lib/obra-utils";
import { Check, ChevronLeft, ChevronRight, Plus, Trash2, Music4, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/_authenticated/registrar")({
  head: () => ({
    meta: [
      { title: "Registrar Música — AutoralMusic" },
      { name: "description", content: "Wizard em 5 passos para blindar sua obra com hash SHA-256 e emitir o certificado." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Registrar,
});

type FormState = {
  titulo: string;
  genero: string;
  idioma: string;
  ano: string;
  isrc: string;
  descricao: string;
  letra: string;
  co_autores: CoAutor[];
};

const initialState: FormState = {
  titulo: "",
  genero: "",
  idioma: "Português",
  ano: String(new Date().getFullYear()),
  isrc: "",
  descricao: "",
  letra: "",
  co_autores: [],
};

const step1Schema = z.object({
  titulo: z.string().trim().min(2, "Título muito curto").max(160),
  genero: z.string().trim().min(2, "Informe o gênero").max(60),
  idioma: z.string().trim().min(2).max(40),
  ano: z.string().regex(/^\d{4}$/, "Ano inválido"),
  isrc: z.string().trim().max(20).optional().or(z.literal("")),
});

const steps = [
  { n: 1, label: "Identificação" },
  { n: 2, label: "Coautores" },
  { n: 3, label: "Letra" },
  { n: 4, label: "Descrição" },
  { n: 5, label: "Revisão & Registro" },
];

function Registrar() {
  const { user } = useSession();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(initialState);
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const totalPart = useMemo(
    () => form.co_autores.reduce((s, c) => s + (Number(c.participacao) || 0), 0),
    [form.co_autores],
  );

  function next() {
    if (step === 1) {
      const r = step1Schema.safeParse(form);
      if (!r.success) { toast.error(r.error.issues[0].message); return; }
    }
    if (step === 2 && form.co_autores.length > 0) {
      const invalid = form.co_autores.some((c) => !c.nome.trim() || !c.participacao);
      if (invalid) { toast.error("Preencha nome e % de cada coautor"); return; }
      if (totalPart > 100) { toast.error("Soma das participações excede 100%"); return; }
    }
    if (step === 3 && form.letra.trim().length < 10) {
      toast.error("Cole a letra da obra (mínimo 10 caracteres)"); return;
    }
    setStep((s) => Math.min(5, s + 1));
  }

  async function register() {
    if (!user) return;
    setSaving(true);
    try {
      const canonical = canonicalize({
        titulo: form.titulo,
        genero: form.genero,
        idioma: form.idioma,
        ano: Number(form.ano),
        isrc: form.isrc,
        descricao: form.descricao,
        letra: form.letra,
        co_autores: form.co_autores,
        autor_id: user.id,
      });
      const hash = await sha256Hex(canonical);
      const code = generateVerificationCode();

      const { error } = await supabase.from("obras").insert({
        user_id: user.id,
        verification_code: code,
        titulo: form.titulo.trim(),
        genero: form.genero.trim() || null,
        idioma: form.idioma.trim() || null,
        ano: Number(form.ano),
        isrc: form.isrc.trim() || null,
        descricao: form.descricao.trim() || null,
        letra: form.letra,
        co_autores: form.co_autores,
        hash_sha256: hash,
      });
      if (error) throw error;
      toast.success(`Obra registrada! Código ${code}`);
      navigate({ to: "/obras" });
    } catch (e: any) {
      toast.error(e.message || "Falha ao registrar obra");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SiteLayout>
      <section className="mx-auto max-w-4xl px-4 py-12">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.3em] text-primary">Registro Blindado</p>
          <h1 className="mt-1 font-display text-3xl font-bold">
            Registrar <span className="text-gradient">Nova Obra</span>
          </h1>
        </div>

        {/* Stepper */}
        <ol className="mb-8 flex flex-wrap items-center gap-3">
          {steps.map((s) => {
            const active = s.n === step;
            const done = s.n < step;
            return (
              <li key={s.n} className="flex items-center gap-2">
                <span
                  className={`grid h-8 w-8 place-items-center rounded-full border text-xs font-semibold ${
                    done
                      ? "border-primary bg-primary/20 text-primary"
                      : active
                      ? "border-primary bg-gradient-primary text-primary-foreground shadow-neon"
                      : "border-border/60 text-muted-foreground"
                  }`}
                >
                  {done ? <Check className="h-4 w-4" /> : s.n}
                </span>
                <span className={`text-sm ${active ? "text-foreground" : "text-muted-foreground"}`}>
                  {s.label}
                </span>
                {s.n < steps.length && <span className="mx-1 h-px w-6 bg-border/60" />}
              </li>
            );
          })}
        </ol>

        <div className="glow-border rounded-2xl p-6 md:p-8">
          {step === 1 && (
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Título da música *">
                <input className={inp} value={form.titulo} onChange={(e) => set("titulo", e.target.value)} />
              </Field>
              <Field label="Gênero *">
                <input className={inp} value={form.genero} onChange={(e) => set("genero", e.target.value)} placeholder="Sertanejo, Funk, MPB..." />
              </Field>
              <Field label="Idioma *">
                <input className={inp} value={form.idioma} onChange={(e) => set("idioma", e.target.value)} />
              </Field>
              <Field label="Ano *">
                <input className={inp} value={form.ano} onChange={(e) => set("ano", e.target.value)} inputMode="numeric" />
              </Field>
              <Field label="ISRC (opcional)">
                <input className={inp} value={form.isrc} onChange={(e) => set("isrc", e.target.value)} placeholder="BR-XXX-25-00001" />
              </Field>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Adicione coautores e distribua a participação. Você será o autor principal (participação restante).
              </p>
              {form.co_autores.map((c, i) => (
                <div key={i} className="grid gap-3 md:grid-cols-[1fr_140px_auto]">
                  <input
                    className={inp}
                    value={c.nome}
                    onChange={(e) => {
                      const arr = [...form.co_autores];
                      arr[i] = { ...arr[i], nome: e.target.value };
                      set("co_autores", arr);
                    }}
                    placeholder="Nome completo"
                  />
                  <input
                    className={inp}
                    type="number"
                    min={1}
                    max={99}
                    value={c.participacao}
                    onChange={(e) => {
                      const arr = [...form.co_autores];
                      arr[i] = { ...arr[i], participacao: Number(e.target.value) };
                      set("co_autores", arr);
                    }}
                    placeholder="%"
                  />
                  <button
                    type="button"
                    onClick={() => set("co_autores", form.co_autores.filter((_, j) => j !== i))}
                    className="grid h-10 w-10 place-items-center rounded-lg border border-border/60 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => set("co_autores", [...form.co_autores, { nome: "", participacao: 0 }])}
                className="inline-flex items-center gap-2 rounded-lg border border-border/60 px-3 py-2 text-sm hover:border-primary hover:text-primary"
              >
                <Plus className="h-4 w-4" /> Adicionar coautor
              </button>
              <p className="text-xs text-muted-foreground">
                Sua participação: <span className="text-foreground">{Math.max(0, 100 - totalPart)}%</span> · Coautores: {totalPart}%
              </p>
            </div>
          )}

          {step === 3 && (
            <Field label="Letra completa da obra *">
              <textarea
                className={`${inp} min-h-[280px] font-mono text-sm`}
                value={form.letra}
                onChange={(e) => set("letra", e.target.value)}
                placeholder="Cole aqui a letra completa. Ela será usada para gerar o hash SHA-256."
              />
            </Field>
          )}

          {step === 4 && (
            <Field label="Descrição / notas (opcional)">
              <textarea
                className={`${inp} min-h-[180px]`}
                value={form.descricao}
                onChange={(e) => set("descricao", e.target.value)}
                placeholder="Contexto, referências, instrumentação, colaborações..."
              />
            </Field>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <div className="rounded-xl border border-border/60 bg-background/40 p-4">
                <div className="flex items-center gap-2 text-primary">
                  <Music4 className="h-4 w-4" />
                  <p className="text-sm font-semibold">{form.titulo || "—"}</p>
                </div>
                <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                  <Info k="Gênero" v={form.genero} />
                  <Info k="Idioma" v={form.idioma} />
                  <Info k="Ano" v={form.ano} />
                  <Info k="ISRC" v={form.isrc || "—"} />
                  <Info k="Coautores" v={form.co_autores.length ? form.co_autores.map((c) => `${c.nome} (${c.participacao}%)`).join(", ") : "Nenhum"} />
                  <Info k="Tamanho da letra" v={`${form.letra.length} caracteres`} />
                </dl>
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-primary/40 bg-primary/5 p-4 text-sm">
                <ShieldCheck className="mt-0.5 h-5 w-5 text-primary" />
                <p className="text-muted-foreground">
                  Ao registrar, geramos o <strong className="text-foreground">hash SHA-256</strong> da obra e um
                  <strong className="text-foreground"> código público</strong> no formato <code className="text-primary">AM-XXXXXXXX-{new Date().getFullYear()}</code>.
                  Você poderá baixar o certificado em PDF em <em>Minhas Obras</em>.
                </p>
              </div>
            </div>
          )}

          <div className="mt-8 flex items-center justify-between">
            <button
              type="button"
              disabled={step === 1}
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              className="inline-flex items-center gap-2 rounded-lg border border-border/60 px-4 py-2 text-sm disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" /> Voltar
            </button>
            {step < 5 ? (
              <button
                type="button"
                onClick={next}
                className="btn-neon inline-flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold"
              >
                Continuar <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={saving}
                onClick={register}
                className="btn-neon inline-flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold disabled:opacity-60"
              >
                <ShieldCheck className="h-4 w-4" />
                {saving ? "Registrando…" : "Registrar & Gerar Hash"}
              </button>
            )}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

const inp =
  "w-full rounded-lg border border-border/60 bg-background/60 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function Info({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-muted-foreground">{k}</dt>
      <dd className="text-foreground">{v || "—"}</dd>
    </div>
  );
}