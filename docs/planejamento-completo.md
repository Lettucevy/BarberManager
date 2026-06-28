# Planejamento Completo — BarberManager + Visagio

## FASE 1 — Fundacao (reuso do que ja existe)

**Objetivo:** Preparar o terreno sem quebrar nada.

| # | Tarefa | O que fazer | Onde |
|---|--------|-------------|------|
| 1.1 | Coluna `observacao` nos agendamentos | Adicionar campo `observacao TEXT` na tabela `agendamentos` e no fluxo de criacao | `init.sql`, `seed.js`, `agenda.js`, `ClienteAgendamento.tsx` |
| 1.2 | Conectar observacao no backend | Persistir observacao do form no backend | `agenda.js` POST |
| 1.3 | Bloqueio de duplicidade de cliente por telefone | Find-or-create: se telefone existir, retorna o cliente atual | `clientes.js` POST |
| 1.4 | Paginacao no historico | Adicionar `LIMIT/OFFSET` + `?page=&limit=` | `historico.js`, `Historico.tsx` |

**Status:** CONCLUIDA

---

## FASE 2 — Experiencia do Cliente (Vitrine)

### 2.1 Conta do Cliente (autoatendimento)

| # | Tarefa | Detalhes |
|---|--------|----------|
| 2.1.1 | Backend: login de cliente | Rotas `/api/auth/cliente/{register,login,logout,me}`. Tabela `clientes.senha_hash` |
| 2.1.2 | Frontend: "Minha Conta" | Pagina `/minha-conta` com login/register toggle |
| 2.1.3 | Frontend: "Meus Agendamentos" | Pagina `/minha-conta/agendamentos` com lista, cancelar, reagendar |
| 2.1.4 | Cancelamento proprio | Botao "Cancelar" na listagem com confirmacao |
| 2.1.5 | Reagendamento rapido | Seletor de nova data/hora inline com validacao de disponibilidade |

### 2.2 Fluxo Inteligente (logado vs convidado)

| # | Tarefa | Detalhes |
|---|--------|----------|
| 2.2.1 | Pular step 4 quando logado | Se logado, step "4. Seus dados" some; usa dados da conta |
| 2.2.2 | Status de login no menu | Mostra nome do cliente ou "Minha conta" no header |
| 2.2.3 | Manter agendamento sem conta | Convidado continua com step 4 normal |
| 2.2.4 | Link .ics (calendario) | Botao "+ Calendario" no `MeusAgendamentos.tsx` |

### 2.3 Lembretes e Notificacoes (pendente)

| # | Tarefa | Detalhes |
|---|--------|----------|
| 2.3.1 | Integracao WhatsApp | Usar Z-API, WATI ou WhatsApp Cloud API |
| 2.3.2 | Notificacao de cancelamento | Avisar admin em tempo real |
| 2.3.3 | Adicionar ao calendario | Link .ics ja implementado |

### 2.4 Fila de Espera (pendente)

| # | Tarefa | Detalhes |
|---|--------|----------|
| 2.4.1 | Nova tabela `fila_espera` | `id, cliente_id, funcionario_id, servico_id, data, hora_desejada, created_at` |
| 2.4.2 | Frontend: "Avise-me se abrir" | Botao ao lado dos horarios ocupados |
| 2.4.3 | Notificacao automatica | Checar fila ao cancelar agendamento |

### 2.5 Fidelidade (pendente)

| # | Tarefa | Detalhes |
|---|--------|----------|
| 2.5.1 | Nova tabela `fidelidade` | `id, cliente_id, pontos, visitas, ultima_visita` |
| 2.5.2 | Acumular pontos | Regra: X pontos por real gasto |
| 2.5.3 | Frontend: extrato de pontos | Exibir na conta do cliente |
| 2.5.4 | Resgate | Trocar pontos por servicos ou descontos |

### 2.6 Avaliacao de Servico (pendente)

| # | Tarefa | Detalhes |
|---|--------|----------|
| 2.6.1 | Nova tabela `avaliacoes` | `id, agendamento_id, cliente_id, servico_id, funcionario_id, nota(1-5), comentario, data` |
| 2.6.2 | Trigger pos-atendimento | Link enviado por WhatsApp apos conclusao |
| 2.6.3 | Exibir notas na vitrine | Media de estrelas nos cards |

**Status:** CONCLUIDA

---

## FASE 3 — Experiencia do Administrador (Painel) — CONCLUIDA

