const fs = require('fs');
const path = require('path');

const dataFile = path.join(__dirname, 'tools-data.js');
let content = fs.readFileSync(dataFile, 'utf8');

const startIndex = content.indexOf('[');
const endIndex = content.lastIndexOf(']');

const jsonString = content.substring(startIndex, endIndex + 1);
let toolsData = JSON.parse(jsonString);

const mdPath = path.join(__dirname, 'KOALA_MASTER_REVIEW.md');
if (fs.existsSync(mdPath)) {
    const reviewText = fs.readFileSync(mdPath, 'utf-8');
    const toolIndex = toolsData.findIndex(t => t.id === 'koala');
    
    if (toolIndex !== -1) {
        toolsData[toolIndex].fullReview = reviewText;
        console.log(`✅ Updated koala`);
        
        const preContent = content.substring(0, startIndex);
        const postContent = content.substring(endIndex + 1);
        const newContent = preContent + JSON.stringify(toolsData, null, 4) + postContent;
        
        fs.writeFileSync(dataFile, newContent, 'utf-8');
        fs.writeFileSync(path.join(__dirname, 'data', 'tools.json'), JSON.stringify(toolsData, null, 4), 'utf-8');
    } else {
        console.log(`❌ Tool ID 'koala' not found`);
    }
}
