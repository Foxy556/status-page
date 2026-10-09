import { NextResponse } from "next/server";
import { checkAll, summarize } from "@/lib/check";
import { servicesFromEnv } from "@/lib/services";

/**
 * Histórico em memória do processo — só para desenhar os últimos pontos do
 * painel. Não é persistência: some quando o processo reinicia. Em produção
 * troque por um banco.
 */
type Snapshot = { at: string; health: string; avgMs: number };
const history: Snapshot[] = [];
const MAX_HISTORY = 20;

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const timeout = Number(url.searchParams.get("timeout")) || 6000;

  const services = servicesFromEnv(process.env.SERVICES);
  const results = await checkAll(services, timeout);
  const overall = summarize(results);

  history.push({
    at: new Date().toISOString(),
    health: overall.health,
    avgMs: overall.avgMs,
  });
  if (history.length > MAX_HISTORY) history.shift();

  return NextResponse.json(
    { generatedAt: new Date().toISOString(), overall, results, history },
    { headers: { "Cache-Control": "no-store" } },
  );
}
