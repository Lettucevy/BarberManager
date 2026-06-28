// src/index.js

require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const pino = require('pino');

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: { target: 'pino/file', options: { destination: 1 } },
});

const backup = require('../backup');

const app = express();
const PORT = process.env.PORT || 5000;

// Scheduled backup every 24h
const BACKUP_INTERVAL_MS = 24 * 60 * 60 * 1000;
setInterval(() => {
  try {
    backup.backup();
    backup.cleanOld();
  } catch (err) {
    logger.error({ err }, 'Scheduled backup failed');
  }
}, BACKUP_INTERVAL_MS);

// Middleware
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'change_this_secret',
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, secure: false, sameSite: 'lax' },
  })
);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// SQLite DB initialization
const db = require('./utils/db');

app.use((req, res, next) => {
  req.db = db;
  req.log = logger;
  next();
});

// Route imports
const clientesRouter = require('./routes/clientes');
const funcionariosRouter = require('./routes/funcionarios');
const servicosRouter = require('./routes/servicos');
const agendaRouter = require('./routes/agenda');
const historicoRouter = require('./routes/historico');
const dashboardRouter = require('./routes/dashboard');
const authRouter = require('./routes/auth');
const authClienteRouter = require('./routes/authCliente');
const backupRouter = require('./routes/backup');
const expedienteRouter = require('./routes/expediente');
const folgasRouter = require('./routes/folgas');
const comissoesRouter = require('./routes/comissoes');

// Mount API routes
authRouter && app.use('/api/auth', authRouter);
app.use('/api/auth/cliente', authClienteRouter);
app.use('/api/clientes', clientesRouter);
app.use('/api/funcionarios', funcionariosRouter);
app.use('/api/servicos', servicosRouter);
app.use('/api/agendamentos', agendaRouter);
app.use('/api/historico', historicoRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/backup', backupRouter);
app.use('/api/expediente', expedienteRouter);
app.use('/api/folgas', folgasRouter);
app.use('/api/comissoes', comissoesRouter);

// Run initial backup on startup
backup.backup();
backup.cleanOld();

// Serve static front‑end files in production
if (process.env.NODE_ENV === 'production') {
  logger.info('Static folder: %s', path.join(__dirname, '../../client/dist'));
  app.use(express.static(path.join(__dirname, '../../client/dist')));
  app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
  });
}

app.listen(PORT, () => {
  logger.info('Server listening on http://localhost:%d', PORT);
});
