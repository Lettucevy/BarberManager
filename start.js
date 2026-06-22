// start.js – inicia backend e frontend simultaneamente (compatível Windows/Linux)
const { spawn } = require('child_process');
const path = require('path');

function npmCmd() {
  return process.platform === 'win32' ? 'npm.cmd' : 'npm';
}

function run(command, args, options) {
  const proc = spawn(command, args, { stdio: 'inherit', shell: true, ...options });
  proc.on('close', code => {
    if (code !== 0) {
      console.error(`${command} saiu com código ${code}`);
    }
  });
  proc.on('error', err => {
    console.error(`Erro ao executar ${command}:`, err);
  });
  return proc;
}

// 1️⃣ Inicia o servidor Express (porta 5000)
run(npmCmd(), ['run', 'dev'], { cwd: path.join(__dirname, 'server') });

// 2️⃣ Inicia o cliente Vite (porta 5173)
run(npmCmd(), ['run', 'dev'], { cwd: path.join(__dirname, 'client') });
