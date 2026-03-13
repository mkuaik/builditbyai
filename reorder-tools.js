const fs = require('fs');
const path = require('path');

const dataFile = path.join(process.cwd(), 'data', 'tools.json');
const jsFile = path.join(process.cwd(), 'tools-data.js');

function reorder(tools) {
    const priorityIds = ['topaz_labs', 'beehiiv', 'taskade'];
    const directPendingIds = ['writesonic', 'koala_ai', 'koala']; // including koala as it might be used instead of koala_ai
    const mediatorPendingIds = [
        'leonardoai', 'semrush', 'invideo', 'elevenlabs', 'surferseo', 
        'notion', 'copyai', 'pictory', 'framer'
    ];

    // Separate into buckets
    const priorityGroup = [];
    const directGroup = [];
    const mediatorGroup = [];
    const others = [];

    // Map tools for easy lookup but maintain uniqueness and clean featured flag
    const toolMap = new Map();
    tools.forEach(t => {
        delete t.featured; // Ensure featured is removed
        toolMap.set(t.id, t);
    });

    // Fill buckets
    priorityIds.forEach(id => {
        if (toolMap.has(id)) {
            const tool = toolMap.get(id);
            priorityGroup.push(tool);
            toolMap.delete(id);
        }
    });

    directPendingIds.forEach(id => {
        if (toolMap.has(id)) {
            directGroup.push(toolMap.get(id));
            toolMap.delete(id);
        }
    });

    mediatorPendingIds.forEach(id => {
        if (toolMap.has(id)) {
            mediatorGroup.push(toolMap.get(id));
            toolMap.delete(id);
        }
    });

    // Everything else
    toolMap.forEach(tool => others.push(tool));

    return [...priorityGroup, ...directGroup, ...mediatorGroup, ...others];
}

// Update tools.json
const toolsJson = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
const newToolsJson = reorder(toolsJson);
fs.writeFileSync(dataFile, JSON.stringify(newToolsJson, null, 2), 'utf8');
console.log('Updated tools.json');

// Update tools-data.js
const toolsJsContent = fs.readFileSync(jsFile, 'utf8');
// Extract the array part. Assuming it starts with const TOOLS_DATA = [ and ends with ];
const startMatch = toolsJsContent.indexOf('[');
const endMatch = toolsJsContent.lastIndexOf(']');
if (startMatch !== -1 && endMatch !== -1) {
    const arrayPart = toolsJsContent.substring(startMatch, endMatch + 1);
    const toolsJs = JSON.parse(arrayPart);
    const newToolsJs = reorder(toolsJs);
    const newJsContent = `const TOOLS_DATA = ${JSON.stringify(newToolsJs, null, 2)};`;
    fs.writeFileSync(jsFile, newJsContent, 'utf8');
    console.log('Updated tools-data.js');
}
