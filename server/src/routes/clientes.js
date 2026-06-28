// src/routes/clientes.js
const express = require('express');
const { body, param, validationResult } = require('express-validator');
const router = express.Router();

// GET /api/clientes - list all (optional query ?q=search)
router.get('/', async (req, res) => {
  const q = req.query.q ? `%${req.query.q}%` : null;
  try {
    if (q) {
      const rows = await req.db.all('SELECT * FROM clientes WHERE nome LIKE ? OR telefone LIKE ? OR email LIKE ?', [q, q, q]);
      return res.json(rows);
    }
    const rows = await req.db.all('SELECT * FROM clientes');
    res.json(rows);
  } catch (err) {
    req.log.error('GET /clientes error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/clientes/:id - full profile with history and stats
router.get('/:id', param('id').isInt(), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const id = parseInt(req.params.id, 10);
  try {
    const row = await req.db.get('SELECT * FROM clientes WHERE id = ?', [id]);
    if (!row) return res.status(404).json({ message: 'Cliente nao encontrado' });
    const historico = await req.db.all(
      `SELECT h.*, s.nome as servico_nome, f.nome as funcionario_nome
       FROM historico h
       LEFT JOIN servicos s ON h.servico_id = s.id
       LEFT JOIN funcionarios f ON h.funcionario_id = f.id
       WHERE h.cliente_id = ?
       ORDER BY h.data DESC, h.id DESC`,
      [id]
    );
    const agendamentos = await req.db.all(
      `SELECT a.*, s.nome as servico_nome, f.nome as funcionario_nome
       FROM agendamentos a
       LEFT JOIN servicos s ON a.servico_id = s.id
       LEFT JOIN funcionarios f ON a.funcionario_id = f.id
       WHERE a.cliente_id = ?
       ORDER BY a.data DESC, a.hora DESC`,
      [id]
    );
    const stats = await req.db.get(
      `SELECT COUNT(*) as total_visitas, COALESCE(SUM(valor), 0) as total_gasto,
              MAX(data) as ultima_visita
       FROM historico WHERE cliente_id = ?`,
      [id]
    );
    res.json({ ...row, historico, agendamentos, stats });
  } catch (err) {
    req.log.error({ err }, 'GET /clientes/:id error');
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/clientes - create (or return existing by phone)
router.post(
  '/',
  [
    body('nome').notEmpty().withMessage('Nome é obrigatório'),
    body('telefone').optional().isString(),
    body('email').optional().isEmail().withMessage('Email inválido'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { nome, telefone, email } = req.body;
    try {
      // If telefone provided, check for existing client
      if (telefone) {
        const existente = await req.db.get('SELECT * FROM clientes WHERE telefone = ?', [telefone]);
        if (existente) {
          // Optionally update name/email if they changed
          if (nome !== existente.nome || (email && email !== existente.email)) {
            await req.db.run(
              'UPDATE clientes SET nome = ?, email = COALESCE(?, email) WHERE id = ?',
              [nome, email || null, existente.id]
            );
            const updated = await req.db.get('SELECT * FROM clientes WHERE id = ?', [existente.id]);
            return res.json(updated);
          }
          return res.json(existente);
        }
      }
      const result = await req.db.run('INSERT INTO clientes (nome, telefone, email) VALUES (?, ?, ?)', [nome, telefone || null, email || null]);
      const novo = await req.db.get('SELECT * FROM clientes WHERE id = ?', [result.id]);
      res.status(201).json(novo);
    } catch (err) {
      req.log.error('POST /clientes error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// PUT /api/clientes/:id - update
router.put(
  '/:id',
  [
    param('id').isInt(),
    body('nome').optional().notEmpty(),
    body('telefone').optional().isString(),
    body('email').optional().isEmail(),
    body('observacao_admin').optional().isString(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const id = parseInt(req.params.id, 10);
    const { nome, telefone, email, observacao_admin } = req.body;
    try {
      // Build dynamic SET clause
      const fields = [];
      const values = [];
      if (nome !== undefined) { fields.push('nome = ?'); values.push(nome); }
      if (telefone !== undefined) { fields.push('telefone = ?'); values.push(telefone); }
      if (email !== undefined) { fields.push('email = ?'); values.push(email); }
      if (observacao_admin !== undefined) { fields.push('observacao_admin = ?'); values.push(observacao_admin); }
      if (fields.length === 0) return res.status(400).json({ message: 'Nenhum campo para atualizar' });
      values.push(id);
      const sql = `UPDATE clientes SET ${fields.join(', ')} WHERE id = ?`;
      await req.db.run(sql, values);
      const updated = await req.db.get('SELECT * FROM clientes WHERE id = ?', [id]);
      res.json(updated);
    } catch (err) {
      req.log.error('PUT /clientes/:id error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// DELETE /api/clientes/:id
router.delete('/:id', param('id').isInt(), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const id = parseInt(req.params.id, 10);
  try {
    await req.db.run('DELETE FROM clientes WHERE id = ?', [id]);
    res.json({ message: 'Cliente removido' });
  } catch (err) {
    req.log.error('DELETE /clientes/:id error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
