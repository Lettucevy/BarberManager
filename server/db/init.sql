-- SQLite schema for BarberManager

-- Clientes
CREATE TABLE IF NOT EXISTS clientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    telefone TEXT,
    email TEXT
);

-- Funcionários
CREATE TABLE IF NOT EXISTS funcionarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    telefone TEXT,
    especialidade TEXT,
    status TEXT CHECK(status IN ('ativo','inativo')) NOT NULL DEFAULT 'ativo',
    email TEXT,
    senha_hash TEXT
);

-- Serviços
CREATE TABLE IF NOT EXISTS servicos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    valor NUMERIC NOT NULL,
    duracao_min INTEGER NOT NULL
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
    FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    FOREIGN KEY (funcionario_id) REFERENCES funcionarios(id),
    FOREIGN KEY (servico_id) REFERENCES servicos(id)
);
