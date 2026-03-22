const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const reviews = [
    { id: 'systeme_io', file: 'SYSTEME_IO_MASTER_REVIEW.md' },
    { id: 'codeium', file: 'CODEIUM_MASTER_REVIEW.md' },
    { id: 'mixo', file: 'MIXO_MASTER_REVIEW.md' },
    { id: '10web', file: '10WEB_MASTER_REVIEW.md' },
    { id: 'cursor', file: 'CURSOR_MASTER_REVIEW.md' },
    { id: 'v0', file: 'V0_MASTER_REVIEW.md' },
    { id: 'copilot', file: 'COPILOT_MASTER_REVIEW.md' },
    { id: 'tavily', file: 'TAVILY_MASTER_REVIEW.md' },
    { id: 'phind', file: 'PHIND_MASTER_REVIEW.md' },
    { id: 'blackbox', file: 'BLACKBOX_AI_MASTER_REVIEW.md' }
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
