import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/site/PagePlaceholder";

export const Route = createFileRoute("/ranking")({
  head: () => ({
    meta: [
      { title: "Hit Parade — AutoralMusic" },
      { name: "description", content: "Ranking semanal das músicas mais engajadas na rádio pública AutoralMusic." },
      { property: "og:title", content: "Hit Parade — AutoralMusic" },
      { property: "og:description", content: "Ranking semanal das músicas mais engajadas." },
    ],
  }),
  component: () => (
    <PagePlaceholder
      eyebrow="Ranking Semanal"
      title={<>Hit <span className="text-gradient">Parade</span></>}
      description="Lista completa das músicas mais engajadas da semana, com destaque para o Top #10 por gênero e autor."
    />
  ),
});