// src/routes/historico.js
const express = require('express');
const { query, validationResult } = require('express-validator');
const router = express.Router();

// GET list of historical attendances (optional filters)
router.get('/',
  [
    query('cliente_id').optional().isInt(),
    query('funcionario_id').optional().isInt(),
    query('servico_id').optional().isInt(),
    query('data').optional().matches(/^\d{4}-\d{2}-\d{2}$/),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { cliente_id, funcionario_id, servico_id, data } = req.query;
    let sql = 'SELECT * FROM historico WHERE 1=1';
    const params = [];
    if (cliente_id) { sql += ' AND cliente_id = ?'; params.push(cliente_id); }
    if (funcionario_id) { sql += ' AND funcionario_id = ?'; params.push(funcionario_id); }
    if (servico_id) { sql += ' AND servico_id = ?'; params.push(servico_id); }
    if (data) { sql += ' AND data = ?'; params.push(data); }
    try {
      const rows = await req.db.all(sql, params);
      res.json(rows);
    } catch (err) {
      console.error('GET /historico error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router;
