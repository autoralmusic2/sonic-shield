import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/site/PagePlaceholder";

export const Route = createFileRoute("/fabrica")({
  head: () => ({
    meta: [
      { title: "Fábrica de Canções — AutoralMusic" },
      { name: "description", content: "Rádio pública ao vivo de músicas inéditas com curtir/rejeitar e portfólio dos artistas." },
      { property: "og:title", content: "Fábrica de Canções — AutoralMusic" },
      { property: "og:description", content: "Rádio pública ao vivo de músicas inéditas." },
    ],
  }),
  component: () => (
    <PagePlaceholder
      eyebrow="Ao vivo agora"
      title={<>Fábrica de <span className="text-gradient">Canções</span></>}
      description="Rádio pública de músicas inéditas com player integrado, curtir/rejeitar e link direto para o portfólio do artista. O player completo estará disponível após a ativação da rádio ao vivo."
    />
  ),
});