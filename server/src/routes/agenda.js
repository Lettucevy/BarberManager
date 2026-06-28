// src/routes/agenda.js
const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const router = express.Router();

// Helper: check if a slot is available for a given employee
async function isSlotAvailable(db, funcionarioId, data, hora, excludeId = null) {
  const sql = `SELECT 1 FROM agendamentos WHERE funcionario_id = ? AND data = ? AND hora = ? AND status = 'confirmado'`
    + (excludeId ? ' AND id <> ?' : '');
  const params = excludeId ? [funcionarioId, data, hora, excludeId] : [funcionarioId, data, hora];
  const row = await db.get(sql, params);
  return !row; // true = free
}

// GET list (optionally filter by date, funcionario, cliente)
router.get('/', async (req, res) => {
  const { data, funcionario_id, cliente_id } = req.query;
  let sql = 'SELECT * FROM agendamentos WHERE 1=1';
  const params = [];
  if (data) { sql += ' AND data = ?'; params.push(data); }
  if (funcionario_id) { sql += ' AND funcionario_id = ?'; params.push(funcionario_id); }
  if (cliente_id) { sql += ' AND cliente_id = ?'; params.push(cliente_id); }
  try {
    const rows = await req.db.all(sql, params);
    res.json(rows);
  } catch (err) {
    req.log.error('GET /agendamentos error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST create appointment
router.post(
  '/',
  [
    body('cliente_id').isInt().withMessage('cliente_id required'),
    body('funcionario_id').isInt().withMessage('funcionario_id required'),
    body('servico_id').isInt().withMessage('servico_id required'),
    body('data').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('data no formato YYYY-MM-DD'),
    body('hora').matches(/^\d{2}:\d{2}$/).withMessage('hora no formato HH:MM'),
    body('observacao').optional().isString(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { cliente_id, funcionario_id, servico_id, data, hora, observacao } = req.body;
    try {
      const free = await isSlotAvailable(req.db, funcionario_id, data, hora);
      if (!free) return res.status(409).json({ message: 'Horário já ocupado para este funcionário' });
      const result = await req.db.run(
        'INSERT INTO agendamentos (cliente_id, funcionario_id, servico_id, data, hora, observacao) VALUES (?, ?, ?, ?, ?, ?)',
        [cliente_id, funcionario_id, servico_id, data, hora, observacao || null]
      );
      const novo = await req.db.get('SELECT * FROM agendamentos WHERE id = ?', [result.id]);
      res.status(201).json(novo);
    } catch (err) {
      req.log.error('POST /agendamentos error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// PUT update appointment (e.g., change date/hora)
router.put(
  '/:id',
  [
    param('id').isInt(),
    body('cliente_id').optional().isInt(),
    body('funcionario_id').optional().isInt(),
    body('servico_id').optional().isInt(),
    body('data').optional().matches(/^\d{4}-\d{2}-\d{2}$/),
    body('hora').optional().matches(/^\d{2}:\d{2}$/),
    body('status').optional().isIn(['confirmado', 'cancelado', 'concluido']),
    body('observacao').optional().isString(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const id = parseInt(req.params.id, 10);
    const { cliente_id, funcionario_id, servico_id, data, hora, status, observacao } = req.body;
    try {
      // Load current record to check constraints if needed
      const current = await req.db.get('SELECT * FROM agendamentos WHERE id = ?', [id]);
      if (!current) return res.status(404).json({ message: 'Agendamento não encontrado' });

      // If changing date/hora/funcionario, verify availability
      const newFuncionario = funcionario_id !== undefined ? funcionario_id : current.funcionario_id;
      const newData = data !== undefined ? data : current.data;
      const newHora = hora !== undefined ? hora : current.hora;
      if (newFuncionario && newData && newHora) {
        const free = await isSlotAvailable(req.db, newFuncionario, newData, newHora, id);
        if (!free) return res.status(409).json({ message: 'Horário já ocupado para este funcionário' });
      }

      const fields = [];
      const values = [];
      if (cliente_id !== undefined) { fields.push('cliente_id = ?'); values.push(cliente_id); }
      if (funcionario_id !== undefined) { fields.push('funcionario_id = ?'); values.push(funcionario_id); }
      if (servico_id !== undefined) { fields.push('servico_id = ?'); values.push(servico_id); }
      if (data !== undefined) { fields.push('data = ?'); values.push(data); }
      if (hora !== undefined) { fields.push('hora = ?'); values.push(hora); }
      if (status !== undefined) { fields.push('status = ?'); values.push(status); }
      if (observacao !== undefined) { fields.push('observacao = ?'); values.push(observacao); }
      if (fields.length === 0) return res.status(400).json({ message: 'Nenhum campo para atualizar' });
      values.push(id);
      const sql = `UPDATE agendamentos SET ${fields.join(', ')} WHERE id = ?`;
      await req.db.run(sql, values);
      const updated = await req.db.get('SELECT * FROM agendamentos WHERE id = ?', [id]);
      res.json(updated);
    } catch (err) {
      req.log.error('PUT /agendamentos/:id error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// DELETE (cancel) appointment – set status to 'cancelado'
router.delete('/:id', param('id').isInt(), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const id = parseInt(req.params.id, 10);
  try {
    await req.db.run('UPDATE agendamentos SET status = "cancelado" WHERE id = ?', [id]);
    res.json({ message: 'Agendamento cancelado' });
  } catch (err) {
    req.log.error('DELETE /agendamentos/:id error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
