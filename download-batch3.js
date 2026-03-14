const fs = require('fs');
const https = require('https');
const path = require('path');

const logosDir = path.join(__dirname, 'images', 'logos');
if (!fs.existsSync(logosDir)) {
    fs.mkdirSync(logosDir, { recursive: true });
}

const batch3Logos = [
    { id: 'adobeexpress', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Adobe_Express_logo.svg/512px-Adobe_Express_logo.svg.png' },
    { id: 'photai', url: 'https://www.phot.ai/favicon.ico' },
    { id: 'luminar', url: 'https://skylum.com/favicon.ico' },
    { id: 'meshyai', url: 'https://www.meshy.ai/favicon.ico' },
    { id: 'splineai', url: 'https://spline.design/favicon.ico' },
    { id: 'pixlr', url: 'https://pixlr.com/favicon.ico' },
    { id: 'photoroom', url: 'https://www.photoroom.com/favicon.ico' },
    { id: 'vanceai', url: 'https://vanceai.com/favicon.ico' },
    { id: 'clipdrop', url: 'https://clipdrop.co/favicon.ico' },
    { id: 'palettefm', url: 'https://palette.fm/favicon.ico' },
    { id: 'khroma', url: 'https://khroma.co/favicon.ico' },
    { id: 'huemint', url: 'https://huemint.com/favicon.ico' },
    { id: 'letsenhance', url: 'https://letsenhance.io/favicon.ico' },
    { id: 'cleanup', url: 'https://cleanup.pictures/favicon.ico' },
    { id: 'socialbee', url: 'https://socialbee.com/favicon.ico' },
    { id: 'adroll', url: 'https://www.adroll.com/favicon.ico' },
    { id: 'klaviyo', url: 'https://www.klaviyo.com/favicon.ico' },
    { id: 'junglescout', url: 'https://www.junglescout.com/favicon.ico' },
    { id: 'autods', url: 'https://www.autods.com/favicon.ico' }
];

async function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
            if (res.statusCode === 200) {
                const writeStream = fs.createWriteStream(filepath);
                res.pipe(writeStream);
                writeStream.on('finish', () => {
                    writeStream.close();
                    resolve();
                });
            } else if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                 downloadImage(res.headers.location, filepath).then(resolve).catch(reject);
            } else {
                reject(new Error(`Failed to download: ${res.statusCode}`));
            }
        }).on('error', reject);
    });
}

async function run() {
    for (const logo of batch3Logos) {
        const ext = logo.url.includes('.png') ? 'png' : logo.url.includes('.ico') ? 'ico' : 'png';
        const filepath = path.join(logosDir, `${logo.id}.png`); // Always save as png for consistency in tools-data.js
        console.log(`Downloading ${logo.id}...`);
        try {
            await downloadImage(logo.url, filepath);
            console.log(`✅ ${logo.id} downloaded.`);
        } catch (err) {
            console.error(`❌ Failed ${logo.id}: ${err.message}`);
        }
    }
}

run();
