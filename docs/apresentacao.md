# Apresentacao do Projeto Integrador - MVP

**Projeto:** Visagio Cabeleireiro + BarberManager
**Datas:** 22/jun (apresentacao) e 29/jun (entrega final)
**Tempo de apresentacao:** 10 minutos
**Versao:** v0.1.0-MVP (22/06/2026)

---

## Roteiro de apresentacao (10 minutos)

| Tempo | Bloco | O que mostrar | Observacoes para o apresentador |
| ----- | ----- | ------------- | ------------------------------ |
| 0:00 - 0:30 | Abertura | Nome do projeto, problema que resolve (barbearia sem agenda online) | Acordar o tom, falar do parceiro ficticio Visagio Cabeleireiro |
| 0:30 - 2:00 | Stack e arquitetura | Diagrama simples: Cliente (Vite/React) -> API (Express) -> SQLite | Mostrar a arvore do projeto e o `run.cmd` |
| 2:00 - 4:30 | Demo da vitrine (cliente) | Tela `/` da Visagio, fluxo de 4 passos, confirmar agendamento | Abrir o Chrome no `localhost:5173` ao vivo |
| 4:30 - 7:00 | Demo do painel (dono) | Login `/painel`, dashboard com KPIs, agenda, servicos | Mostrar que saareas distintas (marca, rotas, layout) |
| 7:00 - 8:00 | Versionamento e relatorios | Git, README, pasta `docs/`, plano de releases | Citar a politica de branches e como serao entregues os patch notes |
| 8:00 - 9:00 | Proximos passos | Roadmap MVP -> v1.0 (pagamento online, notificacoes, app PWA) | Deixar claro o escopo que cabe no MVP |
| 9:00 - 10:00 | Q&A | Perguntas da banca | Anotar duvidas para a entrega do dia 29 |

Dica: treine o demo com internet estavel e a aplicacao ja aberta. Trocar entre a aba da vitrine e a aba do painel em 2 cliques cada.

---

## 1. Sumario / Introducao

O **Visagio Cabeleireiro + BarberManager** e um sistema de gestao para
barbearias composto por dois produtos bem separados:

1. **Visagio Cabeleireiro** - vitrine online que o cliente acessa pelo
   navegador do celular para conhecer servicos, ver fotos dos
   profissionais e reservar horario em ate 30 segundos.
2. **BarberManager** - painel administrativo usado apenas pelo dono da
   barbearia, com dashboard de KPIs, agenda consolidada, cadastro de
   clientes, funcionarios, servicos e historico de atendimentos.

O MVP resolve tres problemas reais do dia a dia de uma barbearia
pequena: telefone tocando sem parar para marcar horario, agenda de papel
perdida no final do dia e falta de indicadores para precificar servicos.

---

## 2. Descritivo do projeto

### 2.1 Como foi feito

- **Metodologia:** Kanban simplificado com um quadro no GitHub
  Projects. Cada funcionalidade virou uma *issue* e cada *merge*
  fechou a *issue* com referencia cruzada.
- **Ciclos curtos:** commits pequenos e descritivos a cada bloco
  funcional (ex.: "feat(vitrine): cards de servico com imagem").
- **Conventions:** prefixos `feat`, `fix`, `chore`, `docs`,
  `refactor`; classes utilitarias com prefixo `vg-` para a vitrine
  e `bm-` para o painel para evitar colisao de CSS.

### 2.2 Stack tecnologico

| Camada          | Tecnologia                                         |
| --------------- | -------------------------------------------------- |
| Front vitrine   | React 19 + Vite 8 + TypeScript 6 + Bootstrap 5     |
| Front painel    | Mesmo client React, com layout e rotas proprias    |
| Graficos        | Chart.js 4 + react-chartjs-2                       |
| API             | Node.js 24 + Express 5 + express-validator        |
| Banco de dados  | SQLite (arquivo `data/barbermanager.db`)            |
| Autenticacao    | `express-session` + `bcryptjs`                     |
| Versionamento   | Git + GitHub                                       |
| Deploy previsto | Hospedagem compartilhada Linux (Node 20+)          |

### 2.3 Ambiente de desenvolvimento

