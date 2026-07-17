import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Shield, Radio, Palette, Scale, Gift, Sparkles, ArrowRight,
  ThumbsUp, ThumbsDown, Play, Trophy, Bitcoin, FileCheck, Globe2, Zap,
  Instagram, Youtube, Music2, Check,
} from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import { SiteLayout } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/")({
  component: Index,
});

const PILLARS = [
  {
    icon: Scale,
    tag: "Pilar 01",
    title: "Auditoria e Lei Federal",
    subtitle: "Blindagem e Proteção Inabalável",
    features: [
      { icon: Bitcoin, text: "Ancoragem Bitcoin (Merkle Tree + timestamp inviolável)" },
      { icon: FileCheck, text: "Certidão PDF com duplo QR Code + SHA-256/SHA-512" },
      { icon: Globe2, text: "Eficácia em 181 Países (Lei 9.610/98 + Convenção de Berna)" },
    ],
  },
  {
    icon: Radio,
    tag: "Pilar 02",
    title: "Fábrica de Canções Live Engine",
    subtitle: "Aceleração de Carreira Dinâmica",
    features: [
      { icon: Zap, text: "Público interage com obras transmitidas ao vivo" },
      { icon: Trophy, text: "Ranking Hit Parade das músicas mais engajadas" },
      { icon: Sparkles, text: "Descoberta orgânica por gênero e engajamento" },
    ],
  },
  {
    icon: Palette,
    tag: "Pilar 03",
    title: "Marketing de Conversão",
    subtitle: "Portfólio de Elite Ativo",
    features: [
      { icon: Check, text: "Redes e Streaming unificados (Instagram, YouTube, TikTok, Spotify)" },
      { icon: Check, text: "Botão comercial de licenciamento via WhatsApp" },
      { icon: Check, text: "Split sheet e minuta de contrato prontos para gravadoras" },
    ],
  },
  {
    icon: Shield,
    tag: "Pilar 04",
    title: "Acordo Jurídico",
    subtitle: "Gerador de Minutas e Cessões",
    features: [
      { icon: Check, text: "Editor de contratos de cessão parcial e splits em tempo real" },
      { icon: Check, text: "Validação automática da soma de direitos em 100%" },
      { icon: Check, text: "Ilimitado a partir de 10 créditos" },
    ],
  },
];

const RANKING = [
  { pos: 1, title: "Sertão e Viola", author: "João Reis", genre: "Sertanejo Piseiro", likes: 1420, dislikes: 12 },
  { pos: 2, title: "Céu de Neon", author: "Marina Vox", genre: "Pop Eletrônico", likes: 1187, dislikes: 24 },
  { pos: 3, title: "Beco do Trap", author: "MC Zenit", genre: "Trap BR", likes: 1044, dislikes: 31 },
  { pos: 4, title: "Sal da Terra", author: "Duo Aurora", genre: "MPB", likes: 921, dislikes: 18 },
  { pos: 5, title: "Meia-Noite em Marte", author: "Kaiser", genre: "Synthwave", likes: 872, dislikes: 20 },
  { pos: 6, title: "Retrato Falado", author: "Lia Sanz", genre: "R&B", likes: 803, dislikes: 15 },
  { pos: 7, title: "Onda Boa", author: "Coisa Nossa", genre: "Reggae", likes: 771, dislikes: 22 },
  { pos: 8, title: "Faixa de Ouro", author: "Blindside", genre: "Rock Alt", likes: 720, dislikes: 26 },
  { pos: 9, title: "Bateria Fria", author: "Nova 21", genre: "Funk BH", likes: 689, dislikes: 33 },
  { pos: 10, title: "Coração de Bit", author: "Ana Cyber", genre: "Hyperpop", likes: 651, dislikes: 19 },
];

const PLANS = [
  { name: "Cortesia", credits: 1, price: "Grátis", highlight: false, note: "1 crédito grátis para começar" },
  { name: "Avulso", credits: 1, price: "R$ 9,90", highlight: false },
  { name: "Pocket", credits: 5, price: "R$ 29,90", highlight: false },
  { name: "Starter", credits: 10, price: "R$ 49,90", highlight: false, note: "Minutas ilimitadas" },
  { name: "Advanced", credits: 15, price: "R$ 64,90", highlight: true },
  { name: "Pro", credits: 25, price: "R$ 89,90", highlight: false },
  { name: "Premium", credits: 35, price: "R$ 114,90", highlight: false },
  { name: "Combo Max", credits: 50, price: "R$ 149,90", highlight: false, note: "Melhor custo por crédito" },
];

