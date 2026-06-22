// src/index.js

require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
// const mssql = require('mssql'); // Removed: using SQLite instead

const app = express();
const PORT = process.env.PORT || 5000;

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

// Simple health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// SQLite DB initialization
const db = require('./utils/db'); // Provides run/get/all helpers

// Attach db helpers to each request
app.use((req, res, next) => {
  req.db = db;
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

// Mount API routes
authRouter && app.use('/api/auth', authRouter);
app.use('/api/clientes', clientesRouter);
app.use('/api/funcionarios', funcionariosRouter);
app.use('/api/servicos', servicosRouter);
app.use('/api/agendamentos', agendaRouter);
app.use('/api/historico', historicoRouter);
app.use('/api/dashboard', dashboardRouter);

// Serve static front‑end files (built with Vite) in production
if (process.env.NODE_ENV === 'production') {
  console.log('Static folder:', path.join(__dirname, '../../client/dist'));
  app.use(express.static(path.join(__dirname, '../../client/dist')));
  // SPA fallback – serve index.html for any unknown route
  app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
