import { jsPDF } from "jspdf";

export type ContractPayload = {
  tipo: "cessao" | "split";
  titulo: string;
  verification_code: string;
  hash_sha256: string;
  registered_at: string;
  autor_nome: string;
  autor_documento: string | null;
  autor_artistico: string | null;
  co_autores: { nome: string; participacao: number }[];
  cessionario?: { nome: string; documento: string };
};

export function generateContractPDF(p: ContractPayload) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const M = 56;
  let y = M;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(
    p.tipo === "cessao" ? "CONTRATO DE CESSÃO DE DIREITOS AUTORAIS" : "SPLIT SHEET — DIVISÃO DE PARTICIPAÇÃO AUTORAL",
    W / 2,
    y,
    { align: "center" },
  );
  y += 30;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Obra: ${p.titulo}`, M, y); y += 14;
  doc.text(`Código de registro: ${p.verification_code}`, M, y); y += 14;
  doc.text(`Hash SHA-256: ${p.hash_sha256}`, M, y, { maxWidth: W - 2 * M }); y += 24;
  doc.text(`Data de registro: ${new Date(p.registered_at).toLocaleString("pt-BR")}`, M, y); y += 24;

  doc.setFont("helvetica", "bold");
  doc.text("AUTOR PRINCIPAL", M, y); y += 14;
  doc.setFont("helvetica", "normal");
  doc.text(`${p.autor_nome}${p.autor_artistico ? ` (${p.autor_artistico})` : ""}`, M, y); y += 14;
  if (p.autor_documento) { doc.text(`Documento: ${p.autor_documento}`, M, y); y += 14; }
  y += 10;

  if (p.co_autores.length) {
    doc.setFont("helvetica", "bold");
    doc.text("COAUTORES", M, y); y += 14;
    doc.setFont("helvetica", "normal");
    p.co_autores.forEach((c) => {
      doc.text(`• ${c.nome} — ${c.participacao}%`, M, y);
      y += 14;
    });
    y += 10;
  }

  if (p.tipo === "cessao" && p.cessionario) {
    doc.setFont("helvetica", "bold");
    doc.text("CESSIONÁRIO", M, y); y += 14;
    doc.setFont("helvetica", "normal");
    doc.text(`${p.cessionario.nome} — Doc: ${p.cessionario.documento}`, M, y); y += 24;
  }

  const clausulas =
    p.tipo === "cessao"
      ? [
          "1. O(A) AUTOR(A), titular dos direitos patrimoniais sobre a obra acima identificada, cede e transfere ao CESSIONÁRIO, em caráter definitivo, os direitos de reprodução, distribuição e comunicação pública.",
          "2. A presente cessão preserva os direitos morais do autor, conforme Lei nº 9.610/98.",
          "3. A autenticidade da obra pode ser verificada publicamente pelo código de registro e hash SHA-256 acima, na plataforma AutoralMusic.",
          "4. As partes elegem o foro da comarca do autor para dirimir quaisquer controvérsias.",
        ]
      : [
          "1. Os coautores acima declaram, para todos os fins, a divisão de participação autoral sobre a obra identificada.",
          "2. Esta split sheet complementa o registro público realizado na plataforma AutoralMusic, cuja autenticidade é verificável pelo hash SHA-256 acima.",
          "3. Alterações posteriores exigirão termo aditivo assinado por todos os coautores.",
        ];

  doc.setFont("helvetica", "bold");
  doc.text("CLÁUSULAS", M, y); y += 16;
  doc.setFont("helvetica", "normal");
  clausulas.forEach((c) => {
    const lines = doc.splitTextToSize(c, W - 2 * M);
    doc.text(lines, M, y);
    y += lines.length * 12 + 8;
  });

  y += 30;
  doc.text("_________________________________", M, y);
  doc.text("_________________________________", W - M - 220, y);
  y += 14;
  doc.text(p.autor_nome, M, y);
  if (p.tipo === "cessao" && p.cessionario) doc.text(p.cessionario.nome, W - M - 220, y);
  else doc.text("Coautor / Testemunha", W - M - 220, y);

  doc.save(`${p.tipo}-${p.verification_code}.pdf`);
}