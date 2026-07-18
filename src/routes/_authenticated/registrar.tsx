import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useSession } from "@/hooks/use-session";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  canonicalize,
  fetchViaCep,
  generateVerificationCode,
  hashFile,
  sha256Hex,
  sha512Hex,
  type CoAutor,
} from "@/lib/obra-utils";
import { generateCertificatePDF } from "@/lib/obra-certificate";
import { CreditosCheckout } from "@/components/site/CreditosCheckout";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Music4,
  ShieldCheck,
  Upload,
  Share2,
  Radio,
  Download,
  Loader2,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/registrar")({
  head: () => ({
    meta: [
      { title: "Registrar Música — AutoralMusic" },
      { name: "description", content: "Wizard em 5 passos: qualificação civil, upload, coautoria, hash SHA-256/512 e certidão." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Registrar,
});

type Endereco = {
  cep: string; logradouro: string; numero: string; complemento: string;
  bairro: string; cidade: string; uf: string;
};
type Qualificacao = {
  nome_completo: string; nome_artistico: string; cpf: string; telefone: string; email: string;
};
type TipoReg = "letra" | "melodia" | "completa";
type IANivel = "nao" | "sim" | "parcial";

type FormState = {
  qualificacao: Qualificacao;
  endereco: Endereco;
  titulo: string;
  genero: string;
  tipo: TipoReg;
  file: File | null;
  letra: string;
  ia_nivel: IANivel;
  ia_detalhes: string;
  co_autores: CoAutor[];
  aceite: boolean;
};

const initial: FormState = {
  qualificacao: { nome_completo: "", nome_artistico: "", cpf: "", telefone: "", email: "" },
  endereco: { cep: "", logradouro: "", numero: "", complemento: "", bairro: "", cidade: "", uf: "" },
  titulo: "", genero: "", tipo: "completa",
  file: null, letra: "",
  ia_nivel: "nao", ia_detalhes: "",
  co_autores: [], aceite: false,
};

const steps = [
  { n: 1, label: "Qualificação" },
  { n: 2, label: "Obra & IA" },
  { n: 3, label: "Coautoria" },
  { n: 4, label: "Revisão" },
  { n: 5, label: "Concluído" },
];

const inp =
  "w-full rounded-lg border border-border/60 bg-background/60 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary";

function Registrar() {
  const { user } = useSession();
  const [step, setStep] = useState(1);
  const [f, setF] = useState<FormState>(initial);
  const [saving, setSaving] = useState(false);
  const [hashing, setHashing] = useState(false);
  const [hashes, setHashes] = useState<{ sha256: string; sha512: string; fileSha256?: string; fileSha512?: string } | null>(null);
  const [result, setResult] = useState<{ code: string; obraId: string; audioUrl: string | null } | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const audioUrl = useMemo(() => (f.file ? URL.createObjectURL(f.file) : null), [f.file]);
  useEffect(() => () => { if (audioUrl) URL.revokeObjectURL(audioUrl); }, [audioUrl]);

  async function loadBalance() {
    if (!user) return;
    const { data } = await supabase.from("credits").select("balance").eq("user_id", user.id).maybeSingle();
    setBalance((data?.balance as number) ?? 0);
  }
  useEffect(() => { loadBalance(); }, [user]);

  const upd = <K extends keyof FormState>(k: K, v: FormState[K]) => setF((s) => ({ ...s, [k]: v }));
  const updQ = (k: keyof Qualificacao, v: string) => setF((s) => ({ ...s, qualificacao: { ...s.qualificacao, [k]: v } }));
  const updE = (k: keyof Endereco, v: string) => setF((s) => ({ ...s, endereco: { ...s.endereco, [k]: v } }));

  // pré-carrega do perfil
  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle().then(({ data }) => {
      if (!data) return;
      setF((s) => ({
        ...s,
        qualificacao: {
          nome_completo: data.nome_completo || s.qualificacao.nome_completo,
          nome_artistico: data.nome_artistico || "",
          cpf: data.documento || "",
          telefone: data.telefone || "",
          email: (data as any).email || user.email || "",
        },
        endereco: {
          cep: (data as any).cep || "",
          logradouro: (data as any).logradouro || "",
          numero: (data as any).numero || "",
          complemento: (data as any).complemento || "",
          bairro: (data as any).bairro || "",
          cidade: (data as any).cidade || "",
          uf: (data as any).uf || "",
        },
      }));
    });
  }, [user]);

  async function onCep(v: string) {
    updE("cep", v);
    const d = v.replace(/\D/g, "");
    if (d.length === 8) {
      const r = await fetchViaCep(d);
      if (!r) return toast.error("CEP não encontrado");
      setF((s) => ({ ...s, endereco: {
        ...s.endereco, cep: v,
        logradouro: r.logradouro || s.endereco.logradouro,
        bairro: r.bairro || s.endereco.bairro,
        cidade: r.localidade || s.endereco.cidade,
        uf: r.uf || s.endereco.uf,
      } }));
    }
  }

  const totalPart = f.co_autores.reduce((s, c) => s + (Number(c.participacao) || 0), 0);
  const requerLetra = f.tipo === "letra" || f.tipo === "completa";
  const requerArquivo = f.tipo === "melodia" || f.tipo === "completa";

  function validateStep(): string | null {
    if (step === 1) {
      const q = f.qualificacao, e = f.endereco;
      if (!q.nome_completo.trim()) return "Informe o nome completo";
      if (!q.cpf.trim()) return "Informe o CPF";
      if (!q.telefone.trim()) return "Informe o WhatsApp";
      if (!q.email.trim()) return "Informe o e-mail";
      if (e.cep.replace(/\D/g, "").length !== 8) return "CEP inválido";
      if (!e.logradouro || !e.bairro || !e.cidade || !e.uf) return "Complete o endereço";
      if (!e.numero.trim()) return "Informe o número";
    }
    if (step === 2) {
      if (f.titulo.trim().length < 2) return "Informe o título";
      if (!f.genero.trim()) return "Informe o gênero";
      if (requerArquivo && !f.file) return "Envie o arquivo de áudio/partitura";
      if (requerLetra && f.letra.trim().length < 10) return "Digite a letra da música";
      if (f.ia_nivel === "parcial" && f.ia_detalhes.trim().length < 10) return "Descreva onde a IA foi usada";
    }
    if (step === 3) {
      if (f.co_autores.some((c) => !c.nome.trim() || !c.participacao)) return "Preencha nome e % de cada coautor";
      const soma = totalPart + (f.co_autores.length ? 0 : 0);
      // se há coautores, autor principal fica com o restante; soma total (autor + coautores) deve ser 100
      // se autor sozinho, ok
      if (f.co_autores.length > 0 && soma > 100) return "Coautores somam mais de 100%";
    }
    return null;
  }

  async function next() {
    const err = validateStep();
    if (err) return toast.error(err);
    if (step === 3) {
      // ao entrar na revisão, calcula hashes localmente
      setHashing(true);
      try {
        const canonical = canonicalize({
          titulo: f.titulo, genero: f.genero, idioma: "pt-BR",
          ano: new Date().getFullYear(), isrc: "",
          descricao: `${f.tipo}|IA:${f.ia_nivel}|${f.ia_detalhes}`,
          letra: f.letra, co_autores: f.co_autores, autor_id: user!.id,
        });
        const [h256, h512] = await Promise.all([sha256Hex(canonical), sha512Hex(canonical)]);
        let fileSha256: string | undefined, fileSha512: string | undefined;
        if (f.file) {
          fileSha256 = await hashFile(f.file, "SHA-256");
          fileSha512 = await hashFile(f.file, "SHA-512");
        }
        setHashes({ sha256: h256, sha512: h512, fileSha256, fileSha512 });
      } catch (e: any) {
        toast.error("Falha ao calcular hashes");
        setHashing(false);
        return;
      }
      setHashing(false);
    }
    setStep((s) => Math.min(5, s + 1));
  }

  async function registrar() {
    if (!user || !hashes) return;
    if (!f.aceite) return toast.error("Marque o aceite legal");
    setSaving(true);
    try {
      // 1) consumir 1 crédito
      const { data: cons, error: cErr } = await supabase.rpc("consume_credit", {
        _user: user.id, _motivo: "registro_obra",
      });
      if (cErr) throw cErr;
      if (!cons) throw new Error("Saldo de créditos insuficiente");

      // 2) upload do arquivo (se houver)
      let arquivo_path: string | null = null;
      let arquivo_nome: string | null = null;
      let arquivo_mime: string | null = null;
      let arquivo_tamanho: number | null = null;
      if (f.file) {
        const ext = f.file.name.split(".").pop() || "bin";
        const path = `${user.id}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("obras").upload(path, f.file, {
          contentType: f.file.type || undefined,
        });
        if (upErr) throw upErr;
        arquivo_path = path;
        arquivo_nome = f.file.name;
        arquivo_mime = f.file.type || null;
        arquivo_tamanho = f.file.size;
      }

      const code = generateVerificationCode();
      const insertPayload: any = {
        user_id: user.id,
        verification_code: code,
        titulo: f.titulo.trim(),
        genero: f.genero.trim(),
        idioma: "pt-BR",
        ano: new Date().getFullYear(),
        letra: requerLetra ? f.letra : null,
        co_autores: f.co_autores,
        hash_sha256: hashes.sha256,
        hash_sha512: hashes.sha512,
        hash_arquivo_sha256: hashes.fileSha256 ?? null,
        hash_arquivo_sha512: hashes.fileSha512 ?? null,
        tipo_registro: f.tipo,
        ia_nivel: f.ia_nivel,
        ia_detalhes: f.ia_nivel === "parcial" ? f.ia_detalhes : null,
        qualificacao: f.qualificacao,
        endereco: f.endereco,
        arquivo_path, arquivo_nome, arquivo_mime, arquivo_tamanho,
        aceite_legal: true,
      };
      const { data: obra, error } = await supabase.from("obras").insert(insertPayload).select("id").single();
      if (error) throw error;

      // sincroniza perfil (best-effort)
      const profileUpd: any = {
        nome_completo: f.qualificacao.nome_completo,
        nome_artistico: f.qualificacao.nome_artistico || null,
        documento: f.qualificacao.cpf,
        telefone: f.qualificacao.telefone,
        email: f.qualificacao.email,
        ...f.endereco,
      };
      await supabase.from("profiles").update(profileUpd).eq("id", user.id);

      setResult({ code, obraId: obra.id, audioUrl });
      setStep(5);
      toast.success(`Obra registrada · ${code}`);
    } catch (e: any) {
      toast.error(e.message || "Falha ao registrar");
    } finally {
      setSaving(false);
    }
  }

  async function baixarCertidao() {
    if (!result || !hashes) return;
    const e = f.endereco;
    const endStr = `${e.logradouro}, ${e.numero}${e.complemento ? " - " + e.complemento : ""} — ${e.bairro}, ${e.cidade}/${e.uf} · CEP ${e.cep}`;
    await generateCertificatePDF({
      verification_code: result.code,
      titulo: f.titulo, genero: f.genero, idioma: "pt-BR",
      ano: new Date().getFullYear(), isrc: null,
      descricao: null,
      co_autores: f.co_autores,
      hash_sha256: hashes.sha256,
      hash_sha512: hashes.sha512,
      hash_arquivo_sha256: hashes.fileSha256 ?? null,
      hash_arquivo_sha512: hashes.fileSha512 ?? null,
      tipo_registro: f.tipo === "letra" ? "Apenas Letra" : f.tipo === "melodia" ? "Melodia/Partitura" : "Obra Completa",
      ia_nivel: f.ia_nivel === "nao" ? "Não (100% humana)" : f.ia_nivel === "sim" ? "Sim (100% IA)" : "Parcial (híbrida)",
      ia_detalhes: f.ia_nivel === "parcial" ? f.ia_detalhes : null,
      endereco: endStr,
      registered_at: new Date().toISOString(),
      autor_nome: f.qualificacao.nome_completo,
      autor_documento: f.qualificacao.cpf,
      autor_artistico: f.qualificacao.nome_artistico || null,
      verify_url: `${window.location.origin}/verificador?code=${result.code}`,
    });
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

        {balance !== null && balance <= 0 && !result && (
          <div className="space-y-6">
            <div className="glow-border rounded-2xl border-primary/40 bg-primary/5 p-6">
              <p className="text-[10px] uppercase tracking-[0.3em] text-primary">Checkout necessário</p>
              <h2 className="mt-1 font-display text-xl font-semibold">Você não possui créditos ativos</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Para gerar o certificado da sua obra, adquira créditos abaixo. O registro é liberado automaticamente
                assim que você ativar o token.
              </p>
            </div>
            <CreditosCheckout balance={balance} onCredited={(b) => setBalance(b)} compact />
          </div>
        )}

        {balance !== null && balance > 0 && (
        <>
        <ol className="mb-8 flex flex-wrap items-center gap-3">
          {steps.map((s) => {
            const active = s.n === step;
            const done = s.n < step;
            return (
              <li key={s.n} className="flex items-center gap-2">
                <span className={`grid h-8 w-8 place-items-center rounded-full border text-xs font-semibold ${
                  done ? "border-primary bg-primary/20 text-primary"
                    : active ? "border-primary bg-gradient-primary text-primary-foreground shadow-neon"
                    : "border-border/60 text-muted-foreground"
                }`}>
                  {done ? <Check className="h-4 w-4" /> : s.n}
                </span>
                <span className={`text-sm ${active ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</span>
                {s.n < steps.length && <span className="mx-1 h-px w-6 bg-border/60" />}
              </li>
            );
          })}
        </ol>

        <div className="glow-border rounded-2xl p-6 md:p-8">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="mb-3 font-display text-lg font-semibold text-foreground">Identificação pessoal</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <F label="Nome completo *"><input className={inp} value={f.qualificacao.nome_completo} onChange={(e) => updQ("nome_completo", e.target.value)} /></F>
                  <F label="Nome artístico"><input className={inp} value={f.qualificacao.nome_artistico} onChange={(e) => updQ("nome_artistico", e.target.value)} /></F>
                  <F label="CPF *"><input className={inp} value={f.qualificacao.cpf} onChange={(e) => updQ("cpf", e.target.value)} placeholder="000.000.000-00" /></F>
                  <F label="WhatsApp *"><input className={inp} value={f.qualificacao.telefone} onChange={(e) => updQ("telefone", e.target.value)} placeholder="(00) 90000-0000" /></F>
                  <F label="E-mail *"><input className={inp} type="email" value={f.qualificacao.email} onChange={(e) => updQ("email", e.target.value)} /></F>
                </div>
              </div>
              <div>
                <h2 className="mb-3 font-display text-lg font-semibold text-foreground">Residência</h2>
                <div className="grid gap-4 md:grid-cols-6">
                  <div className="md:col-span-2"><F label="CEP *"><input className={inp} value={f.endereco.cep} onChange={(e) => onCep(e.target.value)} placeholder="00000-000" /></F></div>
                  <div className="md:col-span-4"><F label="Logradouro *"><input className={inp} value={f.endereco.logradouro} onChange={(e) => updE("logradouro", e.target.value)} /></F></div>
                  <div className="md:col-span-2"><F label="Número *"><input className={inp} value={f.endereco.numero} onChange={(e) => updE("numero", e.target.value)} /></F></div>
                  <div className="md:col-span-4"><F label="Complemento"><input className={inp} value={f.endereco.complemento} onChange={(e) => updE("complemento", e.target.value)} /></F></div>
                  <div className="md:col-span-2"><F label="Bairro *"><input className={inp} value={f.endereco.bairro} onChange={(e) => updE("bairro", e.target.value)} /></F></div>
                  <div className="md:col-span-3"><F label="Cidade *"><input className={inp} value={f.endereco.cidade} onChange={(e) => updE("cidade", e.target.value)} /></F></div>
                  <div className="md:col-span-1"><F label="UF *"><input className={inp} value={f.endereco.uf} onChange={(e) => updE("uf", e.target.value.toUpperCase().slice(0, 2))} /></F></div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <F label="Título da música *"><input className={inp} value={f.titulo} onChange={(e) => upd("titulo", e.target.value)} /></F>
                <F label="Gênero musical *"><input className={inp} value={f.genero} onChange={(e) => upd("genero", e.target.value)} placeholder="Sertanejo, Pop, Trap…" /></F>
              </div>

              <F label="Tipo de registro *">
                <div className="grid gap-2 sm:grid-cols-3">
                  {[
                    { v: "letra", t: "Apenas Letra" },
                    { v: "melodia", t: "Melodia / Partitura" },
                    { v: "completa", t: "Obra Completa (Letra + Áudio)" },
                  ].map((o) => (
                    <button type="button" key={o.v}
                      onClick={() => upd("tipo", o.v as TipoReg)}
                      className={`rounded-lg border px-3 py-3 text-left text-sm ${
                        f.tipo === o.v ? "border-primary bg-primary/10 text-foreground" : "border-border/60 text-muted-foreground hover:border-primary/60"
                      }`}>{o.t}</button>
                  ))}
                </div>
              </F>

              <F label={`Upload do arquivo ${requerArquivo ? "*" : "(opcional)"} — .mp3 .wav .pdf`}>
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border/60 bg-background/40 px-4 py-8 text-sm text-muted-foreground hover:border-primary hover:text-primary">
                  <Upload className="h-4 w-4" />
                  {f.file ? `${f.file.name} · ${(f.file.size / 1024 / 1024).toFixed(2)} MB` : "Clique para selecionar o arquivo"}
                  <input type="file" accept=".mp3,.wav,.pdf,audio/*,application/pdf" className="hidden"
                    onChange={(e) => upd("file", e.target.files?.[0] ?? null)} />
                </label>
              </F>

              {requerLetra && (
                <F label="Letra da música *">
                  <textarea className={`${inp} min-h-[220px] font-mono text-sm`} value={f.letra} onChange={(e) => upd("letra", e.target.value)} placeholder="Digite ou cole a letra da sua música aqui" />
                </F>
              )}

              <F label="Declaração de uso de IA *">
                <div className="grid gap-2 sm:grid-cols-3">
                  {[
                    { v: "nao", t: "🔴 Não (100% Humana)", d: "Criação inteiramente humana" },
                    { v: "sim", t: "🟡 Sim (100% IA)", d: "Totalmente gerada por IA (Suno, Udio…)" },
                    { v: "parcial", t: "🔵 Parcial (Híbrida)", d: "Co-criação humano + IA" },
                  ].map((o) => (
                    <button type="button" key={o.v}
                      onClick={() => upd("ia_nivel", o.v as IANivel)}
                      className={`rounded-lg border p-3 text-left text-sm ${
                        f.ia_nivel === o.v ? "border-primary bg-primary/10" : "border-border/60 hover:border-primary/60"
                      }`}>
                      <p className="font-semibold text-foreground">{o.t}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{o.d}</p>
                    </button>
                  ))}
                </div>
              </F>
              {f.ia_nivel === "parcial" && (
                <F label="Detalhe o uso de IA *">
                  <textarea className={`${inp} min-h-[100px]`} value={f.ia_detalhes} onChange={(e) => upd("ia_detalhes", e.target.value)} placeholder="Ex: A base instrumental foi criada no Suno, mas letra e vocais são 100% autorais meus." />
                </F>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                A música possui coautores? Se sim, distribua a participação (soma <strong className="text-foreground">= 100%</strong> incluindo sua parte).
              </p>
              {f.co_autores.map((c, i) => (
                <div key={i} className="grid gap-3 md:grid-cols-[1fr_180px_140px_auto]">
                  <input className={inp} value={c.nome} placeholder="Nome completo"
                    onChange={(e) => { const a = [...f.co_autores]; a[i] = { ...a[i], nome: e.target.value }; upd("co_autores", a); }} />
                  <input className={inp} value={(c as any).cpf || ""} placeholder="CPF"
                    onChange={(e) => { const a = [...f.co_autores] as any; a[i] = { ...a[i], cpf: e.target.value }; upd("co_autores", a); }} />
                  <input className={inp} type="number" min={1} max={99} value={c.participacao} placeholder="%"
                    onChange={(e) => { const a = [...f.co_autores]; a[i] = { ...a[i], participacao: Number(e.target.value) }; upd("co_autores", a); }} />
                  <button type="button" onClick={() => upd("co_autores", f.co_autores.filter((_, j) => j !== i))}
                    className="grid h-10 w-10 place-items-center rounded-lg border border-border/60 text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button type="button"
                onClick={() => upd("co_autores", [...f.co_autores, { nome: "", participacao: 0 } as any])}
                className="inline-flex items-center gap-2 rounded-lg border border-border/60 px-3 py-2 text-sm hover:border-primary hover:text-primary">
                <Plus className="h-4 w-4" /> Adicionar coautor
              </button>
              <p className="text-xs text-muted-foreground">
                Sua participação: <span className="text-foreground">{Math.max(0, 100 - totalPart)}%</span> · Coautores: {totalPart}%
              </p>
              {f.co_autores.length > 0 && totalPart !== 100 && (
                <p className="text-xs text-destructive">A soma (autor principal + coautores) precisa ser exatamente 100%.</p>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              {hashing && (
                <div className="flex items-center gap-3 rounded-xl border border-primary/40 bg-primary/5 p-4 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  Calculando SHA-256 e SHA-512 localmente…
                </div>
              )}
              <div className="rounded-xl border border-border/60 bg-background/40 p-4">
                <div className="flex items-center gap-2 text-primary">
                  <Music4 className="h-4 w-4" />
                  <p className="text-sm font-semibold">{f.titulo}</p>
                </div>
                <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                  <I k="Autor" v={`${f.qualificacao.nome_completo}${f.qualificacao.nome_artistico ? ` — "${f.qualificacao.nome_artistico}"` : ""}`} />
                  <I k="CPF" v={f.qualificacao.cpf} />
                  <I k="Contato" v={`${f.qualificacao.telefone} · ${f.qualificacao.email}`} />
                  <I k="Endereço" v={`${f.endereco.logradouro}, ${f.endereco.numero} — ${f.endereco.bairro}, ${f.endereco.cidade}/${f.endereco.uf} · CEP ${f.endereco.cep}`} />
                  <I k="Gênero" v={f.genero} />
                  <I k="Tipo" v={f.tipo} />
                  <I k="IA" v={f.ia_nivel === "parcial" ? `Parcial — ${f.ia_detalhes}` : f.ia_nivel === "sim" ? "100% IA" : "100% Humana"} />
                  <I k="Coautores" v={f.co_autores.length ? f.co_autores.map((c) => `${c.nome} (${c.participacao}%)`).join(", ") : "Nenhum (autor único)"} />
                </dl>
                {audioUrl && (
                  <div className="mt-4">
                    <p className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">Player temporário do arquivo</p>
                    {f.file?.type.startsWith("audio") ? (
                      <audio controls src={audioUrl} className="w-full" />
                    ) : (
                      <p className="text-xs text-muted-foreground">{f.file?.name}</p>
                    )}
                  </div>
                )}
                {f.letra && (
                  <details className="mt-4">
                    <summary className="cursor-pointer text-xs uppercase tracking-wider text-muted-foreground">Ver letra transcrita</summary>
                    <pre className="mt-2 whitespace-pre-wrap font-mono text-xs text-foreground/80">{f.letra}</pre>
                  </details>
                )}
                {hashes && (
                  <div className="mt-4 space-y-2 rounded-lg border border-border/60 bg-background/60 p-3">
                    <HashRow label="SHA-256 (metadados)" v={hashes.sha256} />
                    <HashRow label="SHA-512 (metadados)" v={hashes.sha512} />
                    {hashes.fileSha256 && <HashRow label="SHA-256 do arquivo" v={hashes.fileSha256} />}
                    {hashes.fileSha512 && <HashRow label="SHA-512 do arquivo" v={hashes.fileSha512} />}
                  </div>
                )}
              </div>

              <label className="flex items-start gap-3 rounded-xl border border-primary/40 bg-primary/5 p-4 text-sm">
                <input type="checkbox" checked={f.aceite} onChange={(e) => upd("aceite", e.target.checked)} className="mt-1" />
                <span className="text-muted-foreground">
                  Declaro, sob as penas civis e criminais da <strong className="text-foreground">Lei Federal nº 9.610/98</strong> (Lei de Direitos Autorais),
                  que sou o(a) legítimo(a) autor(a)/coautor(a) desta obra e que todas as informações prestadas são verdadeiras.
                </span>
              </label>
            </div>
          )}

          {step === 5 && result && (
            <div className="space-y-6 text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gradient-primary shadow-neon">
                <ShieldCheck className="h-8 w-8 text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold text-gradient">Obra Blindada!</h2>
                <p className="mt-1 text-sm text-muted-foreground">Código público:
                  <span className="ml-2 rounded-md bg-primary/10 px-2 py-1 font-mono text-primary">{result.code}</span>
                </p>
                <p className="mt-2 text-xs text-muted-foreground">Ancoragem na blockchain Bitcoin será concluída assíncronamente — o TXID aparecerá no verificador quando disponível.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <button onClick={baixarCertidao} className="btn-neon inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold">
                  <Download className="h-4 w-4" /> Baixar Certidão PDF (QR)
                </button>
                <Link to="/fabrica" className="inline-flex items-center justify-center gap-2 rounded-lg border border-border/60 px-4 py-3 text-sm hover:border-primary hover:text-primary">
                  <Radio className="h-4 w-4" /> Enviar para Rádio Live
                </Link>
                <Link to="/portfolio" className="inline-flex items-center justify-center gap-2 rounded-lg border border-border/60 px-4 py-3 text-sm hover:border-primary hover:text-primary">
                  <Share2 className="h-4 w-4" /> Compartilhar portfólio
                </Link>
                <Link to="/obras" className="inline-flex items-center justify-center gap-2 rounded-lg border border-border/60 px-4 py-3 text-sm hover:border-primary hover:text-primary">
                  <Music4 className="h-4 w-4" /> Ir para Minhas Obras
                </Link>
              </div>
            </div>
          )}

          {step < 5 && (
            <div className="mt-8 flex items-center justify-between">
              <button type="button" disabled={step === 1}
                onClick={() => setStep((s) => Math.max(1, s - 1))}
                className="inline-flex items-center gap-2 rounded-lg border border-border/60 px-4 py-2 text-sm disabled:opacity-40">
                <ChevronLeft className="h-4 w-4" /> Voltar
              </button>
              {step < 4 ? (
                <button type="button" onClick={next}
                  className="btn-neon inline-flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold">
                  Continuar <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button type="button" disabled={saving || hashing || !f.aceite}
                  onClick={registrar}
                  className="btn-neon inline-flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold disabled:opacity-60">
                  <ShieldCheck className="h-4 w-4" />
                  {saving ? "Registrando…" : "Registrar Obra (1 crédito)"}
                </button>
              )}
            </div>
          )}
          </div>
        </>
        )}
        {balance === null && (
          <div className="glow-border rounded-2xl p-8 text-center text-sm text-muted-foreground">
            Carregando seu saldo…
          </div>
        )}
      </section>
    </SiteLayout>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
function I({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-muted-foreground">{k}</dt>
      <dd className="text-foreground">{v || "—"}</dd>
    </div>
  );
}
function HashRow({ label, v }: { label: string; v: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="break-all font-mono text-[10px] text-accent">{v}</p>
    </div>
  );
}