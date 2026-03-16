const fs = require('fs');
const content = fs.readFileSync('c:/Users/CompuNet/Desktop/Projects/MyApps/DoItByAI/tools-data.js', 'utf8');

// Use a simple regex-based approach or eval if safe to get the data
// Since it's a JS file with "const TOOLS_DATA = [...]", we can extract the part between []
const match = content.match(/const TOOLS_DATA = (\[[\s\S]*\]);/);
if (!match) {
    console.error('Could not find TOOLS_DATA array');
    process.exit(1);
}

const tools = JSON.parse(match[1]);

const ids = {};
const names = {};
const links = {};
const duplicates = [];

tools.forEach((tool, index) => {
    // Check ID
    if (ids[tool.id]) {
        duplicates.push({ type: 'ID', value: tool.id, firstIndex: ids[tool.id], secondIndex: index, name: tool.name });
    } else {
        ids[tool.id] = index;
    }

    // Check Name
    const normName = tool.name.toLowerCase().trim();
    if (names[normName]) {
        duplicates.push({ type: 'Name', value: tool.name, firstIndex: names[normName], secondIndex: index, id: tool.id });
    } else {
        names[normName] = index;
    }

    // Check Affiliate Link (excluding those that might be the same home domain if generic)
    const normLink = tool.affiliateLink?.split('?')[0].replace(/\/$/, '').toLowerCase();
    if (normLink && normLink !== 'https://' && normLink !== '') {
        if (links[normLink]) {
            duplicates.push({ type: 'Link', value: normLink, firstIndex: links[normLink], secondIndex: index, name: tool.name, id: tool.id });
        } else {
            links[normLink] = index;
        }
    }
});

console.log(JSON.stringify(duplicates, null, 2));
