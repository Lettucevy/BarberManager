// src/utils/db.js
const sqlite3 = require('sqlite3');
const path = require('path');
require('dotenv').config();

// Resolve DB path relative to project root
const dbPath = process.env.DB_PATH || path.resolve(__dirname, '../../data/barbermanager.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to open SQLite DB:', err.message);
    process.exit(1);
  }
  console.log('Connected to SQLite DB at', dbPath);
});

// Promisify common methods (run, get, all)
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

module.exports = { run, get, all, db };
