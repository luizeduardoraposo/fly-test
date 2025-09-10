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
