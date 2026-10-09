import { StatusBoard } from "@/components/StatusBoard";

export default function HomePage() {
  return (
    <main className="page">
      <header className="head">
        <h1>Status</h1>
        <p className="sub">
          Verificação ao vivo de serviços públicos: código HTTP, latência e se a resposta
          está dentro do limite esperado.
        </p>
      </header>
      <StatusBoard />
      <footer className="foot">
        <p>
          Feito com Next.js · cada verificação sai do <code>server</code>, então nenhum
          navegador é exposto a cross-origin.{" "}
          <a href="https://github.com/Foxy556/status-page">código no GitHub</a>
        </p>
      </footer>
    </main>
  );
}
