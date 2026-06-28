const express = require('express');
const { query, validationResult } = require('express-validator');
const router = express.Router();

router.get('/summary', async (req, res) => {
  try {
    const totalClientes = await req.db.get('SELECT COUNT(*) as total FROM clientes');
    const totalFuncionarios = await req.db.get('SELECT COUNT(*) as total FROM funcionarios');
    const today = new Date().toISOString().slice(0, 10);
    const agendamentosHoje = await req.db.get('SELECT COUNT(*) as total FROM agendamentos WHERE data = ? AND status = "confirmado"', [today]);
    const proximo = await req.db.get(
      'SELECT * FROM agendamentos WHERE data >= ? AND status = "confirmado" ORDER BY data ASC, hora ASC LIMIT 1',
      [today]
    );
    res.json({
      totalClientes: totalClientes.total,
      totalFuncionarios: totalFuncionarios.total,
      agendamentosHoje: agendamentosHoje.total,
      proximoAgendamento: proximo || null,
    });
  } catch (err) {
    req.log.error({ err }, 'GET /dashboard/summary error');
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/top-services', async (req, res) => {
  try {
    const rows = await req.db.all(
      `SELECT s.id, s.nome, COUNT(h.id) as vezes
       FROM historico h JOIN servicos s ON h.servico_id = s.id
       GROUP BY s.id, s.nome ORDER BY vezes DESC LIMIT 5`
    );
    res.json(rows);
  } catch (err) {
    req.log.error({ err }, 'GET /dashboard/top-services error');
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/attendance-by-employee', async (req, res) => {
  try {
    const rows = await req.db.all(
      `SELECT f.id, f.nome, COUNT(h.id) as atendimentos
       FROM historico h JOIN funcionarios f ON h.funcionario_id = f.id
       GROUP BY f.id, f.nome ORDER BY atendimentos DESC`
    );
    res.json(rows);
  } catch (err) {
    req.log.error({ err }, 'GET /dashboard/attendance-by-employee error');
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/revenue',
  [
    query('data_inicio').optional().matches(/^\d{4}-\d{2}-\d{2}$/),
    query('data_fim').optional().matches(/^\d{4}-\d{2}-\d{2}$/),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { data_inicio, data_fim } = req.query;
    let where = 'WHERE 1=1'; const params = [];
    if (data_inicio) { where += ' AND data >= ?'; params.push(data_inicio); }
    if (data_fim) { where += ' AND data <= ?'; params.push(data_fim); }
    try {
      const rows = await req.db.all(
        `SELECT data, COUNT(*) as atendimentos, COALESCE(SUM(valor), 0) as faturamento
         FROM historico ${where} GROUP BY data ORDER BY data`, params
      );
      const totals = await req.db.get(
        `SELECT COUNT(*) as total_atendimentos, COALESCE(SUM(valor), 0) as total_faturamento
         FROM historico ${where}`, params
      );
      res.json({ diario: rows, ...totals });
    } catch (err) {
      req.log.error({ err }, 'GET /dashboard/revenue error');
      res.status(500).json({ message: 'Server error' });
    }
  }
);

router.get('/peak-hours', async (req, res) => {
  try {
    const rows = await req.db.all(
      `SELECT SUBSTR(hora, 1, 2) as hora, COUNT(*) as total
       FROM agendamentos WHERE status = 'concluido'
       GROUP BY SUBSTR(hora, 1, 2) ORDER BY total DESC`
    );
    res.json(rows);
  } catch (err) {
    req.log.error({ err }, 'GET /dashboard/peak-hours error');
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/no-show-rate', async (req, res) => {
  try {
    const row = await req.db.get(
      `SELECT COUNT(*) as total, SUM(CASE WHEN status = 'cancelado' THEN 1 ELSE 0 END) as cancelados
       FROM agendamentos`
    );
    res.json({
      total: row.total,
      cancelados: row.cancelados,
      taxa: row.total > 0 ? ((row.cancelados / row.total) * 100).toFixed(1) : '0.0',
    });
  } catch (err) {
    req.log.error({ err }, 'GET /dashboard/no-show-rate error');
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/inactive-clients', async (req, res) => {
  try {
    const rows = await req.db.all(
      `SELECT c.id, c.nome, c.telefone, MAX(h.data) as ultima_visita
       FROM clientes c LEFT JOIN historico h ON c.id = h.cliente_id
       GROUP BY c.id
       HAVING ultima_visita IS NULL OR ultima_visita < DATE('now', '-30 days')
       ORDER BY ultima_visita ASC`
    );
    res.json(rows);
  } catch (err) {
    req.log.error({ err }, 'GET /dashboard/inactive-clients error');
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
