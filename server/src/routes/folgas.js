const express = require('express');
const { body, param, validationResult } = require('express-validator');
const router = express.Router();

router.get('/', async (req, res) => {
  const { funcionario_id, data } = req.query;
  let sql = 'SELECT * FROM folgas WHERE 1=1';
  const params = [];
  if (funcionario_id) { sql += ' AND funcionario_id = ?'; params.push(funcionario_id); }
  if (data) { sql += ' AND data = ?'; params.push(data); }
  sql += ' ORDER BY data DESC';
  try {
    const rows = await req.db.all(sql, params);
    res.json(rows);
  } catch (err) {
    req.log.error({ err }, 'GET /folgas error');
    res.status(500).json({ message: 'Server error' });
  }
});

router.post(
  '/',
  [
    body('funcionario_id').isInt(),
    body('data').matches(/^\d{4}-\d{2}-\d{2}$/),
    body('motivo').optional().isString(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { funcionario_id, data, motivo } = req.body;
    try {
      const result = await req.db.run(
        'INSERT INTO folgas (funcionario_id, data, motivo) VALUES (?, ?, ?)',
        [funcionario_id, data, motivo || null]
      );
      const novo = await req.db.get('SELECT * FROM folgas WHERE id = ?', [result.id]);
      res.status(201).json(novo);
    } catch (err) {
      req.log.error({ err }, 'POST /folgas error');
      res.status(500).json({ message: 'Server error' });
    }
  }
);

router.delete('/:id', param('id').isInt(), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    await req.db.run('DELETE FROM folgas WHERE id = ?', [req.params.id]);
    res.json({ message: 'Folga removida' });
  } catch (err) {
    req.log.error({ err }, 'DELETE /folgas/:id error');
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
