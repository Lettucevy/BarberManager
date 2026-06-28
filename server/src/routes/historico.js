// src/routes/historico.js
const express = require('express');
const { query, validationResult } = require('express-validator');
const router = express.Router();

// GET list of historical attendances (optional filters + pagination)
router.get('/',
  [
    query('cliente_id').optional().isInt(),
    query('funcionario_id').optional().isInt(),
    query('servico_id').optional().isInt(),
    query('data').optional().matches(/^\d{4}-\d{2}-\d{2}$/),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { cliente_id, funcionario_id, servico_id, data } = req.query;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const offset = (page - 1) * limit;

    let where = 'WHERE 1=1';
    const params = [];
    if (cliente_id) { where += ' AND cliente_id = ?'; params.push(cliente_id); }
    if (funcionario_id) { where += ' AND funcionario_id = ?'; params.push(funcionario_id); }
    if (servico_id) { where += ' AND servico_id = ?'; params.push(servico_id); }
    if (data) { where += ' AND data = ?'; params.push(data); }

    try {
      const countRow = await req.db.get('SELECT COUNT(*) as total FROM historico ' + where, params);
      const total = countRow.total;
      const rows = await req.db.all(
        'SELECT * FROM historico ' + where + ' ORDER BY data DESC, id DESC LIMIT ? OFFSET ?',
        [...params, limit, offset]
      );
      res.json({ data: rows, total, page, limit, totalPages: Math.ceil(total / limit) });
    } catch (err) {
      req.log.error('GET /historico error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router;