### 3.1 Perfil Completo do Cliente

| # | Tarefa | Detalhes |
|---|--------|----------|
| 3.1.1 | Pagina de detalhe do cliente | `/painel/clientes/:id` com historico completo e anotacoes |
| 3.1.2 | Anotacoes internas | Campo `observacao_admin` na tabela `clientes` |
| 3.1.3 | Tags / Categorias | Ex: "Preferencial", "Vip", "Recorrente", "Inativo" |

### 3.2 Gestao de Horarios dos Funcionarios

| # | Tarefa | Detalhes |
|---|--------|----------|
| 3.2.1 | Nova tabela `expediente` | `id, funcionario_id, dia_semana(0-6), inicio, fim, pausa_inicio, pausa_fim` |
| 3.2.2 | Nova tabela `folgas` | `id, funcionario_id, data, motivo` |
| 3.2.3 | Validacao no backend | Ao criar/editar agendamento, verificar expediente |
| 3.2.4 | Frontend: grade de horarios | Tela no painel para configurar expediente |

### 3.3 Relatorios e Analytics

| # | Tarefa | Detalhes |
|---|--------|----------|
| 3.3.1 | Relatorio de faturamento | Filtros por periodo, funcionario, servico |
| 3.3.2 | Horarios de pico | Analise de horarios/dias mais movimentados |
| 3.3.3 | Taxa de no-show | % de cancelamentos vs confirmados |
| 3.3.4 | Clientes inativos | Query: clientes sem visita nos ultimos 30/60/90 dias |
| 3.3.5 | Exportar PDF | Relatorio com pdfkit ou jspdf |

### 3.4 Comissoes

| # | Tarefa | Detalhes |
|---|--------|----------|
| 3.4.1 | Colunas `comissao_tipo` e `comissao_valor` em `funcionarios` | Percentual ou valor fixo |
| 3.4.2 | Calculo automatico | Ao concluir agendamento, calcular e salvar |
| 3.4.3 | Relatorio de comissoes | Tabela por periodo com total por funcionario |

### 3.5 Disparo em Massa (Marketing)

| # | Tarefa | Detalhes |
|---|--------|----------|
| 3.5.1 | Selecionar clientes | Filtros por inatividade, tag, frequencia |
| 3.5.2 | Template de mensagem | Variaveis {{nome}}, {{data_ultima_visita}} |
| 3.5.3 | Disparo WhatsApp | Mesma integracao da 2.3 |

### 3.6 Agenda Drag-and-Drop

| # | Tarefa | Detalhes |
|---|--------|----------|
| 3.6.1 | Visualizacao semanal | Grade horizontal com dias vs horarios |
| 3.6.2 | Drag & drop | Usar @dnd-kit ou similar |
| 3.6.3 | Confirmacao | Modal "Reagendar?" com validacao |

**Status:** CONCLUIDA

---

## FASE 4 — Features de Infraestrutura

| # | Feature | Complexidade | Status |
|---|---------|-------------|--------|
| 4.1 | Pagamento online (Mercado Pago) | Alta — requer CNPJ | CANCELADO |
| 4.2 | PWA instavel | Media — manifest, service worker, icons | CONCLUIDA |
| 4.3 | Backup automatico do SQLite | Baixa — script copiando .db para backups/ | CONCLUIDA |
| 4.4 | Logs estruturados (pino) | Baixa — substituir console.log por pino | CONCLUIDA |

---

## FASE 5 — Melhorias Continuas

| # | Feature | Justificativa | Status |
|---|---------|---------------|--------|
| 5.1 | Modo escuro na vitrine | CSS variables + toggle. Baixo esforco, alto impacto | CONCLUIDA |
| 5.2 | Multi-branch | Adicionar `barbearia_id` em todas as tabelas | PENDENTE |
| 5.3 | Notificacoes push no painel | WebSocket ou SSE para novos agendamentos | PENDENTE |
| 5.4 | Gestao de estoque | Produtos + movimentacao ao concluir servico | PENDENTE |

---

## Ordem sugerida de implementacao

```
FASE 1 — semana 1   | CONCLUIDA
FASE 2 — semana 2   | CONCLUIDA
FASE 3 — semana 3-4 | CONCLUIDA
FASE 4 — semana 5   | CONCLUIDA
FASE 5 — semana 6+  | CONCLUIDA (parcial)
```
