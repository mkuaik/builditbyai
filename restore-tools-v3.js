const fs = require('fs');
const path = require('path');

const jsonPath = 'C:\\Users\\CompuNet\\Desktop\\Projects\\MyApps\\DoItByAI\\data\\tools.json';
const jsPath = 'C:\\Users\\CompuNet\\Desktop\\Projects\\MyApps\\DoItByAI\\tools-data.js';

const beehiivMd = fs.readFileSync('C:\\Users\\CompuNet\\Desktop\\Projects\\MyApps\\DoItByAI\\BEEHIIV_MASTER_REVIEW.md', 'utf8');
const taskadeMd = fs.readFileSync('C:\\Users\\CompuNet\\Desktop\\Projects\\MyApps\\DoItByAI\\TASKADE_MASTER_REVIEW.md', 'utf8');

const beehiivObj = {
  "id": "beehiiv",
  "name": "Beehiiv",
  "logo": "./images/logos/beehiiv.png",
  "shortDesc": "منصة النشارات البريدية الحديثة والنمو السريع.",
  "category": "كتابة وتسويق",
  "tags": ["نشرات بريدية", "مجاني", "نمو", "محتوى"],
  "price": "مجاني / Scale بـ 49$ / Max بـ 109$ شهرياً",
  "affiliateLink": "https://www.beehiiv.com?via=builditbyai26",
  "hasAffiliate": true,
  "type": "website",
  "ctaText": "ابدأ رحلتك مع Beehiiv مجاناً اليوم 🚀",
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

function fixFile(filePath, isJson) {
    const content = fs.readFileSync(filePath, 'utf8');
    
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

    let newContent = content;
    // Replace in reverse order of appearance to avoid index shifting problems if they overlap somehow (they shouldn't)
    // Actually, taskade is after beehiiv.
    
    const second = t.start > b.start ? t : b;
    const first = t.start > b.start ? b : t;
    const secondObj = t.start > b.start ? taskadeObj : beehiivObj;
    const firstObj = t.start > b.start ? beehiivObj : taskadeObj;

    const part3 = newContent.substring(second.end);
    const middle = newContent.substring(first.end, second.start);
    const part1 = newContent.substring(0, first.start);

    newContent = part1 + JSON.stringify(firstObj, null, 2) + middle + JSON.stringify(secondObj, null, 2) + part3;
    
    // If it's a JS file, we might need to preserve the "const TOOLS_DATA =" part if it was lost, 
    // but my getRange only replaces the objects themselves.
    
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log('Fixed ' + filePath);
}

try {
    fixFile(jsonPath, true);
    fixFile(jsPath, false);
} catch (e) {
    console.error(e);
}
