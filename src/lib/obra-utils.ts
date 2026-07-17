export type CoAutor = { nome: string; participacao: number };

export type ObraCanonical = {
  titulo: string;
  genero: string;
  idioma: string;
  ano: number;
  isrc: string;
  descricao: string;
  letra: string;
  co_autores: CoAutor[];
  autor_id: string;
};

export async function sha256Hex(input: string): Promise<string> {
  const buf = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function sha512Hex(input: string): Promise<string> {
  const buf = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-512", buf);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function hashFile(
  file: File,
  algo: "SHA-256" | "SHA-512",
): Promise<string> {
  const buf = await file.arrayBuffer();
  const digest = await crypto.subtle.digest(algo, buf);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export type ViaCep = {
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean;
};

export async function fetchViaCep(cep: string): Promise<ViaCep | null> {
  const clean = cep.replace(/\D/g, "");
  if (clean.length !== 8) return null;
  try {
    const r = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
    if (!r.ok) return null;
    const j = (await r.json()) as ViaCep;
    return j.erro ? null : j;
  } catch {
    return null;
  }
}

export function canonicalize(obra: ObraCanonical): string {
  const normalized = {
    titulo: obra.titulo.trim(),
    genero: obra.genero.trim(),
    idioma: obra.idioma.trim(),
    ano: obra.ano,
    isrc: obra.isrc.trim(),
    descricao: obra.descricao.trim(),
    letra: obra.letra.replace(/\r\n/g, "\n").trim(),
    co_autores: [...obra.co_autores]
      .map((c) => ({ nome: c.nome.trim(), participacao: Number(c.participacao) }))
      .sort((a, b) => a.nome.localeCompare(b.nome)),
    autor_id: obra.autor_id,
  };
  return JSON.stringify(normalized);
}

export function generateVerificationCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  let code = "";
  for (let i = 0; i < 8; i++) code += alphabet[bytes[i] % alphabet.length];
  return `AM-${code}-${new Date().getFullYear()}`;
}