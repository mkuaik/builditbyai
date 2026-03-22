const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const reviews = [
    { id: 'leonardoai', file: 'LEONARDO_AI_MASTER_REVIEW.md' },
    { id: 'framer', file: 'FRAMER_MASTER_REVIEW.md' },
    { id: 'canva', file: 'CANVA_MASTER_REVIEW.md' },
    { id: 'looka', file: 'LOOKA_MASTER_REVIEW.md' },
    { id: 'nightcafe', file: 'NIGHTCAFE_MASTER_REVIEW.md' },
    { id: 'adcreative', file: 'ADCREATIVE_MASTER_REVIEW.md' },
    { id: 'kittl', file: 'KITTL_MASTER_REVIEW.md' },
    { id: 'tripo', file: 'TRIPO_MASTER_REVIEW.md' },
    { id: 'gamma', file: 'GAMMA_MASTER_REVIEW.md' },
    { id: 'beautiful_ai', file: 'BEAUTIFUL_AI_MASTER_REVIEW.md' }
];

const toolsDataPath = path.join(__dirname, 'tools-data.js');
let toolsDataContent = fs.readFileSync(toolsDataPath, 'utf8');

const jsonStartIndex = toolsDataContent.indexOf('[');
const jsonEndIndex = toolsDataContent.lastIndexOf(']');
const toolsJsonString = toolsDataContent.substring(jsonStartIndex, jsonEndIndex + 1);
let toolsData = JSON.parse(toolsJsonString);

let injectedCount = 0;

reviews.forEach(review => {
    const mdPath = path.join(__dirname, review.file);
    if (fs.existsSync(mdPath)) {
        const fullReviewContent = fs.readFileSync(mdPath, 'utf8');
        
        const toolIndex = toolsData.findIndex(t => t.id === review.id);
        if (toolIndex !== -1) {
            toolsData[toolIndex].fullReview = fullReviewContent;
            injectedCount++;
            console.log(`[Success] Injected review for: ${review.id}`);
        } else {
            console.log(`[Warning] Tool ID not found in tools-data.js: ${review.id}`);
        }
    } else {
        console.log(`[Error] Markdown file not found: ${review.file}`);
    }
});

// Update tools-data.js
const updatedJsonString = JSON.stringify(toolsData, null, 4);
const updatedFileContent = toolsDataContent.substring(0, jsonStartIndex) + updatedJsonString + toolsDataContent.substring(jsonEndIndex + 1);
fs.writeFileSync(toolsDataPath, updatedFileContent, 'utf8');

// Also update data/tools.json for backward compatibility
const toolsJsonPath = path.join(__dirname, 'data', 'tools.json');
if (fs.existsSync(toolsJsonPath)) {
    fs.writeFileSync(toolsJsonPath, updatedJsonString, 'utf8');
    console.log('Updated data/tools.json');
}

console.log(`\nSuccessfully injected ${injectedCount} master reviews.`);

// Rebuild HTML Pages
console.log('\nRebuilding HTML pages...');
try {
    execSync('node build-pages.js', { stdio: 'inherit' });
    console.log('HTML pages built successfully.');
} catch (e) {
    console.error('Failed to build pages:', e.message);
}

// Git Push
console.log('\nCommitting and pushing to GitHub...');
try {
    execSync('git add .', { stdio: 'inherit' });
    execSync('git commit -m "Inject Batch 3 Master Reviews (Images & Design)"', { stdio: 'inherit' });
    console.log('Pushing to remote...');
    // We will do the push separated or asynchronous in next step to be safe
    // execSync('git push origin main', { stdio: 'inherit' });
} catch (e) {
    console.error('Failed during git operations. It may already be committed or there is nothing to commit.', e.message);
}
