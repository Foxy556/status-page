<div align="center">

# 📡 status-page

**Painel de status de serviços: código HTTP, latência e histórico das últimas verificações.**

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

---

## 🇧🇷 Por que

Toda equipe já teve a reunião *"o sistema caiu e ninguém sabe"*. Um painel de status
responde isso em uma olhada: o que está de pé, o que está lento e o que caiu — sem
precisar de login nem de dashboard caro.

As verificações rodam **no servidor**, então não há requisição cross-origin do navegador
e a lista de serviços nunca expõe nada privado.

---

## 🚀 Uso

```bash
git clone https://github.com/Foxy556/status-page.git
cd status-page
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

| Comando | Descrição |
|---|---|
| `npm run dev` | servidor de desenvolvimento |
| `npm run build` | build de produção |
| `npm run start` | servidor de produção |
| `npm run lint` | ESLint |

### API

```
GET /api/status            # verifica tudo
GET /api/status?timeout=3000  # timeout por serviço, em ms
```

```json
{
  "generatedAt": "2026-10-09T23:12:04.118Z",
  "overall": { "health": "up", "up": 5, "total": 5, "avgMs": 214 },
  "results": [
    { "name": "GitHub", "url": "https://github.com",
      "health": "up", "status": 200, "ms": 187,
      "error": null, "checkedAt": "2026-10-09T23:12:04.118Z" }
  ],
  "history": [{ "at": "…", "health": "up", "avgMs": 214 }]
}
```

### Configurando seus serviços

Por padrão monitora endpoints **públicos e estáveis** — qualquer pessoa que clone o repo
vê resultado real, sem credencial. Para usar a sua lista:

```bash
# .env.local
SERVICES='[{"name":"Minha API","url":"https://api.exemplo.com/health","slowMs":500}]'
```

---

## 🧠 Como é decidido o estado

| Estado | Condição |
|---|---|
| `up` | HTTP 2xx/3xx **e** latência ≤ `slowMs` |
| `slow` | HTTP 2xx/3xx **mas** latência > `slowMs` |
| `down` | HTTP 4xx/5xx, timeout ou falha de rede |

O timeout usa `AbortSignal.timeout`, então uma resposta pendurada não trava o painel —
o serviço vira `down` e o resto continua sendo verificado em paralelo.

`overall` é `down` se **qualquer** serviço caiu, `slow` se algum está lento, e `up` só
quando todos responderam dentro do limite.

> ⚠️ `history` vive na memória do processo e serve só para desenhar os últimos pontos.
> Em produção, troque por um banco.

---

## 📁 Estrutura

```
app/
├── layout.tsx            # html raiz e metadata
├── page.tsx              # shell da página
├── globals.css           # tema
└── api/status/route.ts   # executa as verificações (server)
components/
└── StatusBoard.tsx       # cliente: busca a API e desenha o painel
lib/
├── check.ts              # checkService / summarize / checkAll (puro)
└── services.ts           # lista monitorada + override por env
```

---

## 📄 Licença

Distribuído sob a licença [MIT](LICENSE).

---

<div align="center">

**Veja também:** [hostcheck](https://github.com/Foxy556/hostcheck) ·
[log-inspector](https://github.com/Foxy556/log-inspector) ·
[Perfil](https://github.com/Foxy556)

</div>
