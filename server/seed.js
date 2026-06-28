const sqlite3 = require('sqlite3');
const path = require('path');
const pino = require('pino');

const logger = pino({
  level: 'info',
  transport: { target: 'pino/file', options: { destination: 1 } },
});

const dbPath = process.env.DB_PATH || path.resolve(__dirname, 'data/barbermanager.db');
const db = new sqlite3.Database(dbPath);

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ id: this.lastID, changes: this.changes });
    });
  });
}
function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}
function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

const SQL = {
  clientes: 'CREATE TABLE IF NOT EXISTS clientes (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL, telefone TEXT, email TEXT, senha_hash TEXT, observacao_admin TEXT);',
  funcionarios: 'CREATE TABLE IF NOT EXISTS funcionarios (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL, telefone TEXT, especialidade TEXT, status TEXT CHECK(status IN (\'ativo\',\'inativo\')) NOT NULL DEFAULT \'ativo\', email TEXT, senha_hash TEXT, imagem TEXT, comissao_tipo TEXT CHECK(comissao_tipo IN (\'percentual\',\'fixo\')) DEFAULT \'percentual\', comissao_valor NUMERIC DEFAULT 0);',
  servicos: 'CREATE TABLE IF NOT EXISTS servicos (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL, valor NUMERIC NOT NULL, duracao_min INTEGER NOT NULL, imagem TEXT);',
  agendamentos: 'CREATE TABLE IF NOT EXISTS agendamentos (id INTEGER PRIMARY KEY AUTOINCREMENT, cliente_id INTEGER NOT NULL, funcionario_id INTEGER NOT NULL, servico_id INTEGER NOT NULL, data TEXT NOT NULL, hora TEXT NOT NULL, status TEXT CHECK(status IN (\'confirmado\',\'cancelado\',\'concluido\')) NOT NULL DEFAULT \'confirmado\', observacao TEXT, FOREIGN KEY (cliente_id) REFERENCES clientes(id), FOREIGN KEY (funcionario_id) REFERENCES funcionarios(id), FOREIGN KEY (servico_id) REFERENCES servicos(id));',
  historico: 'CREATE TABLE IF NOT EXISTS historico (id INTEGER PRIMARY KEY AUTOINCREMENT, cliente_id INTEGER NOT NULL, funcionario_id INTEGER NOT NULL, servico_id INTEGER NOT NULL, data TEXT NOT NULL, valor NUMERIC NOT NULL, comissao NUMERIC, FOREIGN KEY (cliente_id) REFERENCES clientes(id), FOREIGN KEY (funcionario_id) REFERENCES funcionarios(id), FOREIGN KEY (servico_id) REFERENCES servicos(id));',
  expediente: 'CREATE TABLE IF NOT EXISTS expediente (id INTEGER PRIMARY KEY AUTOINCREMENT, funcionario_id INTEGER NOT NULL, dia_semana INTEGER NOT NULL CHECK(dia_semana BETWEEN 0 AND 6), inicio TEXT NOT NULL, fim TEXT NOT NULL, pausa_inicio TEXT, pausa_fim TEXT, FOREIGN KEY (funcionario_id) REFERENCES funcionarios(id));',
  folgas: 'CREATE TABLE IF NOT EXISTS folgas (id INTEGER PRIMARY KEY AUTOINCREMENT, funcionario_id INTEGER NOT NULL, data TEXT NOT NULL, motivo TEXT, FOREIGN KEY (funcionario_id) REFERENCES funcionarios(id));'
};

async function ensureColumns() {
  const cols = await all("PRAGMA table_info(funcionarios)");
  if (!cols.find((c) => c.name === 'imagem')) {
    await run('ALTER TABLE funcionarios ADD COLUMN imagem TEXT');
  }
  const colsS = await all("PRAGMA table_info(servicos)");
  if (!colsS.find((c) => c.name === 'imagem')) {
    await run('ALTER TABLE servicos ADD COLUMN imagem TEXT');
  }
  const colsA = await all("PRAGMA table_info(agendamentos)");
  if (!colsA.find((c) => c.name === 'observacao')) {
    await run('ALTER TABLE agendamentos ADD COLUMN observacao TEXT');
  }
  const colsC = await all("PRAGMA table_info(clientes)");
  if (!colsC.find((c) => c.name === 'senha_hash')) {
    await run('ALTER TABLE clientes ADD COLUMN senha_hash TEXT');
  }
  if (!colsC.find((c) => c.name === 'observacao_admin')) {
    await run('ALTER TABLE clientes ADD COLUMN observacao_admin TEXT');
  }
  const colsF = await all("PRAGMA table_info(funcionarios)");
  if (!colsF.find((c) => c.name === 'comissao_tipo')) {
    await run('ALTER TABLE funcionarios ADD COLUMN comissao_tipo TEXT DEFAULT "percentual"');
  }
  if (!colsF.find((c) => c.name === 'comissao_valor')) {
    await run('ALTER TABLE funcionarios ADD COLUMN comissao_valor NUMERIC DEFAULT 0');
  }
  const colsH = await all("PRAGMA table_info(historico)");
  if (!colsH.find((c) => c.name === 'comissao')) {
    await run('ALTER TABLE historico ADD COLUMN comissao NUMERIC');
  }
}

