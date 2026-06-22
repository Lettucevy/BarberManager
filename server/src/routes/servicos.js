const express = require('express');
const { body, param, validationResult } = require('express-validator');
const router = express.Router();

const SELECT_FIELDS = 'id, nome, valor, duracao_min, imagem';

router.get('/', async (req, res) => {
  const q = req.query.q ? '%' + req.query.q + '%' : null;
  try {
    if (q) {
      const rows = await req.db.all('SELECT ' + SELECT_FIELDS + ' FROM servicos WHERE nome LIKE ?', [q]);
      return res.json(rows);
    }
    const rows = await req.db.all('SELECT ' + SELECT_FIELDS + ' FROM servicos');
    res.json(rows);
  } catch (err) {
    console.error('GET /servicos error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', param('id').isInt(), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const id = parseInt(req.params.id, 10);
  try {
    const row = await req.db.get('SELECT ' + SELECT_FIELDS + ' FROM servicos WHERE id = ?', [id]);
    if (!row) return res.status(404).json({ message: 'Servico nao encontrado' });
    res.json(row);
  } catch (err) {
    console.error('GET /servicos/:id error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post(
  '/',
  [
    body('nome').notEmpty().withMessage('Nome obrigatorio'),
    body('valor').isFloat({ gt: 0 }).withMessage('Valor deve ser positivo'),
    body('duracao_min').isInt({ gt: 0 }).withMessage('Duracao em minutos deve ser positiva'),
    body('imagem').optional().isURL().withMessage('imagem deve ser uma URL valida'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { nome, valor, duracao_min, imagem } = req.body;
    try {
      const result = await req.db.run(
        'INSERT INTO servicos (nome, valor, duracao_min, imagem) VALUES (?, ?, ?, ?)',
        [nome, valor, duracao_min, imagem || null]
      );
      const novo = await req.db.get('SELECT ' + SELECT_FIELDS + ' FROM servicos WHERE id = ?', [result.id]);
      res.status(201).json(novo);
    } catch (err) {
      console.error('POST /servicos error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

router.put(
  '/:id',
  [
    param('id').isInt(),
    body('nome').optional().notEmpty(),
    body('valor').optional().isFloat({ gt: 0 }),
    body('duracao_min').optional().isInt({ gt: 0 }),
    body('imagem').optional().isURL(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const id = parseInt(req.params.id, 10);
    const { nome, valor, duracao_min, imagem } = req.body;
    try {
      const fields = [];
      const values = [];
      if (nome !== undefined) { fields.push('nome = ?'); values.push(nome); }
      if (valor !== undefined) { fields.push('valor = ?'); values.push(valor); }
      if (duracao_min !== undefined) { fields.push('duracao_min = ?'); values.push(duracao_min); }
      if (imagem !== undefined) { fields.push('imagem = ?'); values.push(imagem); }
      if (fields.length === 0) return res.status(400).json({ message: 'Nenhum campo para atualizar' });
      values.push(id);
      const sql = 'UPDATE servicos SET ' + fields.join(', ') + ' WHERE id = ?';
      await req.db.run(sql, values);
      const updated = await req.db.get('SELECT ' + SELECT_FIELDS + ' FROM servicos WHERE id = ?', [id]);
      res.json(updated);
    } catch (err) {
      console.error('PUT /servicos/:id error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

router.delete('/:id', param('id').isInt(), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const id = parseInt(req.params.id, 10);
  try {
    await req.db.run('DELETE FROM servicos WHERE id = ?', [id]);
    res.json({ message: 'Servico removido' });
  } catch (err) {
    console.error('DELETE /servicos/:id error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
