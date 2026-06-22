const express = require('express');
const { body, param, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const router = express.Router();

const SELECT_FIELDS = 'id, nome, telefone, especialidade, status, imagem';

router.get('/', async (req, res) => {
  const q = req.query.q ? '%' + req.query.q + '%' : null;
  try {
    if (q) {
      const rows = await req.db.all(
        'SELECT ' + SELECT_FIELDS + ' FROM funcionarios WHERE nome LIKE ? OR especialidade LIKE ?',
        [q, q]
      );
      return res.json(rows);
    }
    const rows = await req.db.all('SELECT ' + SELECT_FIELDS + ' FROM funcionarios');
    res.json(rows);
  } catch (err) {
    console.error('GET /funcionarios error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', param('id').isInt(), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const id = parseInt(req.params.id, 10);
  try {
    const row = await req.db.get('SELECT ' + SELECT_FIELDS + ' FROM funcionarios WHERE id = ?', [id]);
    if (!row) return res.status(404).json({ message: 'Funcionario nao encontrado' });
    res.json(row);
  } catch (err) {
    console.error('GET /funcionarios/:id error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post(
  '/',
  [
    body('nome').notEmpty().withMessage('Nome obrigatorio'),
    body('telefone').optional().isString(),
    body('especialidade').optional().isString(),
    body('status').optional().isIn(['ativo', 'inativo']).withMessage('Status deve ser ativo/inativo'),
    body('email').optional().isEmail(),
    body('senha').optional().isLength({ min: 4 }).withMessage('Senha muito curta'),
    body('imagem').optional().isURL().withMessage('imagem deve ser uma URL valida'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { nome, telefone, especialidade, status = 'ativo', email, senha, imagem } = req.body;
    try {
      const hash = senha ? await bcrypt.hash(senha, 10) : null;
      const result = await req.db.run(
        'INSERT INTO funcionarios (nome, telefone, especialidade, status, email, senha_hash, imagem) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [nome, telefone || null, especialidade || null, status, email || null, hash, imagem || null]
      );
      const novo = await req.db.get('SELECT ' + SELECT_FIELDS + ' FROM funcionarios WHERE id = ?', [result.id]);
      res.status(201).json(novo);
    } catch (err) {
      console.error('POST /funcionarios error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

router.put(
  '/:id',
  [
    param('id').isInt(),
    body('nome').optional().notEmpty(),
    body('telefone').optional().isString(),
    body('especialidade').optional().isString(),
    body('status').optional().isIn(['ativo', 'inativo']),
    body('email').optional().isEmail(),
    body('senha').optional().isLength({ min: 4 }),
    body('imagem').optional().isURL(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const id = parseInt(req.params.id, 10);
    const { nome, telefone, especialidade, status, email, senha, imagem } = req.body;
    try {
      const fields = [];
      const values = [];
      if (nome !== undefined) { fields.push('nome = ?'); values.push(nome); }
      if (telefone !== undefined) { fields.push('telefone = ?'); values.push(telefone); }
      if (especialidade !== undefined) { fields.push('especialidade = ?'); values.push(especialidade); }
      if (status !== undefined) { fields.push('status = ?'); values.push(status); }
      if (email !== undefined) { fields.push('email = ?'); values.push(email); }
      if (imagem !== undefined) { fields.push('imagem = ?'); values.push(imagem); }
      if (senha !== undefined) {
        const hash = await bcrypt.hash(senha, 10);
        fields.push('senha_hash = ?');
        values.push(hash);
      }
      if (fields.length === 0) return res.status(400).json({ message: 'Nenhum campo para atualizar' });
      values.push(id);
      const sql = 'UPDATE funcionarios SET ' + fields.join(', ') + ' WHERE id = ?';
      await req.db.run(sql, values);
      const updated = await req.db.get('SELECT ' + SELECT_FIELDS + ' FROM funcionarios WHERE id = ?', [id]);
      res.json(updated);
    } catch (err) {
      console.error('PUT /funcionarios/:id error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

router.delete('/:id', param('id').isInt(), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const id = parseInt(req.params.id, 10);
  try {
    await req.db.run('DELETE FROM funcionarios WHERE id = ?', [id]);
    res.json({ message: 'Funcionario removido' });
  } catch (err) {
    console.error('DELETE /funcionarios/:id error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
