const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'tools-data.js');
let content = fs.readFileSync(filePath, 'utf8');

// Use a simple regex to add lastUpdated to each object in the array
// We look for "fullReview": "..." and add a comma and lastUpdated after it if it's not already there.
// Or we can just parse the array and stringify it back.

// Safer way: Parse the array
const arrayStart = content.indexOf('[');
const arrayEnd = content.lastIndexOf(']') + 1;
const arrayStr = content.substring(arrayStart, arrayEnd);

try {
    const tools = JSON.parse(arrayStr);
    tools.forEach(tool => {
        tool.lastUpdated = "15 مارس 2026";
    });
    
    const newArrayStr = JSON.stringify(tools, null, 2);
    const newContent = `const TOOLS_DATA = ${newArrayStr};\n`;
    
    fs.writeFileSync(filePath, newContent, 'utf8');
    
    // Also update tools.json
    const jsonPath = path.join(__dirname, 'data', 'tools.json');
    fs.writeFileSync(jsonPath, newArrayStr, 'utf8');
    
    console.log('Successfully added lastUpdated to ' + tools.length + ' tools.');
} catch (e) {
    console.error('Failed to parse tools-data.js. Falling back to regex.');
    // Fallback regex approach if JSON.parse fails (it might if there are trailing commas or complex JS)
    // Actually, I'll just use a more robust regex if needed.
    console.error(e);
}
