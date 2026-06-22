// src/routes/dashboard.js
const express = require('express');
const router = express.Router();

// GET summary numbers (total clients, total staff, today's appointments, next appointment)
router.get('/summary', async (req, res) => {
  try {
    const totalClientes = await req.db.get('SELECT COUNT(*) as total FROM clientes');
    const totalFuncionarios = await req.db.get('SELECT COUNT(*) as total FROM funcionarios');
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const agendamentosHoje = await req.db.get('SELECT COUNT(*) as total FROM agendamentos WHERE data = ? AND status = "confirmado"', [today]);
    const proximo = await req.db.get(
      `SELECT * FROM agendamentos WHERE data >= ? AND status = "confirmado" ORDER BY data ASC, hora ASC LIMIT 1`,
      [today]
    );
    res.json({
      totalClientes: totalClientes.total,
      totalFuncionarios: totalFuncionarios.total,
      agendamentosHoje: agendamentosHoje.total,
      proximoAgendamento: proximo || null,
    });
  } catch (err) {
    console.error('GET /dashboard/summary error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET top services (by count in historico)
router.get('/top-services', async (req, res) => {
  try {
    const rows = await req.db.all(
      `SELECT s.id, s.nome, COUNT(h.id) as vezes
       FROM historico h
       JOIN servicos s ON h.servico_id = s.id
       GROUP BY s.id, s.nome
       ORDER BY vezes DESC
       LIMIT 5`
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /dashboard/top-services error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET atendimentos por funcionário (histórico)
router.get('/attendance-by-employee', async (req, res) => {
  try {
    const rows = await req.db.all(
      `SELECT f.id, f.nome, COUNT(h.id) as atendimentos
       FROM historico h
       JOIN funcionarios f ON h.funcionario_id = f.id
       GROUP BY f.id, f.nome
       ORDER BY atendimentos DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /dashboard/attendance-by-employee error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
