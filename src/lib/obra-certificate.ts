import { jsPDF } from "jspdf";
import QRCode from "qrcode";

export type CertificatePayload = {
  verification_code: string;
  titulo: string;
  genero: string | null;
  idioma: string | null;
  ano: number | null;
  isrc: string | null;
  descricao: string | null;
  co_autores: { nome: string; participacao: number }[];
  hash_sha256: string;
  hash_sha512?: string | null;
  hash_arquivo_sha256?: string | null;
  hash_arquivo_sha512?: string | null;
  tipo_registro?: string | null;
  ia_nivel?: string | null;
  ia_detalhes?: string | null;
  endereco?: string | null;
  registered_at: string;
  autor_nome: string;
  autor_documento: string | null;
  autor_artistico: string | null;
  verify_url: string;
};

export async function generateCertificatePDF(p: CertificatePayload) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();

  // Dark background
  doc.setFillColor(11, 12, 26);
  doc.rect(0, 0, W, H, "F");

  // Neon frame
  doc.setDrawColor(168, 85, 247);
  doc.setLineWidth(2);
  doc.rect(24, 24, W - 48, H - 48);
  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(0.5);
  doc.rect(30, 30, W - 60, H - 60);

  // Header
  doc.setTextColor(236, 72, 153);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("AUTORALMUSIC · CERTIFICADO DE REGISTRO AUTORAL", W / 2, 60, { align: "center" });

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.text(p.titulo.toUpperCase(), W / 2, 100, { align: "center", maxWidth: W - 120 });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(180, 190, 220);
  doc.text(`Código público: ${p.verification_code}`, W / 2, 122, { align: "center" });

  // QR code
  const qrDataUrl = await QRCode.toDataURL(p.verify_url, {
    margin: 1,
    color: { dark: "#a855f7", light: "#0b0c1a" },
    width: 220,
  });
  doc.addImage(qrDataUrl, "PNG", W - 180, 150, 130, 130);
  doc.setFontSize(8);
  doc.setTextColor(150, 160, 200);
  doc.text("Escaneie para verificar", W - 115, 295, { align: "center" });

  // Data block
  let y = 170;
  const left = 60;
  const row = (label: string, value: string) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(120, 130, 170);
    doc.text(label.toUpperCase(), left, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(240, 240, 255);
    const lines = doc.splitTextToSize(value || "—", W - 260);
    doc.text(lines, left, y + 14);
    y += 14 + lines.length * 13 + 8;
  };

  row("Autor(a)", `${p.autor_nome}${p.autor_artistico ? ` — "${p.autor_artistico}"` : ""}`);
  if (p.autor_documento) row("Documento", p.autor_documento);
  if (p.endereco) row("Endereço declarado", p.endereco);
  row("Gênero / Idioma / Ano", `${p.genero || "—"} · ${p.idioma || "—"} · ${p.ano || "—"}`);
  if (p.tipo_registro) row("Tipo de registro", p.tipo_registro);
  if (p.ia_nivel) row("Declaração de IA", `${p.ia_nivel}${p.ia_detalhes ? ` — ${p.ia_detalhes}` : ""}`);
  if (p.isrc) row("ISRC", p.isrc);
  if (p.co_autores.length) {
    row(
      "Coautores",
      p.co_autores.map((c) => `${c.nome} (${c.participacao}%)`).join(", "),
    );
  }
  if (p.descricao) row("Descrição", p.descricao);
  row("Registrado em", new Date(p.registered_at).toLocaleString("pt-BR"));

  // Hash block
  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(0.4);
  doc.line(60, H - 200, W - 60, H - 200);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(120, 130, 170);
  doc.text("HASH SHA-256 DA OBRA (metadados)", 60, H - 180);
  doc.setFont("courier", "normal");
  doc.setFontSize(9);
  doc.setTextColor(94, 234, 212);
  const hashLines = doc.splitTextToSize(p.hash_sha256, W - 120);
  doc.text(hashLines, 60, H - 165);

  if (p.hash_arquivo_sha256) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(120, 130, 170);
    doc.text("HASH SHA-256 DO ARQUIVO", 60, H - 138);
    doc.setFont("courier", "normal");
    doc.setFontSize(8);
    doc.setTextColor(147, 197, 253);
    const fLines = doc.splitTextToSize(p.hash_arquivo_sha256, W - 120);
    doc.text(fLines, 60, H - 126);
  }

  // Footer
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(150, 160, 200);
  doc.text(
    "Este certificado comprova o registro da obra na plataforma AutoralMusic com carimbo de tempo e hash criptográfico único.",
    W / 2,
    H - 100,
    { align: "center", maxWidth: W - 120 },
  );
  doc.text(`Verifique em: ${p.verify_url}`, W / 2, H - 82, { align: "center" });
  doc.setTextColor(236, 72, 153);
  doc.setFont("helvetica", "bold");
  doc.text("AutoralMusic · Blindagem Autoral em Blockchain", W / 2, H - 60, { align: "center" });

  doc.save(`certificado-${p.verification_code}.pdf`);
}