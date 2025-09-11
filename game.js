// Jogo 3D de Aviação com Phaser 3 (pseudo-3D)
// Assets open source: Kenney.nl (https://kenney.nl/assets)

const GAME_WIDTH = 720;
const GAME_HEIGHT = 480;
const GAME_DURATION = 5 * 60 * 1000; // 5 minutos em ms

const ASSETS = {
  plane: 'https://kenney.nl/assets/aircrafts-pack/PNG/Planes/planeRed1.png',
  enemy: 'https://kenney.nl/assets/aircrafts-pack/PNG/Planes/planeBlue1.png',
  powerup: 'https://kenney.nl/assets/powerups/PNG/powerupYellow_bolt.png',
  building: 'https://kenney.nl/assets/city-kit/PNG/Buildings/building_01.png',
  ground: 'https://kenney.nl/assets/space-kit/PNG/spaceBackground.png',
  sky: 'https://kenney.nl/assets/background-elements/PNG/clouds/cloud1.png',
  obstacle: 'https://kenney.nl/assets/space-kit/PNG/Meteors/meteorBrown_big1.png',
};

class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene');
    this.startTime = 0;
    this.score = 0;
  }

  preload() {
    this.load.image('plane', ASSETS.plane);
    this.load.image('enemy', ASSETS.enemy);
    this.load.image('powerup', ASSETS.powerup);
    this.load.image('building', ASSETS.building);
    this.load.image('ground', ASSETS.ground);
    this.load.image('sky', ASSETS.sky);
    this.load.image('obstacle', ASSETS.obstacle);
  }

  create() {
    this.startTime = this.time.now;
    this.score = 0;
    this.gameOver = false;

    // Fundo (chão e céu)
    this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'ground').setOrigin(0, 0).setDepth(-2);
    this.sky = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'sky').setOrigin(0, 0).setAlpha(0.5).setDepth(-1);

    // Avião do jogador
    this.player = this.physics.add.sprite(GAME_WIDTH / 2, GAME_HEIGHT - 80, 'plane').setScale(0.7);
    this.player.setCollideWorldBounds(true);

    // Grupos
    this.obstacles = this.physics.add.group();
    this.enemies = this.physics.add.group();
    this.powerups = this.physics.add.group();
    this.buildings = this.physics.add.group();

    // Controles
    this.cursors = this.input.keyboard.createCursorKeys();

    // Colisões
    this.physics.add.overlap(this.player, this.obstacles, this.hitObstacle, null, this);
    this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, null, this);
    this.physics.add.overlap(this.player, this.powerups, this.collectPowerup, null, this);

    // Score
    this.scoreText = this.add.text(10, 10, 'Score: 0', { font: '20px Arial', fill: '#fff' });
    this.timerText = this.add.text(GAME_WIDTH - 180, 10, 'Tempo: 05:00', { font: '20px Arial', fill: '#fff' });

    // Spawners
    this.time.addEvent({ delay: 1200, callback: this.spawnObstacle, callbackScope: this, loop: true });
    this.time.addEvent({ delay: 2000, callback: this.spawnEnemy, callbackScope: this, loop: true });
    this.time.addEvent({ delay: 3500, callback: this.spawnPowerup, callbackScope: this, loop: true });
    this.time.addEvent({ delay: 2500, callback: this.spawnBuilding, callbackScope: this, loop: true });
  }

  update(time, delta) {
    if (this.gameOver) return;

    // Movimento do fundo
    this.sky.tilePositionY -= 0.2;

    // Controles do avião
    if (this.cursors.left.isDown) this.player.x -= 4;
    if (this.cursors.right.isDown) this.player.x += 4;
    if (this.cursors.up.isDown) this.player.y -= 3;
    if (this.cursors.down.isDown) this.player.y += 3;

    // Atualiza score
    this.score += delta * 0.01;
    this.scoreText.setText('Score: ' + Math.floor(this.score));

    // Timer
    let elapsed = time - this.startTime;
    let remaining = Math.max(0, GAME_DURATION - elapsed);
    let min = Math.floor(remaining / 60000).toString().padStart(2, '0');
    let sec = Math.floor((remaining % 60000) / 1000).toString().padStart(2, '0');
    this.timerText.setText(`Tempo: ${min}:${sec}`);
    if (remaining <= 0) this.endGame(true);

    // Remove objetos fora da tela
    this.obstacles.children.iterate(child => { if (child && child.y > GAME_HEIGHT + 40) child.destroy(); });
    this.enemies.children.iterate(child => { if (child && child.y > GAME_HEIGHT + 40) child.destroy(); });
    this.powerups.children.iterate(child => { if (child && child.y > GAME_HEIGHT + 40) child.destroy(); });
    this.buildings.children.iterate(child => { if (child && child.y > GAME_HEIGHT + 40) child.destroy(); });
  }

  spawnObstacle() {
    let x = Phaser.Math.Between(60, GAME_WIDTH - 60);
    let obs = this.obstacles.create(x, -40, 'obstacle').setScale(0.7);
    obs.setVelocityY(Phaser.Math.Between(180, 260));
  }

  spawnEnemy() {
    let x = Phaser.Math.Between(60, GAME_WIDTH - 60);
    let enemy = this.enemies.create(x, -40, 'enemy').setScale(0.7);
    enemy.setVelocityY(Phaser.Math.Between(120, 200));
  }

  spawnPowerup() {
    let x = Phaser.Math.Between(60, GAME_WIDTH - 60);
    let power = this.powerups.create(x, -40, 'powerup').setScale(0.6);
    power.setVelocityY(150);
  }

  spawnBuilding() {
    let x = Phaser.Math.Between(60, GAME_WIDTH - 60);
    let b = this.buildings.create(x, -40, 'building').setScale(0.5);
    b.setVelocityY(100);
    b.setAlpha(0.7);
  }

  hitObstacle(player, obs) {
    obs.destroy();
    this.endGame(false);
  }

  hitEnemy(player, enemy) {
    enemy.destroy();
    this.endGame(false);
  }

  collectPowerup(player, power) {
    power.destroy();
    this.score += 100;
  }

  endGame(win) {
    this.gameOver = true;
    this.player.setTint(0xff0000);
    let msg = win ? 'Parabéns! Você venceu!' : 'Game Over!';
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, msg, { font: '32px Arial', fill: '#fff' }).setOrigin(0.5);
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 40, 'Score: ' + Math.floor(this.score), { font: '24px Arial', fill: '#fff' }).setOrigin(0.5);
    this.time.delayedCall(4000, () => this.scene.restart(), [], this);
  }
}

const config = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#87ceeb',
  parent: 'game-container',
  physics: { default: 'arcade', arcade: { debug: false } },
  scene: [MainScene],
};

new Phaser.Game(config);
