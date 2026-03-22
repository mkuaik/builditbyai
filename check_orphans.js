const fs = require('fs');

let jsSource = fs.readFileSync('tools-data.js', 'utf8');
jsSource = jsSource.replace('const TOOLS_DATA', 'var TOOLS_DATA');

try {
    eval(jsSource);
} catch(e) {
    console.error("Could not parse JS file:", e);
    process.exit(1);
}

const idSet = new Set(TOOLS_DATA.map(t => t.id));

const htmlFiles = fs.readdirSync('tools').filter(f => f.endsWith('.html'));

const orphanFiles = [];
htmlFiles.forEach(file => {
    const id = file.replace('.html', '');
    if (!idSet.has(id)) {
        orphanFiles.push(file);
    }
});

console.log(`Found ${orphanFiles.length} orphan HTML files:`);
console.log(orphanFiles.join(', '));
