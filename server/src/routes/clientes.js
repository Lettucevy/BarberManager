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
    console.error('GET /clientes error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/clientes/:id
router.get('/:id', param('id').isInt(), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const id = parseInt(req.params.id, 10);
  try {
    const row = await req.db.get('SELECT * FROM clientes WHERE id = ?', [id]);
    if (!row) return res.status(404).json({ message: 'Cliente não encontrado' });
    res.json(row);
  } catch (err) {
    console.error('GET /clientes/:id error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/clientes - create
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
      const result = await req.db.run('INSERT INTO clientes (nome, telefone, email) VALUES (?, ?, ?)', [nome, telefone || null, email || null]);
      const novo = await req.db.get('SELECT * FROM clientes WHERE id = ?', [result.id]);
      res.status(201).json(novo);
    } catch (err) {
      console.error('POST /clientes error:', err);
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
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const id = parseInt(req.params.id, 10);
    const { nome, telefone, email } = req.body;
    try {
      // Build dynamic SET clause
      const fields = [];
      const values = [];
      if (nome !== undefined) { fields.push('nome = ?'); values.push(nome); }
      if (telefone !== undefined) { fields.push('telefone = ?'); values.push(telefone); }
      if (email !== undefined) { fields.push('email = ?'); values.push(email); }
      if (fields.length === 0) return res.status(400).json({ message: 'Nenhum campo para atualizar' });
      values.push(id);
      const sql = `UPDATE clientes SET ${fields.join(', ')} WHERE id = ?`;
      await req.db.run(sql, values);
      const updated = await req.db.get('SELECT * FROM clientes WHERE id = ?', [id]);
      res.json(updated);
    } catch (err) {
      console.error('PUT /clientes/:id error:', err);
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
    console.error('DELETE /clientes/:id error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
