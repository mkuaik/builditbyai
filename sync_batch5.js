const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const reviews = [
    { id: 'notion', file: 'NOTION_MASTER_REVIEW.md' },
    { id: 'clickup', file: 'CLICKUP_MASTER_REVIEW.md' },
    { id: 'miro', file: 'MIRO_MASTER_REVIEW.md' },
    { id: 'zapier', file: 'ZAPIER_MASTER_REVIEW.md' },
    { id: 'slack', file: 'SLACK_AI_MASTER_REVIEW.md' },
    { id: 'vidiq', file: 'VIDIQ_MASTER_REVIEW.md' },
    { id: 'tubebuddy', file: 'TUBEBUDDY_MASTER_REVIEW.md' },
    { id: 'superhuman', file: 'SUPERHUMAN_MASTER_REVIEW.md' },
    { id: 'trello', file: 'TRELLO_MASTER_REVIEW.md' },
    { id: 'gamma', file: 'GAMMA_MASTER_REVIEW.md' },
];

const toolsDataPath = path.join(__dirname, 'tools-data.js');
let toolsDataContent = fs.readFileSync(toolsDataPath, 'utf8');

const jsonStartIndex = toolsDataContent.indexOf('[');
const jsonEndIndex = toolsDataContent.lastIndexOf(']');
const toolsJsonString = toolsDataContent.substring(jsonStartIndex, jsonEndIndex + 1);
let toolsData = JSON.parse(toolsJsonString);

let injectedCount = 0;
let notFoundIds = [];

reviews.forEach(review => {
    const mdPath = path.join(__dirname, review.file);
    if (fs.existsSync(mdPath)) {
        const fullReviewContent = fs.readFileSync(mdPath, 'utf8');
        const toolIndex = toolsData.findIndex(t => t.id === review.id);
        if (toolIndex !== -1) {
            toolsData[toolIndex].fullReview = fullReviewContent;
            injectedCount++;
            console.log(`[✅ Success] Injected review for: ${review.id} (${toolsData[toolIndex].name})`);
        } else {
            notFoundIds.push(review.id);
            console.log(`[⚠️ Warning] Tool ID not found in tools-data.js: ${review.id}`);
        }
    } else {
        console.log(`[❌ Error] Markdown file not found: ${review.file}`);
    }
});

// Update tools-data.js
const updatedJsonString = JSON.stringify(toolsData, null, 4);
const updatedFileContent = toolsDataContent.substring(0, jsonStartIndex) + updatedJsonString + toolsDataContent.substring(jsonEndIndex + 1);
fs.writeFileSync(toolsDataPath, updatedFileContent, 'utf8');
console.log('\n📦 Updated tools-data.js');

// Also update data/tools.json for backward compatibility
const toolsJsonPath = path.join(__dirname, 'data', 'tools.json');
if (fs.existsSync(toolsJsonPath)) {
    fs.writeFileSync(toolsJsonPath, updatedJsonString, 'utf8');
    console.log('📦 Updated data/tools.json');
}

console.log(`\n✅ Successfully injected ${injectedCount} master reviews.`);

if (notFoundIds.length > 0) {
    console.log(`\n⚠️ IDs not found (need verification): ${notFoundIds.join(', ')}`);
    // Let's search for similar IDs
    notFoundIds.forEach(id => {
        const similar = toolsData.filter(t => t.id && t.id.toLowerCase().includes(id.toLowerCase().substring(0, 4)));
        if (similar.length > 0) {
            console.log(`  -> Similar IDs for '${id}': ${similar.map(t => t.id + ' (' + t.name + ')').join(', ')}`);
        }
    });
}

// Rebuild HTML Pages
console.log('\n🔨 Rebuilding HTML pages...');
try {
    execSync('node build-pages.js', { stdio: 'inherit' });
    console.log('✅ HTML pages built successfully.');
} catch (e) {
    console.error('❌ Failed to build pages:', e.message);
}
