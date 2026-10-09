/**
 * Serviços monitorados.
 *
 * Endpoints públicos e estáveis de propósito: qualquer pessoa que abra o repo
 * consegue rodar a página e ver resultado real, sem precisar de credencial.
 * Troque pela sua lista em produção.
 */
export type Service = {
  /** nome exibido no painel */
  name: string;
  /** URL verificada */
  url: string;
  /** tempo a partir do qual a resposta é considerada lenta (ms) */
  slowMs: number;
};

export const SERVICES: Service[] = [
  { name: "GitHub", url: "https://github.com", slowMs: 800 },
  { name: "Cloudflare (1.1.1.1)", url: "https://1.1.1.1", slowMs: 400 },
  { name: "Google DNS", url: "https://dns.google", slowMs: 800 },
  { name: "Example.com", url: "https://example.com", slowMs: 800 },
  { name: "HTTPBin", url: "https://httpbin.org/status/200", slowMs: 1200 },
];

/** Sobrescreve a lista via variável de ambiente (JSON array de Service). */
export function servicesFromEnv(raw: string | undefined): Service[] {
  if (!raw) return SERVICES;
  try {
    const parsed = JSON.parse(raw) as Partial<Service>[];
    const valid = parsed.filter(
      (s): s is Partial<Service> =>
        Boolean(s) && typeof s.name === "string" && typeof s.url === "string",
    );
    if (!valid.length) return SERVICES;
    return valid.map((s) => ({
      name: s.name as string,
      url: s.url as string,
      slowMs: typeof s.slowMs === "number" ? s.slowMs : 800,
    }));
  } catch {
    return SERVICES;
  }
}
