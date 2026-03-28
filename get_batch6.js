const fs = require('fs');
const path = require('path');

const dataFile = path.join(__dirname, 'tools-data.js');
let content = fs.readFileSync(dataFile, 'utf8');

const startIndex = content.indexOf('[');
const endIndex = content.lastIndexOf(']');
const jsonString = content.substring(startIndex, endIndex + 1);
const toolsData = JSON.parse(jsonString);

// Filter tools without elite reviews (fullReview < 1000 chars)
let notReviewed = toolsData.filter(t => !t.fullReview || t.fullReview.length < 1000);

// Group by category for prioritization
const categoryPriority = [
    'تسويق', 'تقنية', 'صوت', 'فيديو', 'كتابة', 'بحث', 'دعم عملاء', 'تجارة'
];

// Pick the first 10 - prioritize well-known tools (longer existing descriptions = more data)
let sorted = notReviewed.sort((a, b) => {
    const lenA = (a.shortDesc || '').length + (a.fullReview || '').length;
    const lenB = (b.shortDesc || '').length + (b.fullReview || '').length;
    return lenB - lenA;
});

let batch6 = sorted.slice(0, 10);

const exportData = batch6.map(t => ({
    id: t.id,
    name: t.name,
    category: t.category,
    shortDesc: t.shortDesc,
    price: t.price,
    tags: t.tags
}));

fs.writeFileSync(path.join(__dirname, 'batch6.json'), JSON.stringify(exportData, null, 4));
console.log(`Successfully extracted ${exportData.length} tools for Batch 6.`);
console.log('\n--- Batch 6 Tools ---');
exportData.forEach((t, i) => console.log(`${i+1}. ${t.name} (${t.id}) - [${t.category}]`));
