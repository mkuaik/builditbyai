const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const reviews = [
    { id: 'semrush', file: 'SEMRUSH_MASTER_REVIEW.md' },
    { id: 'elevenlabs', file: 'ELEVENLABS_MASTER_REVIEW.md' },
    { id: 'murfai', file: 'MURFAI_MASTER_REVIEW.md' },
    { id: 'invideo', file: 'INVIDEO_MASTER_REVIEW.md' },
    { id: 'munch', file: 'MUNCH_MASTER_REVIEW.md' },
    { id: 'descript', file: 'DESCRIPT_MASTER_REVIEW.md' },
    { id: 'quillbot', file: 'QUILLBOT_MASTER_REVIEW.md' },
    { id: 'otter', file: 'OTTER_MASTER_REVIEW.md' },
    { id: 'wordtune', file: 'WORDTUNE_MASTER_REVIEW.md' },
    { id: 'klaviyo', file: 'KLAVIYO_MASTER_REVIEW.md' },
];

const toolsDataPath = path.join(__dirname, 'tools-data.js');
let toolsDataContent = fs.readFileSync(toolsDataPath, 'utf8');

const jsonStartIndex = toolsDataContent.indexOf('[');
const jsonEndIndex = toolsDataContent.lastIndexOf(']');
let toolsData = JSON.parse(toolsDataContent.substring(jsonStartIndex, jsonEndIndex + 1));

let injectedCount = 0;
let notFoundIds = [];
let missingFiles = [];

reviews.forEach(review => {
    const mdPath = path.join(__dirname, review.file);
    if (fs.existsSync(mdPath)) {
        const fullReviewContent = fs.readFileSync(mdPath, 'utf8');
        const toolIndex = toolsData.findIndex(t => t.id === review.id);
        if (toolIndex !== -1) {
            toolsData[toolIndex].fullReview = fullReviewContent;
            injectedCount++;
            console.log(`[✅] Injected: ${review.id} (${toolsData[toolIndex].name})`);
        } else {
            notFoundIds.push(review.id);
            console.log(`[⚠️] Tool ID not found: ${review.id}`);
        }
    } else {
        missingFiles.push(review.file);
        console.log(`[⏭️] Skipped (file not found): ${review.file}`);
    }
});

const updatedJsonString = JSON.stringify(toolsData, null, 4);
const updatedFileContent = toolsDataContent.substring(0, jsonStartIndex) + updatedJsonString + toolsDataContent.substring(jsonEndIndex + 1);
fs.writeFileSync(toolsDataPath, updatedFileContent, 'utf8');
console.log('\n📦 Updated tools-data.js');

const toolsJsonPath = path.join(__dirname, 'data', 'tools.json');
if (fs.existsSync(toolsJsonPath)) {
    fs.writeFileSync(toolsJsonPath, updatedJsonString, 'utf8');
    console.log('📦 Updated data/tools.json');
}

console.log(`\n✅ Injected: ${injectedCount} reviews`);
if (notFoundIds.length) console.log(`⚠️ Not found IDs: ${notFoundIds.join(', ')}`);
if (missingFiles.length) console.log(`⏭️ Skipped files: ${missingFiles.join(', ')}`);

console.log('\n🔨 Rebuilding HTML pages...');
try {
    execSync('node build-pages.js', { stdio: 'inherit' });
    console.log('✅ HTML pages rebuilt successfully (156 pages).');
} catch (e) {
    console.error('❌ Build failed:', e.message);
}
