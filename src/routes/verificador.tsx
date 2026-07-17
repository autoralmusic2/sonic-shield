import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/site/PagePlaceholder";

export const Route = createFileRoute("/verificador")({
  head: () => ({
    meta: [
      { title: "Verificador de Autenticidade — AutoralMusic" },
      { name: "description", content: "Valide um registro autoral pelo código AM-XXXXXXXX-2026 diretamente na blockchain Bitcoin." },
      { property: "og:title", content: "Verificador de Autenticidade — AutoralMusic" },
      { property: "og:description", content: "Valide registros autorais na blockchain Bitcoin." },
    ],
  }),
  component: () => (
    <PagePlaceholder
      eyebrow="Blockchain Bitcoin"
      title={<>Verificador de <span className="text-gradient">Autenticidade</span></>}
      description="Insira o código AM-XXXXXXXX-2026 para verificar o TXID na rede Bitcoin e consultar os dados públicos da obra."
    />
  ),
});