const fs = require('fs');
const https = require('https');
const path = require('path');

const logosDir = path.join(__dirname, 'images', 'logos');

const retryLogos = [
    { id: 'adobeexpress', url: 'https://www.adobe.com/favicon.ico' },
    { id: 'photai', url: 'https://cdn.prod.website-files.com/64b56306e788647087617a26/64b56306e788647087617a6a_Photai%20Favicon.png' },
    { id: 'splineai', url: 'https://spline.design/favicon-32x32.png' },
    { id: 'khroma', url: 'http://khroma.co/favicon.ico' },
    { id: 'letsenhance', url: 'https://letsenhance.io/static/v2/img/favicon.ico' },
    { id: 'klaviyo', url: 'https://www.klaviyo.com/wp-content/uploads/2023/04/favicon-32x32.png' },
    { id: 'autods', url: 'https://www.autods.com/wp-content/uploads/2021/04/cropped-favicon-32x32.png' }
];

async function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : require('http');
        protocol.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
            if (res.statusCode === 200) {
                const writeStream = fs.createWriteStream(filepath);
                res.pipe(writeStream);
                writeStream.on('finish', () => {
                    writeStream.close();
                    resolve();
                });
            } else if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                 downloadImage(new URL(res.headers.location, url).href, filepath).then(resolve).catch(reject);
            } else {
                reject(new Error(`Failed to download: ${res.statusCode}`));
            }
        }).on('error', reject);
    });
}

async function run() {
    for (const logo of retryLogos) {
        const filepath = path.join(logosDir, `${logo.id}.png`);
        console.log(`Retrying ${logo.id}...`);
        try {
            await downloadImage(logo.url, filepath);
            console.log(`✅ ${logo.id} downloaded.`);
        } catch (err) {
            console.error(`❌ Failed ${logo.id}: ${err.message}`);
        }
    }
}

run();
