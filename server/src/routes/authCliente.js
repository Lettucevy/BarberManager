const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');

const router = express.Router();

router.post(
  '/register',
  [
    body('nome').notEmpty().withMessage('Nome obrigatorio'),
    body('telefone').notEmpty().withMessage('Telefone obrigatorio'),
    body('senha').isLength({ min: 4 }).withMessage('Senha deve ter no minimo 4 caracteres'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { nome, telefone, email, senha } = req.body;
    try {
      const existente = await req.db.get('SELECT id FROM clientes WHERE telefone = ?', [telefone]);
      if (existente) return res.status(409).json({ message: 'Telefone ja cadastrado' });
      const hash = await bcrypt.hash(senha, 10);
      const result = await req.db.run(
        'INSERT INTO clientes (nome, telefone, email, senha_hash) VALUES (?, ?, ?, ?)',
        [nome, telefone, email || null, hash]
      );
      req.session.clienteId = result.id;
      req.session.role = 'cliente';
      const novo = await req.db.get('SELECT id, nome, telefone, email FROM clientes WHERE id = ?', [result.id]);
      res.status(201).json(novo);
    } catch (err) {
      req.log.error('POST /auth/cliente/register error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

router.post(
  '/login',
  [
    body('telefone').notEmpty().withMessage('Telefone obrigatorio'),
    body('senha').notEmpty().withMessage('Senha obrigatoria'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { telefone, senha } = req.body;
    try {
      const row = await req.db.get('SELECT id, nome, telefone, email, senha_hash FROM clientes WHERE telefone = ?', [telefone]);
      if (!row) return res.status(401).json({ message: 'Telefone ou senha invalidos' });
      if (!row.senha_hash) return res.status(401).json({ message: 'Cliente sem senha cadastrada. Faca o registro primeiro.' });
      const match = await bcrypt.compare(senha, row.senha_hash);
      if (!match) return res.status(401).json({ message: 'Telefone ou senha invalidos' });
      req.session.clienteId = row.id;
      req.session.role = 'cliente';
      res.json({ id: row.id, nome: row.nome, telefone: row.telefone, email: row.email });
    } catch (err) {
      req.log.error('POST /auth/cliente/login error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      req.log.error('Logout cliente error:', err);
      return res.status(500).json({ message: 'Logout failed' });
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out' });
  });
});

router.get('/me', async (req, res) => {
  if (!req.session.clienteId) return res.json({ authenticated: false });
  try {
    const row = await req.db.get('SELECT id, nome, telefone, email FROM clientes WHERE id = ?', [req.session.clienteId]);
    if (!row) return res.json({ authenticated: false });
    res.json({ authenticated: true, ...row });
  } catch (err) {
    req.log.error('GET /auth/cliente/me error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
