// game.js
// Jogo de run infinita: Avião

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let width = window.innerWidth;
let height = window.innerHeight;
canvas.width = width;
canvas.height = height;

window.addEventListener('resize', () => {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
});

// Assets simples (pode ser melhorado depois)
function drawPlane(x, y, invulnerable) {
  ctx.save();
  if (invulnerable) {
    ctx.globalAlpha = 0.5;
  }
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x - 20, y + 40);
  ctx.lineTo(x + 20, y + 40);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawMountain(x, y, w, h) {
  ctx.fillStyle = '#556b2f';
  ctx.beginPath();
  ctx.moveTo(x, y + h);
  ctx.lineTo(x + w / 2, y);
  ctx.lineTo(x + w, y + h);
  ctx.closePath();
  ctx.fill();
}

function drawBuilding(x, y, w, h) {
  ctx.fillStyle = '#888';
  ctx.fillRect(x, y, w, h);
}

function drawEnemyPlane(x, y) {
  ctx.fillStyle = '#f00';
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x - 15, y + 30);
  ctx.lineTo(x + 15, y + 30);
  ctx.closePath();
  ctx.fill();
}

function drawPowerUp(x, y, type) {
  ctx.save();
  if (type === 'speed') ctx.fillStyle = '#0f0';
  else ctx.fillStyle = '#ff0';
  ctx.beginPath();
  ctx.arc(x, y, 15, 0, 2 * Math.PI);
  ctx.fill();
  ctx.restore();
}

// Objetos do jogo
let player = {
  x: width / 2,
  y: height - 120,
  speed: 6,
  invulnerable: false,
  invulnTimer: 0
};
let obstacles = [];
let powerUps = [];
let score = 0;
let gameOver = false;
let keys = {};

// Controles
window.addEventListener('keydown', e => keys[e.key] = true);
window.addEventListener('keyup', e => keys[e.key] = false);

function spawnObstacle() {
  const type = Math.random();
  if (type < 0.4) {
    // Montanha
    obstacles.push({
      kind: 'mountain',
      x: Math.random() * (width - 120),
      y: -100,
      w: 120 + Math.random() * 80,
      h: 100 + Math.random() * 60,
      speed: player.speed
    });
  } else if (type < 0.7) {
    // Prédio
    obstacles.push({
      kind: 'building',
      x: Math.random() * (width - 60),
      y: -120,
      w: 40 + Math.random() * 40,
      h: 120 + Math.random() * 80,
      speed: player.speed
    });
  } else {
    // Avião inimigo
    obstacles.push({
      kind: 'enemy',
      x: Math.random() * (width - 40),
      y: -60,
      w: 40,
      h: 40,
      speed: player.speed + 2
    });
  }
}

