const fs = require('fs');

const jsonPath = 'C:\\Users\\CompuNet\\Desktop\\Projects\\MyApps\\DoItByAI\\data\\tools.json';
const jsPath = 'C:\\Users\\CompuNet\\Desktop\\Projects\\MyApps\\DoItByAI\\tools-data.js';

const rytrMd = fs.readFileSync('C:\\Users\\CompuNet\\Desktop\\Projects\\MyApps\\DoItByAI\\RYTR_MASTER_REVIEW.md', 'utf8');
const pictoryMd = fs.readFileSync('C:\\Users\\CompuNet\\Desktop\\Projects\\MyApps\\DoItByAI\\PICTORY_MASTER_REVIEW.md', 'utf8');
const submagicMd = fs.readFileSync('C:\\Users\\CompuNet\\Desktop\\Projects\\MyApps\\DoItByAI\\SUBMAGIC_MASTER_REVIEW.md', 'utf8');

const toolsToUpdate = [
    { id: 'rytr', content: rytrMd, name: 'Rytr', cta: 'انطلق الآن ووفر وقتك مع Rytr 🚀' },
    { id: 'pictory', content: pictoryMd, name: 'Pictory', cta: 'انقل محتواك لمستوى آخر مع Pictory 🚀' },
    { id: 'submagic', content: submagicMd, name: 'Submagic', cta: 'ابدأ اليوم واصنع فيديوهاتك الفيروسية مع Submagic 🚀' }
];

function fixFile(filePath) {
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

    // Sort tools to update by their position in file (descending) to avoid index shifts
    let positions = toolsToUpdate.map(t => ({ ...t, range: getRange(t.id) }))
                                .filter(t => t.range !== null)
                                .sort((a, b) => b.range.start - a.range.start);

    for (let tool of positions) {
        let objStr = content.substring(tool.range.start, tool.range.end);
        
        // Update fullReview
        const reviewRegex = /"fullReview":\s*"[\s\S]*?"(?=,\n|\n\s*})/;
        objStr = objStr.replace(reviewRegex, `"fullReview": ${JSON.stringify(tool.content)}`);
        
        // Update ctaText
        const ctaRegex = /"ctaText":\s*"[\s\S]*?"(?=,\n|\n\s*})/;
        objStr = objStr.replace(ctaRegex, `"ctaText": ${JSON.stringify(tool.cta)}`);
        
        const before = content.substring(0, tool.range.start);
        const after = content.substring(tool.range.end);
        content = before + objStr + after;
    }
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Successfully updated: ' + filePath);
}

try {
    fixFile(jsonPath);
    fixFile(jsPath);
} catch (e) {
    console.error(e);
}
