const fs = require('fs');
const jsonPath = 'C:\\Users\\CompuNet\\Desktop\\Projects\\MyApps\\DoItByAI\\data\\tools.json';
const jsPath = 'C:\\Users\\CompuNet\\Desktop\\Projects\\MyApps\\DoItByAI\\tools-data.js';

function revertBeehiiv(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Previous ctaText was "جرب Beehiiv الآن مجاناً 🚀"
    // My script changed it to "ابدأ رحلتك مع Beehiiv مجاناً اليوم 🚀"
    
    content = content.replace("ابدأ رحلتك مع Beehiiv مجاناً اليوم 🚀", "جرب Beehiiv الآن مجاناً 🚀");
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Reverted Beehiiv in ' + filePath);
}

try {
    revertBeehiiv(jsonPath);
    revertBeehiiv(jsPath);
} catch (e) {
    console.error(e);
}
