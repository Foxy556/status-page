import type { Service } from "./services";

export type Health = "up" | "slow" | "down";

export type CheckResult = {
  name: string;
  url: string;
  health: Health;
  status: number | null;
  ms: number;
  error: string | null;
  checkedAt: string;
};

/**
 * Mede um serviço. Nunca lança: erro vira `health: "down"`.
 * `AbortSignal.timeout` garante que uma resposta pendurada não segure o painel.
 */
export async function checkService(
  service: Service,
  timeoutMs = 6000,
): Promise<CheckResult> {
  const started = performance.now();
  const base = { name: service.name, url: service.url, checkedAt: new Date().toISOString() };

  try {
    const res = await fetch(service.url, {
      method: "GET",
      redirect: "follow",
      signal: AbortSignal.timeout(timeoutMs),
      cache: "no-store",
      headers: { "User-Agent": "status-page/1.0" },
    });
    const ms = Math.round(performance.now() - started);

    const health: Health = !res.ok
      ? "down"
      : ms > service.slowMs
        ? "slow"
        : "up";

    return { ...base, health, status: res.status, ms, error: null };
  } catch (err) {
    const ms = Math.round(performance.now() - started);
    const cause = err instanceof Error ? err.message : String(err);
    return {
      ...base,
      health: "down",
      status: null,
      ms,
      error: cause.split("\n")[0].slice(0, 160),
    };
  }
}

export type Overall = { health: Health; up: number; total: number; avgMs: number };

/** Consolida os resultados em um estado geral do sistema. */
export function summarize(results: CheckResult[]): Overall {
  const total = results.length;
  const up = results.filter((r) => r.health === "up").length;
  const down = results.filter((r) => r.health === "down").length;
  const avgMs = total
    ? Math.round(results.reduce((acc, r) => acc + r.ms, 0) / total)
    : 0;

  return {
    health: down > 0 ? "down" : up === total ? "up" : "slow",
    up,
    total,
    avgMs,
  };
}

/** Verifica todos em paralelo, mantendo a ordem da lista original. */
export async function checkAll(
  services: Service[],
  timeoutMs = 6000,
): Promise<CheckResult[]> {
  return Promise.all(services.map((s) => checkService(s, timeoutMs)));
}
