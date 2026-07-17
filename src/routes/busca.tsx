import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/site/PagePlaceholder";

export const Route = createFileRoute("/busca")({
  head: () => ({
    meta: [
      { title: "Busca Inteligente — AutoralMusic" },
      { name: "description", content: "Pesquise por trechos de letras e filtre por gênero musical." },
      { property: "og:title", content: "Busca Inteligente — AutoralMusic" },
      { property: "og:description", content: "Pesquisa por trechos de letras e filtros por gênero." },
    ],
  }),
  component: () => (
    <PagePlaceholder
      eyebrow="Busca Inteligente"
      title={<>Encontre por <span className="text-gradient">trechos de letra</span></>}
      description="Pesquise obras por trechos de letras e filtre por gênero musical. Disponível após a Fase 2."
    />
  ),
});