// Jogo 3D de nave espacial estilo corrida infinita com Babylon.js
// Controles: setas para mover, Z/X/C para atirar
// Assets: nave estilizada, efeitos de tiro, terreno procedural

window.addEventListener('DOMContentLoaded', function () {
  var canvas = document.getElementById('renderCanvas');
  var jsStatus = document.getElementById('js-status');
  if (jsStatus) {
    jsStatus.textContent = 'JS rodando: Babylon.js será inicializado.';
  }
  if (!canvas) {
    alert('Canvas não encontrado!');
    return;
  }
  var engine = new BABYLON.Engine(canvas, true);
  var scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color3(0.05, 0.08, 0.15);
  console.log('JS carregado, canvas OK');

  // Fim do teste do cubo. Agora segue o fluxo normal do jogo.

  // Pré-carregar todos os assets depois de criar a cena
  // Carregar assets válidos do Babylon.js Asset Library
  // Tenta carregar assets locais, se existirem. Se não, usa primitivos.
  if (jsStatus) jsStatus.textContent = 'Jogo iniciado! (primitivo/local)';
  console.log('Jogo iniciado! (primitivo/local)');

  // Função utilitária para tentar carregar um asset local, senão retorna primitiva
  async function loadOrPrimitive(filename, fallbackFn) {
    try {
      const result = await BABYLON.SceneLoader.ImportMeshAsync("", "./meshes/", filename, scene);
      if (result.meshes && result.meshes[0]) return result.meshes[0];
    } catch (e) {
      console.warn('Asset local não encontrado:', filename, 'usando primitiva.');
    }
    return fallbackFn();
  }

  // Carregar nave, montanha, prédio, árvore (ou usar primitiva)
  Promise.all([
    loadOrPrimitive('ship.glb', () => BABYLON.MeshBuilder.CreateBox('shipFallback', { size: 2 }, scene)),
    loadOrPrimitive('mountain.glb', () => BABYLON.MeshBuilder.CreateSphere('mountainFallback', { diameter: 4 }, scene)),
    loadOrPrimitive('building.glb', () => BABYLON.MeshBuilder.CreateBox('buildingFallback', { size: 3 }, scene)),
    loadOrPrimitive('tree.glb', () => BABYLON.MeshBuilder.CreateCylinder('treeFallback', { height: 4, diameter: 1 }, scene))
  ]).then(function([shipAsset, mountainAsset, buildingAsset, treeAsset]) {
    // ...restante do código do jogo, igual antes, usando shipAsset, mountainAsset, buildingAsset, treeAsset...

    // ...existing code...

    // Câmera
    var camera = new BABYLON.FollowCamera('camera1', new BABYLON.Vector3(0, 6, -18), scene);
    camera.radius = 18;
    camera.heightOffset = 6;
    camera.rotationOffset = 0;
    camera.attachControl(canvas, true);

    // Luz
    var light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.9;

    // Nave do player
    var ship = shipAsset.clone('playerShip');
    ship.position = new BABYLON.Vector3(0, 1.5, 0);
    ship.scaling = new BABYLON.Vector3(1.5, 1.5, 1.5);
    ship.setEnabled(true);
    camera.lockedTarget = ship;

    // Grupos de tiros
    var bullets = [];
    var bulletsHeavy = [];
    var bulletsCone = [];
    var bulletSpeed = 1.8;
    var lastShot = 0, lastHeavy = 0, lastCone = 0;

    // Inimigos
    var enemies = [];
    var enemySpawnZ = 60;
    function spawnEnemy() {
      var enemy = BABYLON.MeshBuilder.CreateSphere('enemy', { diameter: 2 }, scene);
      enemy.position.x = Math.random() * 16 - 8;
      enemy.position.y = 1.5;
      enemy.position.z = ship.position.z + enemySpawnZ;
      var mat = new BABYLON.StandardMaterial('enemyMat', scene);
      mat.diffuseColor = new BABYLON.Color3(Math.random(), 0.2, 0.2 + Math.random() * 0.8);
      enemy.material = mat;
      enemy.hp = 30;
      enemies.push(enemy);
    }
    setInterval(spawnEnemy, 1200);

    // Terreno procedural
    var groundTypes = ['mountain', 'city', 'forest', 'plain'];
    var grounds = [];
    function createGround(type, z) {
      var ground = BABYLON.MeshBuilder.CreateGround('ground', { width: 40, height: 60, subdivisions: 16 }, scene);
      ground.position.y = 0;
      ground.position.z = z;
      var mat = new BABYLON.StandardMaterial('gmat', scene);
      ground.material = mat;
      ground.metadata = { type: type, objects: [] };

      if (type === 'mountain') {
        mat.diffuseColor = new BABYLON.Color3(0.4, 0.3, 0.2);
        for (let i = 0; i < 2; i++) {
          let m = mountainAsset.clone('mountain' + Math.random());
          m.position = new BABYLON.Vector3(Math.random() * 36 - 18, 0, z + Math.random() * 50 - 25);
          m.scaling = new BABYLON.Vector3(8 + Math.random() * 4, 6 + Math.random() * 3, 8 + Math.random() * 4);
          m.setEnabled(true);
          ground.metadata.objects.push(m);
        }
      } else if (type === 'city') {
        mat.diffuseColor = new BABYLON.Color3(0.7, 0.7, 0.8);
        for (let i = 0; i < 6; i++) {
          let b = buildingAsset.clone('building' + Math.random());
          b.position = new BABYLON.Vector3(Math.random() * 36 - 18, 0, z + Math.random() * 50 - 25);
          b.scaling = new BABYLON.Vector3(2 + Math.random() * 2, 4 + Math.random() * 8, 2 + Math.random() * 2);
          b.setEnabled(true);
          ground.metadata.objects.push(b);
        }
      } else if (type === 'forest') {
        mat.diffuseColor = new BABYLON.Color3(0.2, 0.5, 0.2);
        for (let i = 0; i < 10; i++) {
          let t = treeAsset.clone('tree' + Math.random());
          t.position = new BABYLON.Vector3(Math.random() * 36 - 18, 0, z + Math.random() * 50 - 25);
          t.scaling = new BABYLON.Vector3(2 + Math.random() * 1.5, 2 + Math.random() * 2, 2 + Math.random() * 1.5);
          t.setEnabled(true);
          ground.metadata.objects.push(t);
        }
      } else {
        mat.diffuseColor = new BABYLON.Color3(0.2, 0.5, 0.2);
      }
      grounds.push(ground);
    }
    for (let i = 0; i < 6; i++) createGround(groundTypes[i % 4], i * 60);

    // Controles
    var inputMap = {};
    scene.actionManager = new BABYLON.ActionManager(scene);
    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, function (evt) {
      inputMap[evt.sourceEvent.key.toLowerCase()] = true;
    }));
    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, function (evt) {
      inputMap[evt.sourceEvent.key.toLowerCase()] = false;
    }));

    // Loop principal
    scene.onBeforeRenderObservable.add(() => {
      // Movimento nave
      if (inputMap['arrowleft']) ship.position.x -= 0.5;
      if (inputMap['arrowright']) ship.position.x += 0.5;
      if (inputMap['arrowup']) ship.position.z += 0.8;
      if (inputMap['arrowdown']) ship.position.z -= 0.8;
      ship.position.x = Math.max(-18, Math.min(18, ship.position.x));
      // Corrida infinita
      ship.position.z += 0.7;
      camera.target.z = ship.position.z;

      // Terreno avança
      grounds.forEach(g => {
        if (g.position.z < ship.position.z - 40) {
          // Remove objetos antigos
          if (g.metadata && g.metadata.objects) g.metadata.objects.forEach(o => o.dispose());
          g.position.z += 360;
          let t = groundTypes[Math.floor(Math.random() * groundTypes.length)];
          g.metadata.type = t;
          g.metadata.objects = [];
          // Adiciona novos objetos
          if (t === 'mountain') {
            for (let i = 0; i < 2; i++) {
              let m = mountainAsset.clone('mountain' + Math.random());
              m.position = new BABYLON.Vector3(Math.random() * 36 - 18, 0, g.position.z + Math.random() * 50 - 25);
              m.scaling = new BABYLON.Vector3(8 + Math.random() * 4, 6 + Math.random() * 3, 8 + Math.random() * 4);
              m.setEnabled(true);
              g.metadata.objects.push(m);
            }
          } else if (t === 'city') {
            for (let i = 0; i < 6; i++) {
              let b = buildingAsset.clone('building' + Math.random());
              b.position = new BABYLON.Vector3(Math.random() * 36 - 18, 0, g.position.z + Math.random() * 50 - 25);
              b.scaling = new BABYLON.Vector3(2 + Math.random() * 2, 4 + Math.random() * 8, 2 + Math.random() * 2);
              b.setEnabled(true);
              g.metadata.objects.push(b);
            }
          } else if (t === 'forest') {
            for (let i = 0; i < 10; i++) {
              let t = treeAsset.clone('tree' + Math.random());
              t.position = new BABYLON.Vector3(Math.random() * 36 - 18, 0, g.position.z + Math.random() * 50 - 25);
              t.scaling = new BABYLON.Vector3(2 + Math.random() * 1.5, 2 + Math.random() * 2, 2 + Math.random() * 1.5);
              t.setEnabled(true);
              g.metadata.objects.push(t);
            }
          }
        }
      });

      // Tiros
      var now = Date.now();
      if (inputMap['z'] && now - lastShot > 180) {
        var b = BABYLON.MeshBuilder.CreateSphere('b', { diameter: 0.3 }, scene);
        b.position = ship.position.clone(); b.position.y = 1.5;
        b.material = new BABYLON.StandardMaterial('bmat', scene);
        b.material.emissiveColor = new BABYLON.Color3(0.2, 0.7, 1);
        bullets.push(b); lastShot = now;
      }
      if (inputMap['x'] && now - lastHeavy > 500) {
        var b = BABYLON.MeshBuilder.CreateBox('bh', { size: 0.5 }, scene);
        b.position = ship.position.clone(); b.position.y = 1.5;
        b.material = new BABYLON.StandardMaterial('bhmat', scene);
        b.material.emissiveColor = new BABYLON.Color3(1, 0.2, 0.2);
        bulletsHeavy.push(b); lastHeavy = now;
      }
      if (inputMap['c'] && now - lastCone > 2000) {
        for (let a = -15; a <= 15; a += 15) {
          let rad = BABYLON.Tools.ToRadians(a);
          let b = BABYLON.MeshBuilder.CreateCylinder('bc', { diameterTop: 0.1, diameterBottom: 0.5, height: 2 }, scene);
          b.position = ship.position.clone(); b.position.y = 1.5;
          b.material = new BABYLON.StandardMaterial('bcmat', scene);
          b.material.emissiveColor = new BABYLON.Color3(1, 1, 0.2);
          b.rotation.x = Math.PI / 2;
          b.rotation.y = rad;
          b.metadata = { angle: rad };
          bulletsCone.push(b);
        }
        lastCone = now;
      }
      // Atualiza tiros
      bullets.forEach((b, i) => { b.position.z += 2.5; if (b.position.z > ship.position.z + 60) { b.dispose(); bullets.splice(i, 1); } });
      bulletsHeavy.forEach((b, i) => { b.position.z += 1.7; if (b.position.z > ship.position.z + 60) { b.dispose(); bulletsHeavy.splice(i, 1); } });
      bulletsCone.forEach((b, i) => {
        b.position.z += 2.2 * Math.cos(b.metadata.angle);
        b.position.x += 2.2 * Math.sin(b.metadata.angle);
        if (b.position.z > ship.position.z + 60 || b.position.x < -20 || b.position.x > 20) { b.dispose(); bulletsCone.splice(i, 1); }
      });

      // Colisão tiros x inimigos
      enemies.forEach((e, ei) => {
        bullets.forEach((b, bi) => { if (e.intersectsMesh(b, false)) { e.hp -= 10; b.dispose(); bullets.splice(bi, 1); } });
        bulletsHeavy.forEach((b, bi) => { if (e.intersectsMesh(b, false)) { e.hp -= 25; b.dispose(); bulletsHeavy.splice(bi, 1); } });
        bulletsCone.forEach((b, bi) => { if (e.intersectsMesh(b, false)) { e.hp -= 18; b.dispose(); bulletsCone.splice(bi, 1); } });
        if (e.hp <= 0) { e.dispose(); enemies.splice(ei, 1); }
      });
    });
    // ...existing code...

    // Render loop
    engine.runRenderLoop(function () {
      scene.render();
    });
    window.addEventListener('resize', function () {
      engine.resize();
    });
  // ...restante do código do jogo segue normalmente usando apenas os assets acima...
  });
});
