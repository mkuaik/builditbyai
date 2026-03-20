const fs = require('fs');
const path = require('path');

const jsonPath = 'C:\\Users\\CompuNet\\Desktop\\Projects\\MyApps\\DoItByAI\\data\\tools.json';
const jsPath = 'C:\\Users\\CompuNet\\Desktop\\Projects\\MyApps\\DoItByAI\\tools-data.js';

const beehiivMd = fs.readFileSync('C:\\Users\\CompuNet\\Desktop\\Projects\\MyApps\\DoItByAI\\BEEHIIV_MASTER_REVIEW.md', 'utf8');
const taskadeMd = fs.readFileSync('C:\\Users\\CompuNet\\Desktop\\Projects\\MyApps\\DoItByAI\\TASKADE_MASTER_REVIEW.md', 'utf8');

function updateToolData(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    function getRange(id) {
        const marker = `"id": "${id}"`;
        const startIdx = content.lastIndexOf('{', content.indexOf(marker));
        if (startIdx === -1) return null;
        let count = 0;
        for (let i = startIdx; i < content.length; i++) {
            if (content[i] === '{') count++;
            if (content[i] === '}') count--;
            if (count === 0) return { start: startIdx, end: i + 1 };
        }
        return null;
    }

    const bRange = getRange('beehiiv');
    const tRange = getRange('taskade');

    if (bRange) {
        let bObjStr = content.substring(bRange.start, bRange.end);
        // We need to replace the fullReview field accurately
        // Simple string replacement if we trust the structure
        const regex = /"fullReview":\s*"[\s\S]*?"(?=,\n|\n\s*})/;
        bObjStr = bObjStr.replace(regex, `"fullReview": ${JSON.stringify(beehiivMd)}`);
        
        // Also update the name/title if necessary, but the H1 is inside fullReview
        
        const before = content.substring(0, bRange.start);
        const after = content.substring(bRange.end);
        content = before + bObjStr + after;
    }

    // Re-calculate ranges because indices shifted
    const tRangeNew = getRange('taskade');
    if (tRangeNew) {
        let tObjStr = content.substring(tRangeNew.start, tRangeNew.end);
        const regex = /"fullReview":\s*"[\s\S]*?"(?=,\n|\n\s*})/;
        tObjStr = tObjStr.replace(regex, `"fullReview": ${JSON.stringify(taskadeMd)}`);
        
        const before = content.substring(0, tRangeNew.start);
        const after = content.substring(tRangeNew.end);
        content = before + tObjStr + after;
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated ' + filePath);
}

try {
    updateToolData(jsonPath);
    updateToolData(jsPath);
} catch (e) {
    console.error(e);
}
