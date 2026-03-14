const fs = require('fs');
const content = fs.readFileSync('tools-data.js', 'utf8');
const jsonMatch = content.match(/const TOOLS_DATA = (\[[\s\S]*\]);/);
if (!jsonMatch) {
    console.error('Could not find TOOLS_DATA');
    process.exit(1);
}

const TOOLS_DATA = eval(jsonMatch[1]);
const report = TOOLS_DATA.map(t => {
    return {
        id: t.id,
        name: t.name,
        reviewLength: t.fullReview ? t.fullReview.length : 0,
        needsImprovement: !t.fullReview || t.fullReview.length < 250
    };
});

const shortReviews = report.filter(r => r.needsImprovement);
console.log(JSON.stringify(shortReviews, null, 2));
console.log('Total tools:', TOOLS_DATA.length);
console.log('Short reviews count:', shortReviews.length);
