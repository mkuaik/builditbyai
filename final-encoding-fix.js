const fs = require('fs');

const jsonPath = 'C:\\Users\\CompuNet\\Desktop\\Projects\\MyApps\\DoItByAI\\data\\tools.json';
const jsPath = 'C:\\Users\\CompuNet\\Desktop\\Projects\\MyApps\\DoItByAI\\tools-data.js';

const beehiivMd = fs.readFileSync('C:\\Users\\CompuNet\\Desktop\\Projects\\MyApps\\DoItByAI\\BEEHIIV_MASTER_REVIEW.md', 'utf8');
const taskadeMd = fs.readFileSync('C:\\Users\\CompuNet\\Desktop\\Projects\\MyApps\\DoItByAI\\TASKADE_MASTER_REVIEW.md', 'utf8');

const beehiivObj = {
  "id": "beehiiv",
  "name": "Beehiiv",
  "logo": "./images/logos/beehiiv.png",
  "shortDesc": "منصة النشرات البريدية الحديثة والنمو السريع.",
  "category": "كتابة وتسويق",
  "tags": ["نشرات بريدية", "مجاني", "نمو", "محتوى"],
  "price": "مجاني / Scale بـ 49$ / Max بـ 109$ شهرياً",
  "affiliateLink": "https://www.beehiiv.com?via=builditbyai26",
  "hasAffiliate": true,
  "type": "website",
  "ctaText": "جرب Beehiiv الآن مجاناً 🚀",
  "fullReview": beehiivMd
};

const taskadeObj = {
  "id": "taskade",
  "name": "Taskade",
  "logo": "./images/logos/taskade.png",
  "shortDesc": "مساحة عمل تعاونية تدار بوكلاء الذكاء الاصطناعي.",
  "category": "إنتاجية وأعمال",
  "tags": ["مجاني", "إدارة مشاريع", "تخطيط", "تنظيم"],
  "price": "مجاني / يبدأ من 15$ شهرياً",
  "affiliateLink": "https://www.taskade.com/?via=builditbyai26",
  "hasAffiliate": true,
  "type": "app",
  "ctaText": "امتلك مستقبل الإنتاجية مع Taskade مجاناً 🚀",
  "fullReview": taskadeMd
};

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

    const b = getRange('beehiiv');
    const t = getRange('taskade');

    if (!b || !t) throw new Error('Could not find tools in ' + filePath);

    // Reconstruct the file by replacing the corrupted sections
    // Order matters if they overlap, but these are separate objects in an array.
    // Replace higher index first to preserve lower indices.
    
    const second = t.start > b.start ? t : b;
    const first = t.start > b.start ? b : t;
    const secondObj = t.start > b.start ? taskadeObj : beehiivObj;
    const firstObj = t.start > b.start ? beehiivObj : taskadeObj;

    const part1 = content.substring(0, first.start);
    const part2 = content.substring(first.end, second.start);
    const part3 = content.substring(second.end);

    const newContent = part1 + JSON.stringify(firstObj, null, 2) + part2 + JSON.stringify(secondObj, null, 2) + part3;
    
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log('Successfully fixed: ' + filePath);
}

try {
    fixFile(jsonPath);
    fixFile(jsPath);
} catch (e) {
    console.error(e);
}
