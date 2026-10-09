"use client";

import { useCallback, useEffect, useState } from "react";

type Health = "up" | "slow" | "down";

type CheckResult = {
  name: string;
  url: string;
  health: Health;
  status: number | null;
  ms: number;
  error: string | null;
  checkedAt: string;
};

type Payload = {
  generatedAt: string;
  overall: { health: Health; up: number; total: number; avgMs: number };
  results: CheckResult[];
  history: { at: string; health: Health; avgMs: number }[];
};

const LABEL: Record<Health, string> = { up: "Operacional", slow: "Lenta", down: "Indisponível" };

/** Só a requisição — sem estado, para poder ser usada dentro de effect sem
 *  chamar setState de forma síncrona (react-hooks/set-state-in-effect). */
async function fetchStatus(): Promise<Payload> {
  const res = await fetch("/api/status", { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export function StatusBoard() {
  const [data, setData] = useState<Payload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await fetchStatus());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  // Primeira carga: nada de setState síncrono no corpo do effect — as atualizações
  // acontecem depois do `await`, e `cancelled` evita estado após unmount.
  useEffect(() => {
    let cancelled = false;
    fetchStatus()
      .then((d) => {
        if (!cancelled) {
          setData(d);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="board">
      <div className="toolbar">
        <button onClick={load} disabled={loading}>
          {loading ? "Verificando…" : "Verificar agora"}
        </button>
        {data && (
          <span className="stamp">
            última verificação {new Date(data.generatedAt).toLocaleTimeString()}
          </span>
        )}
      </div>

      {error && <p className="error">Falha ao consultar /api/status: {error}</p>}

      {data && (
        <>
          <div className={`overall ${data.overall.health}`}>
            <span className="dot" />
            <div>
              <b>{LABEL[data.overall.health]}</b>
              <span>
                {data.overall.up}/{data.overall.total} serviços · latência média{" "}
                {data.overall.avgMs} ms
              </span>
            </div>
            {data.history.length > 1 && (
              <div className="history" title="Últimas verificações">
                {data.history.map((h, i) => (
                  <i key={i} className={h.health} />
                ))}
              </div>
            )}
          </div>

          <ul className="services">
            {data.results.map((r) => (
              <li key={r.url} className={r.health}>
                <span className="dot" />
                <div className="meta">
                  <a href={r.url} target="_blank" rel="noreferrer">
                    {r.name}
                  </a>
                  <span className="url">{r.url}</span>
                </div>
                <div className="nums">
                  <span className="code">{r.status ?? "—"}</span>
                  <span className="ms">{r.ms} ms</span>
                  <span className="tag">{LABEL[r.health]}</span>
                </div>
                {r.error && <p className="err">{r.error}</p>}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
