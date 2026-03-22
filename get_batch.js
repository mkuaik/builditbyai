const fs = require('fs');

let jsSource = fs.readFileSync('tools-data.js', 'utf8');
jsSource = jsSource.replace('const TOOLS_DATA', 'var TOOLS_DATA');

try {
    eval(jsSource);
} catch(e) {
    console.error("Could not parse JS file:", e);
    process.exit(1);
}

const completedIDs = new Set(['beehiiv', 'taskade', 'rytr', 'pictory', 'submagic']);
const targetCategories = ['كتابة ومحتوى', 'كتابة وتسويق'];

const batch = TOOLS_DATA.filter(tool => 
    targetCategories.includes(tool.category) && 
    !completedIDs.has(tool.id)
).slice(0, 10);

console.log(`Found ${batch.length} tools for the first batch:`);
batch.forEach((t, i) => console.log(`${i+1}. ${t.name} (ID: ${t.id}) - ${t.shortDesc}`));

// Export this batch to a temp JSON file for easy processing
fs.writeFileSync('batch1.json', JSON.stringify(batch, null, 2));
