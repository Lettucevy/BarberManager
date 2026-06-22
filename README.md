# Visagio Cabeleireiro + BarberManager

O projeto tem duas areas bem separadas:

- **Visagio Cabeleireiro** - vitrine online que os clientes acessam para
  conhecer os servicos, ver fotos dos profissionais e reservar horario.
  Vive em / (e /agendar).
- **BarberManager** - painel administrativo restrito ao dono do
  estabelecimento. Vive em /painel (com login) e abriga dashboard,
  agenda, clientes, funcionarios, servicos e historico.

O cliente nunca ve referencias ao BarberManager e nao tem link para o
painel. As duas areas compartilham apenas a API em
http://localhost:5000.

## Como rodar

No Windows:

`
run.cmd
`

O launcher instala as dependencias (se faltarem), roda seed.js para
popular o banco SQLite com fotos e dados de demonstracao, e sobe a API
e o Vite em paralelo.

Abra http://localhost:5173/ para a vitrine ou http://localhost:5173/painel
para o painel.

## Estrutura

- client/src/layouts/VisagioLayout.tsx - casca da vitrine (marca,
  navegacao e rodape da Visagio).
- client/src/layouts/AdminLayout.tsx - casca do BarberManager
  (topbar com gaveta no celular, navegacao do painel).
- client/src/pages/ClienteAgendamento.tsx - vitrine em 4 passos.
- client/src/pages/AdminLogin.tsx - tela de login do painel.
- client/src/pages/Dashboard.tsx e demais paginas administrativas.
- server/src/routes/{servicos,funcionarios}.js - expostos com o campo
  imagem para a vitrine.
- server/seed.js - popula servicos e profissionais com fotos reais do
  Unsplash para demonstracao.

## Mobile first

A vitrine foi desenhada mobile-first com breakpoints em 1024/860/640/380.
O painel administrativo tambem colapsa a navegacao em gaveta abaixo de
860px. Todos os cards e botoes foram testados via Chrome headless em
390x844 (mobile) e 1280x900 (desktop).
