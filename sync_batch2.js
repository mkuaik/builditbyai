const fs = require('fs');
const path = require('path');

const dataFile = path.join(__dirname, 'tools-data.js');
let content = fs.readFileSync(dataFile, 'utf8');

const startIndex = content.indexOf('[');
const endIndex = content.lastIndexOf(']');

if (startIndex === -1 || endIndex === -1) {
    console.error("Could not find array in tools-data.js");
    process.exit(1);
}

const jsonString = content.substring(startIndex, endIndex + 1);
let toolsData;
try {
    toolsData = JSON.parse(jsonString);
} catch (e) {
    console.error("Failed to parse JSON array from tools-data.js:", e.message);
    process.exit(1);
}

const batch2 = [
    { id: 'topaz_labs', file: 'TOPAZ_LABS_MASTER_REVIEW.md' },
    { id: 'colossyan', file: 'COLOSSYAN_MASTER_REVIEW.md' },
    { id: 'creatify_ai', file: 'CREATIFY_AI_MASTER_REVIEW.md' },
    { id: 'fliki', file: 'FLIKI_MASTER_REVIEW.md' },
    { id: 'basedlabs', file: 'BASEDLABS_MASTER_REVIEW.md' },
    { id: 'lovo', file: 'LOVO_MASTER_REVIEW.md' },
    { id: 'podcastle', file: 'PODCASTLE_MASTER_REVIEW.md' },
    { id: 'repurposeio', file: 'REPURPOSE_IO_MASTER_REVIEW.md' },
    { id: 'steve_ai', file: 'STEVE_AI_MASTER_REVIEW.md' },
    { id: 'bhuman', file: 'BHUMAN_MASTER_REVIEW.md' }
];

let updatedCount = 0;

batch2.forEach(item => {
    const mdPath = path.join(__dirname, item.file);
    if (fs.existsSync(mdPath)) {
        const reviewText = fs.readFileSync(mdPath, 'utf-8');
        const toolIndex = toolsData.findIndex(t => t.id === item.id);
        
        if (toolIndex !== -1) {
            toolsData[toolIndex].fullReview = reviewText;
            updatedCount++;
            console.log(`✅ Updated ${toolsData[toolIndex].id}`);
        } else {
            console.log(`❌ Tool ID not found in database: ${item.id}`);
        }
    } else {
        console.log(`❌ MD file not found: ${item.file}`);
    }
});

if (updatedCount > 0) {
    const preContent = content.substring(0, startIndex);
    const postContent = content.substring(endIndex + 1);
    const newContent = preContent + JSON.stringify(toolsData, null, 4) + postContent;
    
    fs.writeFileSync(dataFile, newContent, 'utf-8');
    
    const jsonPath = path.join(__dirname, 'data', 'tools.json');
    if (fs.existsSync(jsonPath)) {
        fs.writeFileSync(jsonPath, JSON.stringify(toolsData, null, 4), 'utf-8');
        console.log(`✅ Updated data/tools.json`);
    }
    
    console.log(`\n🎉 Successfully injected ${updatedCount} reviews into the database.`);
} else {
    console.log('\n⚠️ No tools were updated.');
}
