# Semana 1 - Kick-off e descoberta (01/jun - 07/jun)

**Sprint:** 1 de 4
**Integrantes:** [preencher nomes da dupla]
**Foco da semana:** entender o problema, definir escopo do MVP e preparar
o ambiente de desenvolvimento.

## Diario

### Segunda 01/jun
- Abertura do projeto integrador e formacao das duplas.
- Brainstorming de problemas reais enfrentados por micro e pequenas
  barbearias: agenda de papel, telefone tocando o dia todo, falta de
  controle de faturamento.
- Definicao do escopo do MVP: **vitrine para o cliente** + **painel
  administrativo para o dono**.

### Terca 02/jun
- Pesquisa de mercado rapida (Booksy, Trinks, Scheduly) para entender
  o minimo viavel que diferencia o nosso produto.
- Decisao pela parceria ficticia "Visagio Cabeleireiro" para a vitrine.
- Decisao pelo nome do sistema interno: **BarberManager**.
- Desenho do esboco do banco de dados em papel (clientes, funcionarios,
  servicos, agendamentos, historico).

### Quarta 03/jun
- Criacao do repositorio no GitHub e configuracao do Git local.
- Adicionado `.gitignore` para `node_modules`, `dist` e `.env`.
- Definida a politica de branches: `main`, `develop`,
  `feature/<slug>`, `hotfix/<slug>`.
- Documento de visao do produto salvo em `README.md` (versao inicial).

### Quinta 04/jun
- Setup do ambiente: instalacao do Node 24, VS Code com extensoes
  ESLint e Prettier.
- Scaffold do projeto: pasta `server/` (Express) e `client/`
  (Vite + React + TypeScript).
- Escolha do SQLite como banco do MVP para evitar dependencia
  externa.

### Sexta 05/jun
- Configuracao do `concurrently` no `start.js` para subir API e
  cliente em paralelo.
- Primeira versao do `run.cmd` (apenas chamando `start.js`).
- Reuniao de retrospectiva: equipe alinhada, escopo realista.

## O que foi desenvolvido
- [x] Definicao do problema e escopo
- [x] Esboco do banco de dados
- [x] Repositorio e politica de branches
- [x] Scaffold do monorepo (server + client)
- [x] `run.cmd` inicial

## O que sera desenvolvido na semana 2
- [ ] Modelagem final do banco (SQL)
- [ ] Rotas REST de clientes, funcionarios, servicos e agendamentos
- [ ] Telas administrativas com Bootstrap
- [ ] Primeiro end-to-end: cadastrar cliente -> cadastrar servico ->
      criar agendamento