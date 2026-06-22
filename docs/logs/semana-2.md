# Semana 2 - API e CRUDs (08/jun - 14/jun)

**Sprint:** 2 de 4
**Foco da semana:** construir a API Express + SQLite e os primeiros
CRUDs do painel administrativo.

## Diario

### Segunda 08/jun
- Modelagem final do banco: `clientes`, `funcionarios`, `servicos`,
  `agendamentos`, `historico`. Schema em
  [server/db/init.sql](/abs/path/BarberManager/server/db/init.sql).
- Implementacao do helper `server/src/utils/db.js` promisificando
  `run`, `get` e `all` do sqlite3.
- Testes manuais abrindo o `data/barbermanager.db` com `sqlite3` no
  terminal.

### Terca 09/jun
- Rotas de clientes (GET, POST, PUT, DELETE) com
  `express-validator`. Arquivo
  [server/src/routes/clientes.js](/abs/path/BarberManager/server/src/routes/clientes.js).
- Rotas de funcionarios com bcrypt para o hash de senha
  ([server/src/routes/funcionarios.js](/abs/path/BarberManager/server/src/routes/funcionarios.js)).
- Bloqueio de duplicidade de cliente por telefone via SQL
  `INSERT OR IGNORE`.

### Quarta 10/jun
- Rotas de servicos: validacao de valor positivo, duracao em minutos
  ([server/src/routes/servicos.js](/abs/path/BarberManager/server/src/routes/servicos.js)).
- Rotas de agendamentos com checagem de conflito de horario por
  funcionario
  ([server/src/routes/agenda.js](/abs/path/BarberManager/server/src/routes/agenda.js)).
- Documentacao minima das rotas no README.

### Quinta 11/jun
- Sessao e login com `express-session` + cookie
  `connect.sid`. Arquivos
  [server/src/routes/auth.js](/abs/path/BarberManager/server/src/routes/auth.js)
  e [server/src/middleware/authMiddleware.js](/abs/path/BarberManager/server/src/middleware/authMiddleware.js).
- Bug encontrado: `auth.js` ainda chamava `mssql` (legado do scaffold).
  Removido e substituido por `req.db.get` no SQLite.
- Testes com `curl` validando login 200, login invalido 401, e
  sessao persistida no cookie.

### Sexta 12/jun
- Telas administrativas com Bootstrap 5: Clientes, Funcionarios,
  Servicos, Agenda, Historico. Formularios em React com `useState`.
- Build do cliente com `vite build` e teste de preview servindo o
  bundle em `dist/`.
- Reuniao de retrospectiva: cliente e servidor conversam via
  `fetch` com `credentials: include`.

## O que foi desenvolvido
- [x] Banco SQLite com 5 tabelas
- [x] CRUDs de clientes, funcionarios, servicos, agendamentos
- [x] Login de funcionario com sessao
- [x] 5 paginas administrativas com formularios

## O que sera desenvolvido na semana 3
- [ ] Dashboard com KPIs e graficos
- [ ] Historico de atendimentos com consultas filtradas
- [ ] Seed automatico de dados de demonstracao
- [ ] Refactor dos formularios em componentes reutilizaveis