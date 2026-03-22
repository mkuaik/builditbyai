const fs = require('fs');
const path = require('path');

const dataFile = path.join(__dirname, 'tools-data.js');
let content = fs.readFileSync(dataFile, 'utf8');

const startIndex = content.indexOf('[');
const endIndex = content.lastIndexOf(']');
const jsonString = content.substring(startIndex, endIndex + 1);
const toolsData = JSON.parse(jsonString);

// Filter for Video and Audio tools that don't have a long fullReview (i.e. not Master Reviewed yet)
const batch2Candidates = toolsData.filter(t => 
    (t.category.includes('فيديو') || t.category.includes('صوت') || t.tags.includes('فيديو') || t.tags.includes('صوت')) && 
    (!t.fullReview || t.fullReview.length < 500)
);

// Select the first 10
const batch2 = batch2Candidates.slice(0, 10);

fs.writeFileSync(path.join(__dirname, 'batch2.json'), JSON.stringify(batch2, null, 2), 'utf-8');

console.log(`Found ${batch2Candidates.length} eligible tools.`);
console.log(`Selected 10 tools for Batch 2:`);
batch2.forEach((t, i) => console.log(`${i+1}. ${t.name} (${t.id}) - Category: ${t.category}`));
