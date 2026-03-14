const fs = require('fs');
const path = require('utf8');
const fs_extra = require('fs');

const toolsDataPath = 'c:/Users/CompuNet/Desktop/Projects/MyApps/DoItByAI/tools-data.js';
const toolsJsonPath = 'c:/Users/CompuNet/Desktop/Projects/MyApps/DoItByAI/data/tools.json';

function cleanup(filePath, isJs = false) {
    let content = fs_extra.readFileSync(filePath, 'utf8');
    
    let arrayStr = content;
    if (isJs) {
        const start = content.indexOf('[');
        const end = content.lastIndexOf(']') + 1;
        arrayStr = content.substring(start, end);
    }
    
    try {
        const tools = JSON.parse(arrayStr);
        tools.forEach(tool => {
            delete tool.lastUpdated;
        });
        
        const newArrayStr = JSON.stringify(tools, null, 2);
        if (isJs) {
            fs_extra.writeFileSync(filePath, `const TOOLS_DATA = ${newArrayStr};\n`, 'utf8');
        } else {
            fs_extra.writeFileSync(filePath, newArrayStr, 'utf8');
        }
        console.log(`Cleaned up ${filePath}`);
    } catch (e) {
        console.error(`Error processing ${filePath}:`, e);
    }
}

cleanup(toolsJsonPath);
cleanup(toolsDataPath, true);
