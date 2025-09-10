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

function spawnPowerUp() {
  const type = Math.random() < 0.5 ? 'speed' : 'invuln';
  powerUps.push({
    x: Math.random() * (width - 40) + 20,
    y: -30,
    type,
    speed: player.speed
  });
}

function update() {
  if (gameOver) return;
  // Movimento do player
  if (keys['ArrowLeft'] || keys['a']) player.x -= 8;
  if (keys['ArrowRight'] || keys['d']) player.x += 8;
  if (keys['ArrowUp'] || keys['w']) player.y -= 6;
  if (keys['ArrowDown'] || keys['s']) player.y += 6;
  // Limites
  player.x = Math.max(30, Math.min(width - 30, player.x));
  player.y = Math.max(30, Math.min(height - 60, player.y));

  // Obstáculos
  for (let o of obstacles) {
    o.y += o.speed;
  }
  obstacles = obstacles.filter(o => o.y < height + 100);

  // PowerUps
  for (let p of powerUps) {
    p.y += p.speed;
  }
  powerUps = powerUps.filter(p => p.y < height + 40);

  // Colisão obstáculos
  for (let o of obstacles) {
    if (
      player.x > o.x - 30 && player.x < o.x + o.w + 30 &&
      player.y > o.y - 30 && player.y < o.y + o.h + 30
    ) {
      if (!player.invulnerable) {
        gameOver = true;
      }
    }
  }
  // Colisão powerup
  for (let i = powerUps.length - 1; i >= 0; i--) {
    let p = powerUps[i];
    if (
      player.x > p.x - 35 && player.x < p.x + 35 &&
      player.y > p.y - 35 && player.y < p.y + 35
    ) {
      if (p.type === 'speed') {
        player.speed += 2;
        setTimeout(() => player.speed -= 2, 4000);
      } else if (p.type === 'invuln') {
        player.invulnerable = true;
        player.invulnTimer = 180;
      }
      powerUps.splice(i, 1);
    }
  }
  // Invulnerabilidade
  if (player.invulnerable) {
    player.invulnTimer--;
    if (player.invulnTimer <= 0) {
      player.invulnerable = false;
    }
  }
