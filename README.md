# Agent Graph Builder | Orquestrador de Agentes

Ferramenta visual baseada em nós (*node-based canvas*) para arquitetar fluxos de agentes de IA (**Loops Trabalhador-Supervisor** e **Grafos Paralelos**) e compilá-los em um **Meta-Prompt estruturado de orquestração** pronto para ser copiado ou baixado em `.md` / `.txt`.

---

## Como Rodar com Docker

O projeto conta com um [Dockerfile](file:///home/antigravity/Dockerfile) *multi-stage* (Node 24 Alpine + Nginx 1.27 Alpine) e [docker-compose.yml](file:///home/antigravity/docker-compose.yml) prontos para produção e desenvolvimento.

### 1. Modo Produção (Recomendado — Nginx otimizado)
Compila a aplicação estática TypeScript/Vite e serve via Nginx na porta `3210`:

```bash
docker compose up --build -d
```
Acesse em: **http://localhost:3210**

Para encerrar o container:
```bash
docker compose down
```

### 2. Modo Desenvolvimento com Hot-Reload (Vite Dev Server)
Se desejar editar o código com *hot-reload* dentro do Docker na porta `5173`:

```bash
docker compose --profile dev up --build
```
Acesse em: **http://localhost:5173**

### 3. Usando Docker CLI puro (sem Docker Compose)
```bash
docker build -t agent-graph-builder .
docker run --rm -p 3210:8080 --name agent-graph-builder agent-graph-builder
```

---

## Como Rodar Localmente (Node.js)

```bash
npm install
npm run dev
```
