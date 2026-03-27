const fs = require('fs');
const path = require('path');

const dataFile = path.join(__dirname, 'tools-data.js');
let content = fs.readFileSync(dataFile, 'utf8');

const startIndex = content.indexOf('[');
const endIndex = content.lastIndexOf(']');
const jsonString = content.substring(startIndex, endIndex + 1);
const toolsData = JSON.parse(jsonString);

// Filter tools without elite reviews (fullReview < 1000 chars = short/basic)
let notReviewed = toolsData.filter(t => !t.fullReview || t.fullReview.length < 1000);

// Prioritize Productivity & Business category
let productivity = notReviewed.filter(t => t.category && (
    t.category.includes('إنتاجية') ||
    t.category.includes('أعمال') ||
    t.category.includes('تعاون') ||
    t.category.includes('إدارة')
));
let others = notReviewed.filter(t => !productivity.includes(t));

let batch5 = [...productivity, ...others].slice(0, 10);

const exportData = batch5.map(t => ({
    id: t.id,
    name: t.name,
    category: t.category,
    shortDesc: t.shortDesc,
    price: t.price,
    tags: t.tags
}));

fs.writeFileSync(path.join(__dirname, 'batch5.json'), JSON.stringify(exportData, null, 4));
console.log(`Successfully extracted ${exportData.length} tools for Batch 5.`);
console.log('\n--- Batch 5 Tools (Productivity & Business) ---');
exportData.forEach((t, i) => console.log(`${i+1}. ${t.name} (${t.id}) - [${t.category}]`));
