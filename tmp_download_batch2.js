const fs = require('fs');
const path = require('path');
const https = require('https');

const tools = [
  { id: 'zebracat', domain: 'zebracat.ai' },
  { id: 'glossai', domain: 'glossai.co' },
  { id: 'semblyai', domain: 'sembly.ai' },
  { id: 'castmagic', domain: 'castmagic.io' },
  { id: 'lalalai', domain: 'lalal.ai' },
  { id: 'avoma', domain: 'avoma.com' },
  { id: 'laxis', domain: 'laxis.com' },
  { id: 'revai', domain: 'rev.com' },
  { id: 'aisongmaker', domain: 'aisongmaker.io' },
  { id: 'voicemod', domain: 'voicemod.net' },
  { id: 'voicesai', domain: 'getvoices.ai' },
  { id: 'voiserai', domain: 'voiser.ai' },
  { id: 'voispark', domain: 'voispark.com' },
  { id: 'voiceai', domain: 'voice.ai' },
  { id: 'speechify', domain: 'speechify.com' },
  { id: 'deepbrain', domain: 'deepbrain.io' }
];

const logosDir = path.join(__dirname, 'images', 'logos');

function download(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode === 200) {
        const file = fs.createWriteStream(dest);
        res.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      } else {
        reject(new Error(`Failed to download ${url}: ${res.statusCode}`));
      }
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function start() {
  for (const tool of tools) {
    const url = `https://www.google.com/s2/favicons?domain=${tool.domain}&sz=128`;
    const dest = path.join(logosDir, `${tool.id}.png`);
    try {
      await download(url, dest);
      console.log(`✅ Downloaded logo for ${tool.id}`);
    } catch (e) {
      console.error(`❌ Failed for ${tool.id}: ${e.message}`);
    }
  }
}

start();