- **SO:** Windows 10 com PowerShell 7.
- **Editor:** VS Code.
- **Node:** 24.14.1 + npm 11.11.0.
- **Banco:** SQLite via `sqlite3` (driver nativo Node).
- **Subida local:** `run.cmd` (instala deps, semeia o banco, sobe API
  em `:5000` e Vite em `:5173`).
- **Acesso:** http://localhost:5173/ (vitrine) e
  http://localhost:5173/painel (painel do dono, exige login).

---

## 3. Funcionalidades de uso (com prints de tela)

> Inserir as capturas reais em `docs/prints/` e referenciar aqui.

### 3.1 Vitrine - Visagio Cabeleireiro (`/`)

- Hero com a marca "Visagio Cabeleireiro" e passo a passo numerado.
- Catalogo de servicos em cards com foto, duracao e preco.
- Equipe com fotos reais (Unsplash) para humanizar a escolha.
- Calendario com grade de horarios livres/ocupados puxados da API.
- Resumo lateral em tempo real com o total previsto.

### 3.2 Fluxo de agendamento (cliente)

1. Selecao do servico em cards (estado `is-selected`).
2. Selecao do profissional em cards com foto.
3. Data + grade de horarios (horarios ocupados riscados).
4. Formulario de contato e confirmacao.

Prints: `Agendar1.png`, `Agendar2.png`, `Painel1.png`,
`Painel2.png`.

### 3.3 Painel - BarberManager (`/painel`)

- **Login** simples (`AdminLogin.tsx`) com sessao em cookie.
- **Dashboard:** 4 KPIs (clientes, equipe, agendamentos do dia,
  faturamento previsto), card de proximo atendimento, grafico de
  atendimentos por funcionario, donut de servicos mais vendidos e
  agenda do dia com seletor de data.
- **Agenda:** lista completa + formulario de novo agendamento.
- **Clientes, Funcionarios, Servicos, Historico:** CRUDs completos.

Prints: `06-login.png`, `07-dashboard.png`, `08-agenda.png`,
`09-cadastros.png`.

### 3.4 Casos de uso cobertos pelo MVP

| Caso de uso                       | Ator        | Status |
| --------------------------------- | ----------- | ------ |
| Reservar horario pelo celular     | Cliente     | OK     |
| Conflito de horario impedido      | Sistema     | OK     |
| Cadastrar cliente sem repetir     | Sistema     | OK     |
| Visualizar faturamento do dia     | Dono        | OK     |
| Cancelar agendamento              | Dono        | OK     |
| Login de dono com sessao          | Dono        | OK     |

---

## 4. Ambiente de instalacao (implantacao)

### 4.1 Onde rodar

- **Aplicacao web** acessada por navegadores (Chrome, Edge, Safari
  mobile).
- **Servidor:** qualquer hospedagem Node 20+ (Hostinger, Render,
  Railway, VPS Linux). Banco SQLite em arquivo, sem dependencia
  externa.
- **Maquinas dos funcionarios:** nao precisam de instalacao - usam o
  navegador do celular ou do computador da recepcao.
- **Cliente final:** 100% pelo celular, sem precisar baixar app.

### 4.2 Pre-requisitos

- Node 20 LTS ou superior.
- 512 MB de RAM para a API + cliente estatico.
- Porta 5000 (API) e 5173 (preview) ou 80/443 em producao.

### 4.3 Instalacao em 3 comandos

```
git clone https://github.com/.../BarberManager.git
cd BarberManager
run.cmd
```

`run.cmd` em si:

1. Verifica e instala `server/node_modules` e `client/node_modules`.
2. Roda `node server/seed.js` para popular o banco de demonstracao.
3. Sobe `npm run dev` no servidor e `npm run dev` no cliente em
   janelas separadas via `start.js`.

### 4.4 Variaveis de ambiente

Arquivo `server/.env` (ja versionado de exemplo):

```
DB_PATH=./data/barbermanager.db
SESSION_SECRET=trocar-em-producao
CLIENT_ORIGIN=http://localhost:5173
PORT=5000
```

Arquivo `client/.env`:

```
VITE_API_URL=http://localhost:5000
```

---

## 5. Versionamento

### 5.1 Estrategia de branches

- `main` - versao estavel, deploy de producao.
- `develop` - integracao das funcionalidades da sprint.
- `feature/<slug>` - uma feature por branch (ex.: `feature/painel-login`).
- `hotfix/<slug>` - correcoes urgentes em producao.

