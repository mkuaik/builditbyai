const fs = require('fs');
const path = require('path');

const dataFile = path.join(__dirname, 'tools-data.js');
let content = fs.readFileSync(dataFile, 'utf8');

const startIndex = content.indexOf('[');
const endIndex = content.lastIndexOf(']');
const jsonString = content.substring(startIndex, endIndex + 1);
const toolsData = JSON.parse(jsonString);

const targetCategory = 'تصميم وجرافيك';
const targetTags = ['تصميم', 'صور', 'صورة', 'ديزاين', 'جرافيك', 'تصميم جرافيك'];

let batch3 = toolsData.filter(t => 
    (!t.fullReview || t.fullReview.length < 1000) && 
    (
        t.category === targetCategory || 
        (t.tags && t.tags.some(tag => targetTags.includes(tag)))
    )
).slice(0, 10);

const exportData = batch3.map(t => ({
    id: t.id,
    name: t.name,
    category: t.category,
    tags: t.tags
}));

fs.writeFileSync(path.join(__dirname, 'batch3.json'), JSON.stringify(exportData, null, 4));
console.log(`Successfully extracted ${exportData.length} tools for Batch 3.`);
exportData.forEach((t, i) => console.log(`${i+1}. ${t.name} (${t.id})`));
