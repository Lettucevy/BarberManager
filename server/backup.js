const fs = require('fs');
const path = require('path');
const pino = require('pino');
require('dotenv').config();

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: { target: 'pino/file', options: { destination: 1 } },
});

const DB_PATH = process.env.DB_PATH || path.resolve(__dirname, '../data/barbermanager.db');
const BACKUP_DIR = process.env.BACKUP_DIR || path.resolve(__dirname, '../backups');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function timestamp() {
  const now = new Date();
  return now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
}

function backup() {
  ensureDir(BACKUP_DIR);
  const filename = `barbermanager-${timestamp()}.db`;
  const dest = path.join(BACKUP_DIR, filename);
  fs.copyFileSync(DB_PATH, dest);
  logger.info('Backup created:', dest);
  return dest;
}

function listBackups() {
  ensureDir(BACKUP_DIR);
  return fs.readdirSync(BACKUP_DIR)
    .filter(f => f.startsWith('barbermanager-') && f.endsWith('.db'))
    .sort()
    .reverse();
}

function cleanOld(keep = 30) {
  const files = listBackups();
  if (files.length <= keep) return;
  const toRemove = files.slice(keep);
  for (const f of toRemove) {
    fs.unlinkSync(path.join(BACKUP_DIR, f));
  }
  logger.info(`Cleaned ${toRemove.length} old backups, keeping ${keep}`);
}

module.exports = { backup, listBackups, cleanOld };

if (require.main === module) {
  backup();
  cleanOld();
}
