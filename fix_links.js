const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'tools-data.js');
let content = fs.readFileSync(filePath, 'utf8');

// Regex to find links ending with /affiliate?ref=builditbyai and replace /affiliate with /
const updatedContent = content.replace(/("affiliateLink":\s*"https?:\/\/[^/"]+)\/affiliate(\?ref=builditbyai")/g, '$1/$2');

fs.writeFileSync(filePath, updatedContent, 'utf8');
console.log('✅ Updated affiliate links in tools-data.js');

// Sync to data/tools.json
const jsonMatch = updatedContent.match(/const TOOLS_DATA = (\[[\s\S]*\]);/);
if (jsonMatch) {
    fs.writeFileSync(path.join(__dirname, 'data', 'tools.json'), jsonMatch[1], 'utf8');
    console.log('✅ Synced to data/tools.json');
}
