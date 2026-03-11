const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const toolsDataRaw = fs.readFileSync(path.join(__dirname, 'data', 'tools.json'), 'utf8');
const toolsData = JSON.parse(toolsDataRaw);

const logosDir = path.join(__dirname, 'images', 'logos');
if (!fs.existsSync(logosDir)) {
  fs.mkdirSync(logosDir, { recursive: true });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(dest);
    proto.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        downloadFile(res.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode !== 200) {
        fs.unlinkSync(dest);
        reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        return;
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', (err) => {
      if (fs.existsSync(dest)) fs.unlinkSync(dest);
      reject(err);
    });
  });
}

async function main() {
  let success = 0;
  let failed = 0;

  for (const tool of toolsData) {
    const filename = `${tool.id}.png`;
    const dest = path.join(logosDir, filename);

    // Skip if already downloaded
    if (fs.existsSync(dest) && fs.statSync(dest).size > 100) {
      console.log(`⏭️  ${tool.name} — already exists`);
      success++;
      continue;
    }

    try {
      await downloadFile(tool.logo, dest);
      console.log(`✅ ${tool.name} — downloaded`);
      success++;
    } catch (err) {
      console.log(`❌ ${tool.name} — ${err.message}`);
      failed++;
    }

    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 200));
  }

  console.log(`\n📊 Done! ${success} downloaded, ${failed} failed.`);

  if (failed === 0) {
    console.log('\n💡 To use local logos, update tools-data.js logo paths to:');
    console.log('   "./images/logos/{tool_id}.png"');
  }
}

main();
