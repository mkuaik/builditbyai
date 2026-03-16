const fs = require('fs');
const filePath = 'c:/Users/CompuNet/Desktop/Projects/MyApps/DoItByAI/tools-data.js';
const content = fs.readFileSync(filePath, 'utf8');

const match = content.match(/const TOOLS_DATA = (\[[\s\S]*\]);/);
if (!match) {
    console.error('Could not find TOOLS_DATA array');
    process.exit(1);
}

let tools = JSON.parse(match[1]);
const idsToRemove = [
    'synthesia_ai',
    '11_labs',
    'fliki_ai',
    'murf_studio',
    'tome_present',
    'gamma_app',
    'dante_chatbot',
    'meshyai_v2',
    'canva_magic'
];

// Special handling for the second "grammarly" entry
let grammarlyCount = 0;
const finalTools = tools.filter(tool => {
    if (tool.id === 'grammarly') {
        grammarlyCount++;
        return grammarlyCount === 1; // Keep only the first one (which is Elite)
    }
    return !idsToRemove.includes(tool.id);
});

const updatedContent = `const TOOLS_DATA = ${JSON.stringify(finalTools, null, 2)};`;
fs.writeFileSync(filePath, updatedContent);

console.log(`Removed ${tools.length - finalTools.length} duplicate entries.`);
