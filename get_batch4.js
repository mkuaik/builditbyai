const fs = require('fs');
const path = require('path');

const dataFile = path.join(__dirname, 'tools-data.js');
let content = fs.readFileSync(dataFile, 'utf8');

const startIndex = content.indexOf('[');
const endIndex = content.lastIndexOf(']');
const jsonString = content.substring(startIndex, endIndex + 1);
const toolsData = JSON.parse(jsonString);

let batch4 = toolsData.filter(t => !t.fullReview || t.fullReview.length < 1000);

// Prioritize Coding
let prioritized = batch4.filter(t => t.category && (t.category.includes('برمجة') || t.category.includes('مواقع')));
let others = batch4.filter(t => !prioritized.includes(t));

batch4 = [...prioritized, ...others].slice(0, 10);

const exportData = batch4.map(t => ({
    id: t.id,
    name: t.name,
    category: t.category,
    tags: t.tags
}));

fs.writeFileSync(path.join(__dirname, 'batch4.json'), JSON.stringify(exportData, null, 4));
console.log(`Successfully extracted ${exportData.length} tools for Batch 4.`);
exportData.forEach((t, i) => console.log(`${i+1}. ${t.name} (${t.id}) - [${t.category}]`));
