const fs = require('fs');

let jsSource = fs.readFileSync('tools-data.js', 'utf8');
jsSource = jsSource.replace('const TOOLS_DATA', 'var TOOLS_DATA');

try {
    eval(jsSource);
} catch(e) {
    console.error("Could not parse JS file:", e);
    process.exit(1);
}

const idSet = new Map();
const nameSet = new Map();
const duplicates = [];

TOOLS_DATA.forEach(tool => {
    // Check ID
    if (idSet.has(tool.id)) {
        duplicates.push({ type: 'Duplicate ID', value: tool.id, name: tool.name });
    } else {
        idSet.set(tool.id, tool.name);
    }
    
    // Check Name (case insensitive)
    const normalizedName = tool.name.toLowerCase().trim();
    if (nameSet.has(normalizedName)) {
        duplicates.push({ type: 'Duplicate Name', value: tool.name, id: tool.id });
    } else {
        nameSet.set(normalizedName, tool.id);
    }
});

if (duplicates.length > 0) {
    console.log("Found duplicates:", duplicates);
} else {
    console.log(`checked ${TOOLS_DATA.length} tools. No duplicates found!`);
}
