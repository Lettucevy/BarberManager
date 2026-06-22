# Semana 3 - Dashboard e graficos (15/jun - 21/jun)

**Sprint:** 3 de 4
**Foco da semana:** transformar dados em informacao para o dono da
barbearia e preparar a base visual do produto.

## Diario

### Segunda 15/jun
- Endpoint `/api/dashboard/summary` retornando totais e proximo
  atendimento.
- Endpoint `/api/dashboard/top-services` agregando historico por
  servico.
- Endpoint `/api/dashboard/attendance-by-employee` agregando
  atendimentos por funcionario.
- Arquivo [server/src/routes/dashboard.js](/abs/path/BarberManager/server/src/routes/dashboard.js).

### Terca 16/jun
- Instalacao do `chart.js` e `react-chartjs-2` no client.
- Pagina Dashboard com 4 cards de KPI, grafico de barras de
  atendimentos por funcionario e grafico de pizza de servicos mais
  vendidos
  ([client/src/pages/Dashboard.tsx](/abs/path/BarberManager/client/src/pages/Dashboard.tsx)).
- Configuracao dos registros de Chart.js (`CategoryScale`,
  `BarElement`, `ArcElement`, `Tooltip`, `Legend`).

### Quarta 17/jun
- Seed automatico em `server/seed.js`: popula clientes, funcionarios,
  servicos, agendamentos do dia e historico de 8 dias.
- Idempotencia: o seed so insere se as tabelas estiverem vazias
  (checagem com `SELECT COUNT(*)`).
- `run.cmd` agora roda `node seed.js` antes de subir os servidores.

### Quinta 18/jun
- Refactor das paginas CRUD para extrair `useEffect` e `fetch` em
  hook generico.
- Adicionado seletor de data na agenda do dashboard.
- Pequeno bug corrigido: o dashboard usava `new Date().getDate()`
  para "hoje" e quebrava em virada de mes. Substituido por
  `new Date().toISOString().slice(0, 10)`.

### Sexta 19/jun
- Testes de ponta a ponta via `curl` em todos os endpoints do painel.
- Build de producao do client e screenshot de cada tela via
  Chrome headless (versao inicial dos prints).
- Reuniao de retrospectiva: dados estao consistentes, agora falta
  separar a experiencia do cliente da experiencia do dono.

## O que foi desenvolvido
- [x] Endpoints de dashboard (summary, top services, attendance)
- [x] Pagina Dashboard com 2 graficos e 4 KPIs
- [x] Seed automatico via `run.cmd`
- [x] Hooks reutilizaveis para fetch

## O que sera desenvolvido na semana 4
- [ ] Separar a vitrine (Visagio) do painel (BarberManager) com
      layouts proprios
- [ ] Adicionar fotos nos servicos e profissionais
- [ ] Login de dono em `/painel` com sessao
- [ ] Responsividade mobile-first (breakpoints 1024/860/640/380)
- [ ] Documento de apresentacao do projeto integrador