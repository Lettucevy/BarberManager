const express = require('express');
const { query, validationResult } = require('express-validator');
const router = express.Router();

router.get('/',
  [
    query('funcionario_id').optional().isInt(),
    query('data_inicio').optional().matches(/^\d{4}-\d{2}-\d{2}$/),
    query('data_fim').optional().matches(/^\d{4}-\d{2}-\d{2}$/),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { funcionario_id, data_inicio, data_fim } = req.query;
    let where = 'WHERE 1=1';
    const params = [];
    if (funcionario_id) { where += ' AND h.funcionario_id = ?'; params.push(funcionario_id); }
    if (data_inicio) { where += ' AND h.data >= ?'; params.push(data_inicio); }
    if (data_fim) { where += ' AND h.data <= ?'; params.push(data_fim); }

    try {
      const rows = await req.db.all(
        `SELECT h.funcionario_id, f.nome as funcionario_nome,
                COUNT(*) as atendimentos,
                COALESCE(SUM(h.valor), 0) as total_vendas,
                COALESCE(SUM(h.comissao), 0) as total_comissao
         FROM historico h
         JOIN funcionarios f ON h.funcionario_id = f.id
         ${where}
         GROUP BY h.funcionario_id
         ORDER BY total_comissao DESC`,
        params
      );
      res.json(rows);
    } catch (err) {
      req.log.error({ err }, 'GET /comissoes error');
      res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router;