const FUNCIONARIOS_SEED = [
  { nome: 'Pedro Almeida', telefone: '11955554444', especialidade: 'Barba & Bigode', status: 'ativo', imagem: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop&crop=faces' },
  { nome: 'Lucas Ferreira', telefone: '11944443333', especialidade: 'Cortes Masculinos', status: 'ativo', imagem: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop&crop=faces' },
  { nome: 'Henrique Souza', telefone: '11933332222', especialidade: 'Corte & Barba', status: 'ativo', imagem: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=500&fit=crop&crop=faces' },
  { nome: 'Rafael Mendes', telefone: '11922221111', especialidade: 'Estilo & Coloracao', status: 'ativo', imagem: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&h=500&fit=crop&crop=faces' },
];

const SERVICOS_SEED = [
  { nome: 'Corte Classico', valor: 50, duracao_min: 30, imagem: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&h=600&fit=crop' },
  { nome: 'Corte Degrade', valor: 65, duracao_min: 45, imagem: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=600&h=600&fit=crop' },
  { nome: 'Barba Completa', valor: 45, duracao_min: 30, imagem: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&h=600&fit=crop' },
  { nome: 'Sobrancelha', valor: 25, duracao_min: 15, imagem: 'https://images.unsplash.com/photo-1585747860024-7f55d6e7c2e0?w=600&h=600&fit=crop' },
  { nome: 'Pigmentacao', valor: 120, duracao_min: 60, imagem: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=600&h=600&fit=crop' },
  { nome: 'Corte + Barba', valor: 90, duracao_min: 60, imagem: 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=600&h=600&fit=crop' },
];

(async () => {
  try {
    await run(SQL.clientes);
    await run(SQL.funcionarios);
    await run(SQL.servicos);
    await run(SQL.agendamentos);
    await run(SQL.historico);
    await run(SQL.expediente);
    await run(SQL.folgas);
    await ensureColumns();

    const clientesCount = (await get('SELECT COUNT(*) as c FROM clientes')).c;
    if (clientesCount < 4) {
      await run('INSERT INTO clientes (nome, telefone, email) VALUES (?, ?, ?)', ['Marcos Lima', '11988887777', 'marcos@example.com']);
      await run('INSERT INTO clientes (nome, telefone, email) VALUES (?, ?, ?)', ['Rafael Souza', '11977776666', 'rafa@example.com']);
      await run('INSERT INTO clientes (nome, telefone, email) VALUES (?, ?, ?)', ['Carlos Andrade', '11966665555', 'carlos@example.com']);
    }

    for (const f of FUNCIONARIOS_SEED) {
      const existente = await get('SELECT id FROM funcionarios WHERE nome = ?', [f.nome]);
      if (!existente) {
        await run('INSERT INTO funcionarios (nome, telefone, especialidade, status, imagem) VALUES (?, ?, ?, ?, ?)', [f.nome, f.telefone, f.especialidade, f.status, f.imagem]);
      } else {
        await run('UPDATE funcionarios SET telefone = ?, especialidade = ?, status = ?, imagem = ? WHERE id = ?', [f.telefone, f.especialidade, f.status, f.imagem, existente.id]);
      }
    }

    for (const s of SERVICOS_SEED) {
      const existente = await get('SELECT id FROM servicos WHERE nome = ?', [s.nome]);
      if (!existente) {
        await run('INSERT INTO servicos (nome, valor, duracao_min, imagem) VALUES (?, ?, ?, ?)', [s.nome, s.valor, s.duracao_min, s.imagem]);
      } else {
        await run('UPDATE servicos SET valor = ?, duracao_min = ?, imagem = ? WHERE id = ?', [s.valor, s.duracao_min, s.imagem, existente.id]);
      }
    }

    const agendamentos = await all('SELECT * FROM agendamentos');
    const hoje = new Date().toISOString().slice(0, 10);
    const jaTem = agendamentos.some((a) => a.data === hoje);
    if (!jaTem) {
      const funcionarios = await all('SELECT id FROM funcionarios');
      const servicos = await all('SELECT id FROM servicos');
      const clientes = await all('SELECT id FROM clientes');
      const horarios = ['09:00', '10:30', '13:00', '15:30'];
      for (let i = 0; i < horarios.length; i += 1) {
        const f = funcionarios[i % funcionarios.length];
        const s = servicos[i % servicos.length];
        const c = clientes[i % clientes.length];
        await run('INSERT INTO agendamentos (cliente_id, funcionario_id, servico_id, data, hora) VALUES (?, ?, ?, ?, ?)', [c.id, f.id, s.id, hoje, horarios[i]]);
      }
    }

    const historicoCount = (await get('SELECT COUNT(*) as c FROM historico')).c;
    if (historicoCount < 8) {
      const funcionarios = await all('SELECT id FROM funcionarios');
      const servicos = await all('SELECT id, valor FROM servicos');
      const clientes = await all('SELECT id FROM clientes');
      const datas = ['2026-06-10', '2026-06-11', '2026-06-12', '2026-06-13', '2026-06-14', '2026-06-15', '2026-06-16', '2026-06-17'];
      for (let i = 0; i < datas.length; i += 1) {
        const f = funcionarios[i % funcionarios.length];
        const s = servicos[i % servicos.length];
        const c = clientes[i % clientes.length];
        await run('INSERT INTO historico (cliente_id, funcionario_id, servico_id, data, valor) VALUES (?, ?, ?, ?, ?)', [c.id, f.id, s.id, datas[i], s.valor]);
      }
      await run('INSERT INTO historico (cliente_id, funcionario_id, servico_id, data, valor) VALUES (1, 1, 1, ?, 30)', ['2026-06-13']);
      await run('INSERT INTO historico (cliente_id, funcionario_id, servico_id, data, valor) VALUES (2, 2, 2, ?, 35)', ['2026-06-14']);
    }

    logger.info('Seed concluido.');
    process.exit(0);
  } catch (err) {
    console.error('Falha no seed:', err);
    process.exit(1);
  }
})();
