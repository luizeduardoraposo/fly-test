

// --- Jogo 3D com Three.js ---
let width = window.innerWidth;
let height = window.innerHeight;

// Cena, câmera e renderizador
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 2000);
camera.position.set(0, 30, 100);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(width, height);
document.body.appendChild(renderer.domElement);

window.addEventListener('resize', () => {
  width = window.innerWidth;
  height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
});

// Luz
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);
const dirLight = new THREE.DirectionalLight(0xffffff, 0.7);
dirLight.position.set(0, 100, 100);
scene.add(dirLight);

// Player (avião)
const planeGeometry = new THREE.ConeGeometry(5, 20, 16);
const planeMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
const playerMesh = new THREE.Mesh(planeGeometry, planeMaterial);
playerMesh.rotation.x = Math.PI / 2;
playerMesh.position.set(0, 0, 0);
scene.add(playerMesh);

let player = {
  mesh: playerMesh,
  speed: 2.5,
  invulnerable: false,
  invulnTimer: 0
};

let obstacles = [];
let powerUps = [];
let score = 0;
let gameOver = false;
let keys = {};

// Controles
window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

function spawnObstacle() {
  const type = Math.random();
  let mesh, kind;
  if (type < 0.4) {
    // Montanha
    const geo = new THREE.ConeGeometry(12 + Math.random() * 10, 30 + Math.random() * 20, 12);
    const mat = new THREE.MeshPhongMaterial({ color: 0x556b2f });
    mesh = new THREE.Mesh(geo, mat);
    mesh.position.set((Math.random() - 0.5) * 80, -10, -300);
    kind = 'mountain';
  } else if (type < 0.7) {
    // Prédio
    const geo = new THREE.BoxGeometry(10 + Math.random() * 10, 40 + Math.random() * 30, 10 + Math.random() * 10);
    const mat = new THREE.MeshPhongMaterial({ color: 0x888888 });
    mesh = new THREE.Mesh(geo, mat);
    mesh.position.set((Math.random() - 0.5) * 80, 0, -300);
    kind = 'building';
  } else {
    // Avião inimigo
    const geo = new THREE.ConeGeometry(5, 18, 12);
    const mat = new THREE.MeshPhongMaterial({ color: 0xff0000 });
    mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = Math.PI / 2;
    mesh.position.set((Math.random() - 0.5) * 80, 0, -300);
    kind = 'enemy';
  }
  scene.add(mesh);
  obstacles.push({ mesh, kind });
}

function spawnPowerUp() {
  const type = Math.random() < 0.5 ? 'speed' : 'invuln';
  const geo = new THREE.SphereGeometry(4, 16, 16);
  const mat = new THREE.MeshPhongMaterial({ color: type === 'speed' ? 0x00ff00 : 0xffff00 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set((Math.random() - 0.5) * 80, 0, -300);
  scene.add(mesh);
  powerUps.push({ mesh, type });
}

function resetGame() {
  player.mesh.position.set(0, 0, 0);
  player.speed = 2.5;
  player.invulnerable = false;
  player.invulnTimer = 0;
  for (let o of obstacles) scene.remove(o.mesh);
  for (let p of powerUps) scene.remove(p.mesh);
  obstacles = [];
  powerUps = [];
  score = 0;
  gameOver = false;
}

let obstacleTimer = 0;
let powerUpTimer = 0;

function update() {
  if (gameOver) return;
  // Movimento do player
  if (keys['arrowleft'] || keys['a']) player.mesh.position.x -= 2.5;
  if (keys['arrowright'] || keys['d']) player.mesh.position.x += 2.5;
  if (keys['arrowup'] || keys['w']) player.mesh.position.y += 2.0;
  if (keys['arrowdown'] || keys['s']) player.mesh.position.y -= 2.0;
  // Limites
  player.mesh.position.x = Math.max(-45, Math.min(45, player.mesh.position.x));
  player.mesh.position.y = Math.max(-15, Math.min(30, player.mesh.position.y));

  // Obstáculos
  for (let o of obstacles) {
    o.mesh.position.z += player.speed;
  }
  obstacles = obstacles.filter(o => {
    if (o.mesh.position.z > 100) {
      scene.remove(o.mesh);
      return false;
    }
    return true;
  });

  // PowerUps
  for (let p of powerUps) {
    p.mesh.position.z += player.speed;
  }
  powerUps = powerUps.filter(p => {
    if (p.mesh.position.z > 100) {
      scene.remove(p.mesh);
      return false;
    }
    return true;
  });

  // Colisão obstáculos
  for (let o of obstacles) {
    const dx = player.mesh.position.x - o.mesh.position.x;
    const dy = player.mesh.position.y - o.mesh.position.y;
    const dz = player.mesh.position.z - o.mesh.position.z;
    if (Math.abs(dx) < 10 && Math.abs(dy) < 15 && Math.abs(dz) < 15) {
      if (!player.invulnerable) {
        gameOver = true;
      }
    }
  }
  // Colisão powerup
  for (let i = powerUps.length - 1; i >= 0; i--) {
    let p = powerUps[i];
    const dx = player.mesh.position.x - p.mesh.position.x;
    const dy = player.mesh.position.y - p.mesh.position.y;
    const dz = player.mesh.position.z - p.mesh.position.z;
    if (Math.abs(dx) < 10 && Math.abs(dy) < 15 && Math.abs(dz) < 15) {
      if (p.type === 'speed') {
        player.speed += 1.5;
        setTimeout(() => player.speed -= 1.5, 4000);
      } else if (p.type === 'invuln') {
        player.invulnerable = true;
        player.invulnTimer = 180;
      }
      scene.remove(p.mesh);
      powerUps.splice(i, 1);
    }
  }
  // Invulnerabilidade
  if (player.invulnerable) {
    player.invulnTimer--;
    if (player.invulnTimer <= 0) {
      player.invulnerable = false;
    }
    player.mesh.material.opacity = 0.5;
    player.mesh.material.transparent = true;
  } else {
    player.mesh.material.opacity = 1.0;
    player.mesh.material.transparent = false;
  }
  // Score
  score++;
}

function drawUI() {
  // Score e Game Over
  let ui = document.getElementById('game-ui');
  if (!ui) {
    ui = document.createElement('div');
    ui.id = 'game-ui';
    ui.style.position = 'fixed';
    ui.style.top = '20px';
    ui.style.left = '30px';
    ui.style.color = '#222';
    ui.style.font = 'bold 32px Arial';
    ui.style.zIndex = 10;
    document.body.appendChild(ui);
  }
  ui.innerHTML = `Score: ${score}`;
  if (gameOver) {
    ui.innerHTML += `<br><span style="font-size:48px;color:#fff;background:rgba(0,0,0,0.7);padding:16px;">GAME OVER</span><br><span style="font-size:24px;">Pressione R para reiniciar</span>`;
  }
}

function gameLoop() {
  update();
  renderer.render(scene, camera);
  drawUI();
  if (!gameOver) {
    obstacleTimer++;
    powerUpTimer++;
    if (obstacleTimer > 30) {
      spawnObstacle();
      obstacleTimer = 0;
    }
    if (powerUpTimer > 180) {
      spawnPowerUp();
      powerUpTimer = 0;
    }
  }
  requestAnimationFrame(gameLoop);
}

window.addEventListener('keydown', e => {
  if (gameOver && (e.key === 'r' || e.key === 'R')) {
    resetGame();
  }
});

gameLoop();