### 5.2 Convecao de commits

Padrao Conventional Commits, em portugues para manter coerencia com o
relatorio:

- `feat: nova vitrine da Visagio`
- `fix(painel): corrige erro no KPI de faturamento`
- `chore: atualiza dependencias`
- `docs: adiciona passo a passo de apresentacao`
- `refactor(vitrine): separa layout do admin`

### 5.3 Versao atual

- **v0.1.0-MVP** (22/06/2026) - vitrine + painel com login, KPIs e
  CRUDs basicos.
- Proxima: **v0.2.0** (29/06/2026) - entrega final com relatorio
  polido, paginacao, busca e historico de cancelamentos.
- **v1.0.0** - previsao 2a quinzena de julho: pagamento online,
  notificacoes WhatsApp e modo PWA instalavel.

---

## 6. Relatorios (artefatos de entrega)

### 6.1 Estrutura sugerida no repositorio

```
docs/
  apresentacao.md          <- este documento
  relatorio-final.md       <- documento exigido no dia 29/jun
  patch-notes/
    v0.1.0-mvp.md
    v0.2.0.md
  logs/
    semana-1.md
    semana-2.md
    semana-3.md
  prints/
    01-vitrine-hero.png
    ...
```

### 6.2 Patch notes por versao

#### v0.1.0-MVP (22/06/2026)

- Vitrine da Visagio Cabeleireiro com fotos em todos os cards.
- Fluxo de agendamento em 4 passos com grade de horarios ocupados.
- Painel BarberManager em `/painel` com login.
- Dashboard com KPIs, grafico de atendimentos e donut de servicos.
- Banco SQLite com seed automatico via `run.cmd`.

### 6.3 Logs diarios (resumo das ultimas semanas)

> Substituir o exemplo pelo registro real de cada dupla.

**Semana 1** - kick-off, escolha do problema, esboco do banco.

**Semana 2** - API Express com rotas de clientes, servicos,
funcionarios e agendamentos. Telas em Bootstrap com formularios.

**Semana 3** - graficos do dashboard, seed de dados, refactor para
componentes reutilizaveis.

**Semana 4 (atual)** - separacao da vitrine (Visagio) e do painel
(BarberManager), imagens em servicos e profissionais, responsividade
mobile-first, passo a passo de apresentacao.

### 6.4 O que ainda sera desenvolvido (ate 29/06)

- Relatorio final em `docs/relatorio-final.md` com introducao,
  descritivo, prints, ambiente e versionamento.
- Paginacao e busca no historico de atendimentos.
- Bloqueio de duplicidade de cliente por telefone.
- Documentacao de usuario final (manual de 1 pagina).
- Colecao completa de prints para a entrega.

---

## 7. Apresentacao do MVP funcionando (checklist antes de subir no palco)

- [ ] `run.cmd` rodou sem erro no notebook da bancada.
- [ ] API respondendo em `http://localhost:5000/api/health` (200).
- [ ] Vitrine aberta em `http://localhost:5173/` com fotos visiveis.
- [ ] Painel aberto em `http://localhost:5173/painel/dashboard`
      (apos login).
- [ ] Aba de demonstracao em modo anonimo para nao mostrar
      historico pessoal.
- [ ] Roteiro deste markdown impresso ou em outro monitor.
- [ ] Backup de internet (roteador 4G) caso a wifi da sala caia.
- [ ] Relogio visivel para controlar os 10 minutos.

---

## 8. FAQ provavel da banca

**Por que dois produtos em um so projeto?**
Porque o cliente nao precisa saber que existe um painel - a marca
dele e a barbearia. O sistema interno e da barbearia, nao do cliente.

**Por que SQLite e nao PostgreSQL?**
Para o MVP, SQLite elimina a dependencia de um servidor de banco. A
migracao para Postgres esta prevista na v1.0.

**Por que nao tem app nativo?**
PWA resolve celular sem exigir publicacao na Play Store. Esta no
roadmap.

**Como o cliente recebe a confirmacao?**
Por enquanto aparece no resumo da propria pagina. WhatsApp sera
adicionado na v1.0.

**Quanto custa a hospedagem?**
Plano Node compartilhado (a partir de R$ 15/mes) cobre o MVP.