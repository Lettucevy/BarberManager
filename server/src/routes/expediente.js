const express = require('express');
const { body, param, validationResult } = require('express-validator');
const router = express.Router();

const DIAS = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];

router.get('/', async (req, res) => {
  const { funcionario_id } = req.query;
  let sql = 'SELECT * FROM expediente';
  const params = [];
  if (funcionario_id) { sql += ' WHERE funcionario_id = ?'; params.push(funcionario_id); }
  sql += ' ORDER BY dia_semana';
  try {
    const rows = await req.db.all(sql, params);
    res.json(rows);
  } catch (err) {
    req.log.error({ err }, 'GET /expediente error');
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', param('id').isInt(), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const row = await req.db.get('SELECT * FROM expediente WHERE id = ?', [req.params.id]);
    if (!row) return res.status(404).json({ message: 'Registro nao encontrado' });
    res.json(row);
  } catch (err) {
    req.log.error({ err }, 'GET /expediente/:id error');
    res.status(500).json({ message: 'Server error' });
  }
});

router.post(
  '/',
  [
    body('funcionario_id').isInt(),
    body('dia_semana').isInt({ min: 0, max: 6 }),
    body('inicio').matches(/^\d{2}:\d{2}$/),
    body('fim').matches(/^\d{2}:\d{2}$/),
    body('pausa_inicio').optional().matches(/^\d{2}:\d{2}$/),
    body('pausa_fim').optional().matches(/^\d{2}:\d{2}$/),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { funcionario_id, dia_semana, inicio, fim, pausa_inicio, pausa_fim } = req.body;
    try {
      const result = await req.db.run(
        'INSERT INTO expediente (funcionario_id, dia_semana, inicio, fim, pausa_inicio, pausa_fim) VALUES (?, ?, ?, ?, ?, ?)',
        [funcionario_id, dia_semana, inicio, fim, pausa_inicio || null, pausa_fim || null]
      );
      const novo = await req.db.get('SELECT * FROM expediente WHERE id = ?', [result.id]);
      res.status(201).json(novo);
    } catch (err) {
      req.log.error({ err }, 'POST /expediente error');
      res.status(500).json({ message: 'Server error' });
    }
  }
);

router.put(
  '/:id',
  [param('id').isInt(), body('inicio').optional().matches(/^\d{2}:\d{2}$/), body('fim').optional().matches(/^\d{2}:\d{2}$/)],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const id = parseInt(req.params.id, 10);
    const { inicio, fim, pausa_inicio, pausa_fim } = req.body;
    try {
      const fields = []; const values = [];
      if (inicio !== undefined) { fields.push('inicio = ?'); values.push(inicio); }
      if (fim !== undefined) { fields.push('fim = ?'); values.push(fim); }
      if (pausa_inicio !== undefined) { fields.push('pausa_inicio = ?'); values.push(pausa_inicio); }
      if (pausa_fim !== undefined) { fields.push('pausa_fim = ?'); values.push(pausa_fim); }
      if (fields.length === 0) return res.status(400).json({ message: 'Nenhum campo para atualizar' });
      values.push(id);
      await req.db.run('UPDATE expediente SET ' + fields.join(', ') + ' WHERE id = ?', values);
      const updated = await req.db.get('SELECT * FROM expediente WHERE id = ?', [id]);
      res.json(updated);
    } catch (err) {
      req.log.error({ err }, 'PUT /expediente/:id error');
      res.status(500).json({ message: 'Server error' });
    }
  }
);

router.delete('/:id', param('id').isInt(), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    await req.db.run('DELETE FROM expediente WHERE id = ?', [req.params.id]);
    res.json({ message: 'Registro removido' });
  } catch (err) {
    req.log.error({ err }, 'DELETE /expediente/:id error');
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
