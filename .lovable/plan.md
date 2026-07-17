# AutoralMusic — Plano de Construção

O escopo é muito grande (site institucional + painel completo do compositor + rádio + blockchain + gerador de contratos + painel admin). Vou entregar em **fases**, começando por uma base sólida com design cyberpunk premium e a Home completa, depois camadas de funcionalidade.

## Fase 1 — Fundação de Design + Home Pública (esta entrega)

**Design System (dark cyberpunk premium)**
- Paleta neon: azul elétrico, roxo vibrante, rosa/magenta neon, fundo quase preto com gradientes
- Tokens em `src/styles.css` (oklch): background, primary (azul neon), secondary (roxo), accent (rosa neon), glow shadows, gradientes
- Tipografia: display futurista (Orbitron/Space Grotesk) + body legível (Inter), carregadas via `<link>` no `__root.tsx`
- Variantes shadcn customizadas: botão `neon`, `hero`, cards com borda glow, efeitos hover

**Home Page completa** (`/`)
- Header sticky com logo, navegação (Início, Fábrica de Canções, Ranking, Busca, Cadastro, Entrar)
- Hero com título "Tecnologia Ancorada em Blockchain Bitcoin", CTAs neon
- Seção Fábrica de Canções (preview rádio + ranking top #10)
- 4 Pilares (Auditoria/Lei, Fábrica Live, Marketing, Acordo Jurídico) em cards neon
- Tabela de Planos e Créditos (Cortesia → Combo Max)
- Footer com contatos

**Rotas placeholder** (páginas com estrutura básica, expansão nas fases seguintes)
- `/fabrica`, `/ranking`, `/busca`, `/cadastro`, `/entrar`, `/verificador`
- `/painel` (Menu interno após login)

**SEO**: title, description, og tags específicas por rota. Sitemap + robots.

## Fase 2 — Autenticação + Painel do Compositor
- Lovable Cloud (auth email/senha + Google) — perguntarei sobre perfis
- Tabelas: `profiles`, `obras`, `coautores`, `creditos`, `tokens`, `transmissoes`, `likes` com RLS
- Rotas `_authenticated`: Painel, Meu Perfil, Meu Portfólio, Créditos, Segurança

## Fase 3 — Registrar Músicas (wizard 5 passos)
- ViaCEP, upload de áudio (Storage), transcrição de letra, declaração de IA
- Split sheet com validação 100%
- Hash SHA-256/SHA-512 client-side (Web Crypto API)
- Geração de certificado PDF (jsPDF) com QR Code
- Consumo de créditos

## Fase 4 — Fábrica de Canções + Portfólio Público
- Player com curtir/rejeitar, ranking semanal, busca por letra
- Portfólio público `/artista/:slug` com player, links sociais, WhatsApp licenciamento

## Fase 5 — Gerador de Contratos + Verificador + Admin
- Editor de minutas (cessão / split), export PDF
- Verificador de autenticidade por código AM-XXXXXXXX-2026
- Painel admin `/autoral-admin-gate?key=...` com geração de tokens SHA-256 vinculados ao CPF

## Detalhes Técnicos

- Stack: TanStack Start (já configurado), Tailwind v4, shadcn, Lovable Cloud (Supabase)
- Blockchain "de verdade" (ancoragem Bitcoin/OpenTimestamps) exige integração externa — na Fase 3 simulo o TXID e a estrutura fica pronta para plugar um serviço real depois; posso conectar OpenTimestamps via API pública quando chegarmos lá
- WhatsApp: `wa.me` links com mensagens pré-preenchidas
- Pagamento é manual via Pix + token (conforme especificado), sem gateway

## O que preciso confirmar antes de seguir

1. **Confirma começar pela Fase 1** (design + Home + rotas placeholder) nesta entrega, e seguimos fase a fase nas próximas mensagens? Ou prefere que eu tente empacotar mais em uma entrega só (aviso: fica muito grande e maior risco de bugs)?
2. Alguma referência visual específica de cyberpunk que curte (ex: estética Blade Runner, synthwave, glassmorphism neon)? Se não, vou com **synthwave + glassmorphism** com glow forte em azul/roxo/rosa.
3. Logo: gero uma logo "AutoralMusic" estilizada neon, ou você tem uma imagem para enviar?