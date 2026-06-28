-- SQLite schema for BarberManager

-- Clientes
CREATE TABLE IF NOT EXISTS clientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    telefone TEXT,
    email TEXT,
    senha_hash TEXT,
    observacao_admin TEXT
);

-- Funcionários
CREATE TABLE IF NOT EXISTS funcionarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    telefone TEXT,
    especialidade TEXT,
    status TEXT CHECK(status IN ('ativo','inativo')) NOT NULL DEFAULT 'ativo',
    email TEXT,
    senha_hash TEXT,
    imagem TEXT,
    comissao_tipo TEXT CHECK(comissao_tipo IN ('percentual','fixo')) DEFAULT 'percentual',
    comissao_valor NUMERIC DEFAULT 0
);

-- Serviços
CREATE TABLE IF NOT EXISTS servicos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    valor NUMERIC NOT NULL,
    duracao_min INTEGER NOT NULL,
    imagem TEXT
);

-- Agendamentos
CREATE TABLE IF NOT EXISTS agendamentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_id INTEGER NOT NULL,
    funcionario_id INTEGER NOT NULL,
    servico_id INTEGER NOT NULL,
    data TEXT NOT NULL,   -- YYYY-MM-DD
    hora TEXT NOT NULL,   -- HH:MM (24h)
    status TEXT CHECK(status IN ('confirmado','cancelado','concluido')) NOT NULL DEFAULT 'confirmado',
    observacao TEXT,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    FOREIGN KEY (funcionario_id) REFERENCES funcionarios(id),
    FOREIGN KEY (servico_id) REFERENCES servicos(id)
);

-- Histórico de atendimentos
CREATE TABLE IF NOT EXISTS historico (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_id INTEGER NOT NULL,
    funcionario_id INTEGER NOT NULL,
    servico_id INTEGER NOT NULL,
    data TEXT NOT NULL,
    valor NUMERIC NOT NULL,
    comissao NUMERIC,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    FOREIGN KEY (funcionario_id) REFERENCES funcionarios(id),
    FOREIGN KEY (servico_id) REFERENCES servicos(id)
);

-- Expediente (jornada de trabalho dos funcionários)
CREATE TABLE IF NOT EXISTS expediente (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    funcionario_id INTEGER NOT NULL,
    dia_semana INTEGER NOT NULL CHECK(dia_semana BETWEEN 0 AND 6),
    inicio TEXT NOT NULL,
    fim TEXT NOT NULL,
    pausa_inicio TEXT,
    pausa_fim TEXT,
    FOREIGN KEY (funcionario_id) REFERENCES funcionarios(id)
);

-- Folgas e dias bloqueados
CREATE TABLE IF NOT EXISTS folgas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    funcionario_id INTEGER NOT NULL,
    data TEXT NOT NULL,
    motivo TEXT,
    FOREIGN KEY (funcionario_id) REFERENCES funcionarios(id)
);
