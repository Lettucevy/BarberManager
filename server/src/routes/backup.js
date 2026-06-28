const express = require('express');
const { backup, listBackups, cleanOld } = require('../../backup');
const router = express.Router();

router.post('/manual', async (req, res) => {
  try {
    const dest = backup();
    cleanOld();
    res.json({ message: 'Backup criado', arquivo: dest.split(/[\\/]/).pop() });
  } catch (err) {
    req.log.error('Backup error:', err);
    res.status(500).json({ message: 'Falha ao criar backup' });
  }
});

router.get('/list', async (req, res) => {
  try {
    const files = listBackups();
    res.json(files);
  } catch (err) {
    req.log.error('List backups error:', err);
    res.status(500).json({ message: 'Erro ao listar backups' });
  }
});

module.exports = router;
