// Script Node.js para baixar assets 3D gratuitos/open source para o jogo Babylon.js
// Basta rodar: node baixar-assets.js

const https = require('https');
const fs = require('fs');
const path = require('path');

const assets = [
  {
    url: 'https://github.com/Quaternius/SpaceshipsPack/raw/main/GLTF/SpaceshipA.glb',
    dest: 'meshes/spaceship.glb'
  },
  {
    url: 'https://kenney.nl/assets/nature-kit/download', // Baixar manualmente e extrair SM_Mountain.glb
    dest: 'meshes/mountain.glb',
    manual: true
  },
  {
    url: 'https://kenney.nl/assets/city-kit/download', // Baixar manualmente e extrair SM_BuildingA.glb
    dest: 'meshes/building.glb',
    manual: true
  },
  {
    url: 'https://kenney.nl/assets/nature-kit/download', // Baixar manualmente e extrair SM_TreePine.glb
    dest: 'meshes/tree.glb',
    manual: true
  }
];

function baixar(url, dest, cb) {
  const file = fs.createWriteStream(dest);
  https.get(url, (response) => {
    if (response.statusCode !== 200) {
      fs.unlink(dest, () => { });
      cb(new Error('Falha ao baixar ' + url + ' (status ' + response.statusCode + ')'));
      return;
    }
    response.pipe(file);
    file.on('finish', () => file.close(cb));
  }).on('error', (err) => {
    fs.unlink(dest, () => { });
    cb(err);
  });
}

if (!fs.existsSync('meshes')) fs.mkdirSync('meshes');

assets.forEach(asset => {
  if (asset.manual) {
    console.log(`Baixe manualmente: ${asset.url}`);
    console.log(`Depois extraia o arquivo .glb desejado e coloque como ${asset.dest}`);
  } else {
    console.log('Baixando', asset.url, '...');
    baixar(asset.url, asset.dest, (err) => {
      if (err) {
        console.error('Erro ao baixar', asset.url, err.message);
      } else {
        console.log('Salvo em', asset.dest);
      }
    });
  }
});
