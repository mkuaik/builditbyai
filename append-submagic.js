const fs = require('fs');
const path = require('path');

const submagicEntry = {
    "id": "submagic",
    "name": "Submagic",
    "logo": "./images/logos/submagic.png",
    "shortDesc": "إضافة ترويسات وترجمة احترافية للفيديوهات القصيرة (Reels & TikTok) بالذكاء الاصطناعي.",
    "category": "صوت وفيديو",
    "tags": [
      "فيديو قصير",
      "ريلز",
      "تيك توك",
      "ترجمة آلية"
    ],
    "price": "يبدأ من 40$ شهرياً",
    "affiliateLink": "https://submagic.co/?via=builditbyai26",
    "hasAffiliate": true,
    "type": "tool",
    "fullReview": "تعد ساب ماجيك (Submagic) الأداة الأقوى حالياً في صناعة المحتوى القصير. تقوم المنصة بتحليل الفيديو وتوليد ترجمة نصية (Captions) ملونة وديناميكية مع مئات الرموز التعبيرية التلقائية التي تزيد من تفاعل المشاهدين بنسبة كبيرة. توفر الأداة أيضاً ميزات إزالة فترات الصمت، إضافة انتقالات، ووضع أوصاف ذكية للفيديو. الخيار الأول للمشاهير وصناع المحتوى الراغبين في إنتاج فيديوهات بمستوى احترافي دون تضييع ساعات في المونتاج."
};

function appendToJS(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    // Remove last ]; 
    content = content.trim().replace(/\];\s*$/, '');
    // Add comma and new entry
    content += ',\n  ' + JSON.stringify(submagicEntry, null, 2) + '\n];\n';
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
}

function appendToJSON(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    // Remove last ]
    content = content.trim().replace(/\]\s*$/, '');
    // Add comma and new entry
    content += ',\n  ' + JSON.stringify(submagicEntry, null, 2) + '\n]\n';
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
}

appendToJS('tools-data.js');
appendToJSON('data/tools.json');
