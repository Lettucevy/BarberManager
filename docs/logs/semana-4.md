# Semana 4 - MVP, vitrine e apresentacao (22/jun - 29/jun)

**Sprint:** 4 de 4
**Entregas:** 22/jun (apresentacao do MVP) e 29/jun (entrega final do
relatorio).
**Foco da semana:** separar a experiencia do cliente da experiencia
do dono, deixar o sistema bonito no celular e preparar a defesa.

## Diario

### Segunda 22/jun
- Apresentacao do MVP para a banca com roteiro de 10 minutos
  ([docs/apresentacao.md](/abs/path/BarberManager/docs/apresentacao.md)).
- Demo ao vivo: vitrine em `/` e painel em `/painel/dashboard`.
- Feedback da banca: separar a marca "BarberManager" do nome da
  barbearia ficticia "Visagio Cabeleireiro" no que o cliente ve.

### Terca 23/jun
- Reorganizacao das rotas em
  [client/src/App.tsx](/abs/path/BarberManager/client/src/App.tsx) com
  layouts via `Outlet`:
  - `/` e `/agendar` -> `VisagioLayout` (marca da barbearia).
  - `/painel/*` -> `AdminLayout` (marca BarberManager).
- Criada a tela de login do dono
  ([client/src/pages/AdminLogin.tsx](/abs/path/BarberManager/client/src/pages/AdminLogin.tsx)).
- Removido todo link para o dashboard do fluxo da vitrine.

### Quarta 24/jun
- Adicionada coluna `imagem` em `servicos` e `funcionarios` via
  `ALTER TABLE` no `seed.js`.
- Atualizado o SELECT das rotas para devolver `imagem`.
- Cards da vitrine agora mostram foto do servico (4:3) e do
  profissional (4:5) com `object-fit: cover` e fallback Unsplash.

### Quinta 25/jun
- CSS dividido em secoes `vg-*` (vitrine) e `bm-*` (painel) no
  [client/src/App.css](/abs/path/BarberManager/client/src/App.css).
- Breakpoints responsivos em 1024, 860, 640 e 380 px.
- Testes de Chrome headless em 390x844 (mobile) e 1280x900 (desktop)
  para todas as paginas principais.

### Sexta 26/jun
- Documento `docs/apresentacao.md` refinado com roteiro cronometrado.
- Criados `docs/logs/semana-1.md` a `semana-4.md`.
- Criados `docs/patch-notes/v0.1.0-mvp.md` e `v0.2.0.md`.

## O que foi desenvolvido
- [x] Layouts separados (VisagioLayout / AdminLayout)
- [x] Login de dono em `/painel` com sessao persistida
- [x] Imagens reais em servicos e profissionais
- [x] Responsividade mobile-first da vitrine e do painel
- [x] Documentos de apresentacao, logs e patch notes

## O que sera desenvolvido ate 29/jun (entrega final)
- [ ] `docs/relatorio-final.md` completo (introducao, descritivo,
      prints, ambiente, versionamento, relatorios)
- [ ] Colecao de prints em `docs/prints/` para a defesa
- [ ] Manual de usuario de 1 pagina
- [ ] Paginacao e busca no historico
- [ ] Politica de bloqueio de duplicidade de cliente por telefone