function Index() {
  return (
    <SiteLayout>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img src={heroBg} alt="" width={1920} height={1080} className="h-full w-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
        </div>

        <div className="mx-auto max-w-6xl px-4 pt-24 pb-28 text-center md:pt-32 md:pb-36">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary shadow-neon animate-neon-pulse">
            <Shield className="h-3.5 w-3.5" /> Tecnologia Ancorada em Blockchain Bitcoin
          </div>
          <h1 className="font-display text-4xl font-extrabold leading-tight md:text-6xl lg:text-7xl">
            Proteja sua obra. <br className="hidden md:block" />
            <span className="text-gradient">Monte seu Portfólio.</span> <br className="hidden md:block" />
            Domine o Mercado Musical.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground md:text-lg">
            AutoralMusic é o ecossistema definitivo para compositores: blindagem autoral,
            transmissão na rádio pública e vitrine profissional para gravadoras.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link to="/cadastro" className="btn-neon text-base">
              <Gift className="h-5 w-5" /> Garantir Meu Crédito Grátis
            </Link>
            <a href="#pilares" className="btn-ghost-neon text-base">
              Conhecer Ecossistema <ArrowRight className="h-5 w-5" />
            </a>
          </div>

          <div className="mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { label: "Países", value: "181" },
              { label: "SHA", value: "256/512" },
              { label: "Lei", value: "9.610/98" },
              { label: "Blockchain", value: "Bitcoin" },
            ].map((s) => (
              <div key={s.label} className="glow-border rounded-xl px-4 py-3 text-center">
                <div className="font-display text-xl font-bold text-gradient">{s.value}</div>
                <div className="text-[11px] uppercase tracking-widest text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FÁBRICA + RANKING PREVIEW */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-8 lg:grid-cols-5">
          {/* Rádio ao vivo */}
          <div className="glow-border rounded-2xl p-6 lg:col-span-2">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-accent">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent/70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              Ao vivo agora
            </div>
            <h3 className="mt-3 font-display text-2xl font-bold">Fábrica de Canções</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Rádio pública de músicas inéditas. Curta, rejeite e descubra novos talentos.
            </p>

            <div className="mt-6 rounded-xl bg-surface-elevated/60 p-4">
              <div className="flex items-center gap-4">
                <button className="grid h-14 w-14 place-items-center rounded-full bg-gradient-primary shadow-neon">
                  <Play className="h-6 w-6 text-primary-foreground" />
                </button>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold">Sertão e Viola</div>
                  <div className="text-xs text-muted-foreground">João Reis · Sertanejo Piseiro</div>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div className="h-full w-2/5 bg-gradient-primary" />
                </div>
                <span className="text-xs text-muted-foreground">1:42 / 3:20</span>
              </div>
              <div className="mt-4 flex gap-2">
                <button className="btn-ghost-neon flex-1 !py-2 text-sm">
                  <ThumbsUp className="h-4 w-4" /> Curtir
                </button>
                <button className="btn-ghost-neon flex-1 !py-2 text-sm">
                  <ThumbsDown className="h-4 w-4" /> Rejeitar
                </button>
              </div>
              <Link to="/fabrica" className="btn-neon mt-3 !py-2 w-full text-sm">
                Ver Portfólio do Artista <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Ranking */}
          <div className="glow-border rounded-2xl p-6 lg:col-span-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-primary">
                  <Trophy className="h-3.5 w-3.5" /> Hit Parade Semanal
                </div>
                <h3 className="mt-2 font-display text-2xl font-bold">Top #10 mais engajadas</h3>
              </div>
              <Link to="/ranking" className="btn-ghost-neon !py-2 !px-4 text-sm">Ver tudo</Link>
            </div>

            <ol className="mt-6 divide-y divide-border/60">
              {RANKING.map((r) => (
                <li key={r.pos} className="flex items-center gap-4 py-3">
                  <div className={`grid h-9 w-9 place-items-center rounded-lg font-display text-sm font-bold ${r.pos <= 3 ? "bg-gradient-primary text-primary-foreground shadow-neon" : "bg-muted text-muted-foreground"}`}>
                    #{r.pos}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold">{r.title}</div>
                    <div className="truncate text-xs text-muted-foreground">{r.author} · {r.genre}</div>
                  </div>
                  <div className="hidden items-center gap-3 text-xs md:flex">
                    <span className="inline-flex items-center gap-1 text-primary"><ThumbsUp className="h-3.5 w-3.5" /> {r.likes}</span>
                    <span className="inline-flex items-center gap-1 text-muted-foreground"><ThumbsDown className="h-3.5 w-3.5" /> {r.dislikes}</span>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* 4 PILARES */}
      <section id="pilares" className="mx-auto max-w-7xl px-4 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-secondary/40 bg-secondary/10 px-3 py-1 text-xs font-medium text-secondary">
            <Sparkles className="h-3.5 w-3.5" /> Ecossistema Completo
          </div>
          <h2 className="mt-4 font-display text-3xl font-bold md:text-5xl">
            Quatro <span className="text-gradient">pilares</span> para dominar o mercado
          </h2>
          <p className="mt-3 text-muted-foreground">
            Da blindagem jurídica ao licenciamento comercial — tudo em uma única plataforma.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {PILLARS.map((p) => (
            <article key={p.tag} className="glow-border rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-primary shadow-neon">
                  <p.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-widest text-accent">{p.tag}</div>
                  <h3 className="mt-1 font-display text-xl font-bold">{p.title}</h3>
                  <p className="text-sm text-muted-foreground">{p.subtitle}</p>
                </div>
              </div>
              <ul className="mt-5 space-y-3">
                {p.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <f.icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="text-muted-foreground">{f.text}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      {/* PLANOS */}
      <section id="planos" className="mx-auto max-w-7xl px-4 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-3xl font-bold md:text-5xl">
            Planos e <span className="text-gradient">Créditos</span>
          </h2>
          <p className="mt-3 text-muted-foreground">
            Pagamento único, sem assinatura. Créditos <b className="text-foreground">não expiram</b> e são acumulativos.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`glow-border relative rounded-2xl p-6 ${plan.highlight ? "border-accent/60 shadow-neon-pink" : ""}`}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-primary px-3 py-0.5 text-xs font-bold text-primary-foreground shadow-neon">
                  Popular
                </span>
              )}
              <div className="text-xs uppercase tracking-widest text-muted-foreground">{plan.name}</div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="font-display text-3xl font-bold text-gradient">{plan.price}</span>
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                {plan.credits} {plan.credits === 1 ? "crédito" : "créditos"}
              </div>
              {plan.note && <div className="mt-3 text-xs text-accent">{plan.note}</div>}
              <Link to="/cadastro" className="btn-ghost-neon mt-5 w-full !py-2 text-sm">
                Escolher
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="mx-auto max-w-5xl px-4 py-20">
        <div className="glow-border relative overflow-hidden rounded-3xl p-10 text-center">
          <div className="absolute inset-0 -z-10 opacity-60" style={{ backgroundImage: "var(--gradient-hero)" }} />
          <h2 className="font-display text-3xl font-bold md:text-4xl">
            Sua próxima obra pode virar o <span className="text-gradient">Top #1</span> da semana
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Cadastre-se grátis, ganhe 1 crédito de cortesia e blinde sua primeira composição em minutos.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/cadastro" className="btn-neon">
              <Gift className="h-5 w-5" /> Criar Conta Grátis
            </Link>
            <Link to="/entrar" className="btn-ghost-neon">Já sou compositor</Link>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1"><Instagram className="h-3.5 w-3.5" /> @autoralmusic</span>
            <span className="inline-flex items-center gap-1"><Youtube className="h-3.5 w-3.5" /> YouTube</span>
            <span className="inline-flex items-center gap-1"><Music2 className="h-3.5 w-3.5" /> Spotify</span>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
