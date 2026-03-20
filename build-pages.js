const fs = require('fs');
const path = require('path');

console.log('Starting page generation...');

// Read the data
const toolsDataRaw = fs.readFileSync(path.join(__dirname, 'data', 'tools.json'), 'utf8');
const toolsData = JSON.parse(toolsDataRaw);
const outDir = path.join(__dirname, 'tools');

// Create tools directory if it doesn't exist
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir);
}

// Simple Markdown to HTML formatter
function formatText(text) {
  if (!text) return '';
  
  // 1. Filter out metadata and editor notes
  let cleanText = text
    .replace(/^> \*\*وصف السيو (.*?)\r?\n/gm, '')
    .replace(/^> \*\*ملاحظة للمحرر (.*?)\r?\n/gms, '')
    .replace(/^---$/gm, '<hr style="border:0;border-top:1px solid var(--border);margin:30px 0;">')
    .trim();

  // 2. Links [text](url)
  cleanText = cleanText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:var(--accent);text-decoration:none;border-bottom:1px dashed var(--accent);font-weight:600;">$1</a>');

  // 3. Alerts (Better Regex)
  cleanText = cleanText.replace(/^> \[!(IMPORTANT|WARNING|CAUTION|TIP|NOTE)\]\r?\n> (.*?)$/gm, (match, type, content) => {
    const colors = { IMPORTANT: '#f97316', WARNING: '#ef4444', CAUTION: '#b91c1c', TIP: '#10b981', NOTE: '#3b82f6' };
    const icon = type === 'TIP' ? '💡' : type === 'NOTE' ? 'ℹ️' : '⚠️';
    return `<div class="alert-block" style="padding:16px;background:rgba(255,255,255,0.03);border-right:4px solid ${colors[type]};border-radius:var(--radius-md);margin:20px 0;">
      <strong style="color:${colors[type]};display:block;margin-bottom:8px;">${icon} ${type}</strong>
      ${content}
    </div>`;
  });

  // 4. Tables (Enhanced Multi-line Regex)
  const tableRegex = /^\|(.+)\|\r?\n\|([ :\|\-]+)\|\r?\n((?:\|.+\|\r?\n?)+)/gm;
  cleanText = cleanText.replace(tableRegex, (match, header, separator, rows) => {
    const headers = header.split('|').map(h => h.trim()).filter(h => h).map(h => `<th style="padding:12px;text-align:right;border-bottom:2px solid var(--border);color:var(--accent);">${h}</th>`).join('');
    const bodyRows = rows.split(/\r?\n/).filter(r => r.trim()).map(r => {
      const cells = r.split('|').map(c => c.trim()).filter(c => c).map(c => `<td style="padding:12px;border-bottom:1px solid var(--border-light);">${c}</td>`).join('');
      return `<tr>${cells}</tr>`;
    }).join('');
    
    return `<div class="table-container" style="overflow-x:auto;margin:25px 0;border-radius:var(--radius-md);border:1px solid var(--border);background:var(--bg-secondary);box-shadow:var(--shadow-sm);">
      <table style="width:100%;border-collapse:collapse;font-size:0.95rem;">
        <thead style="background:rgba(255,255,255,0.02);"><tr>${headers}</tr></thead>
        <tbody>${bodyRows}</tbody>
      </table>
    </div>`;
  });

  // 5. Blockquotes (Normal)
  cleanText = cleanText.replace(/^> (?!\[!)(.*?)$/gm, '<blockquote style="border-right:4px solid var(--accent);padding:10px 20px;margin:20px 0;background:var(--bg-secondary);font-style:italic;">$1</blockquote>');

  // 6. Headers & Bold (Standardized H1-H3)
  let html = cleanText
    .replace(/^### (.*?)$/gm, '<h3 style="font-size:1.1rem;font-weight:700;color:var(--text-primary);margin-top:20px;margin-bottom:10px;">$1</h3>')
    .replace(/^## (.*?)$/gm, '<h2 style="font-size:1.35rem;font-weight:700;color:var(--text-primary);margin-top:25px;margin-bottom:15px;border-right:4px solid var(--accent);padding-right:12px;">$1</h2>')
    .replace(/^# (.*?)$/gm, '<h1 style="font-size:1.6rem;font-weight:900;color:var(--text-primary);margin-top:20px;margin-bottom:15px;line-height:1.2;">$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // 7. Lists
  html = html.replace(/^\* (.*?)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*?<\/li>)+/gs, (match) => `<ul style="margin: 15px 0; padding-right: 25px; list-style-type: square;">${match}</ul>`);

  // 8. Paragraphs (Final Wrap)
  const blocks = html.split(/\r?\n\r?\n/);
  html = blocks.map(block => {
    if (block.startsWith('<h') || block.startsWith('<div') || block.startsWith('<ul') || block.startsWith('<blockquote') || block.startsWith('<hr')) return block;
    return `<p style="margin-bottom: 20px; line-height: 1.8;">${block.trim().replace(/\r?\n/g, '<br>')}</p>`;
  }).join('');

  return html;
}

// Generate template for each tool
const template = (tool, relatedTools) => `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${tool.metaDesc || tool.shortDesc}">
  <link rel="canonical" href="https://builditbyai.com/tools/${tool.id}.html">
  <title>${tool.name} — مراجعة شاملة | BuildItByAI</title>
  
  <!-- SEO Open Graph -->
  <meta property="og:title" content="${tool.name} — مراجعة شاملة | BuildItByAI">
  <meta property="og:description" content="${tool.metaDesc || tool.shortDesc}">
  <meta property="og:image" content="https://builditbyai.com/${tool.logo.startsWith('./') ? tool.logo.substring(2) : tool.logo}">
  <meta property="og:type" content="article">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${tool.name} — مراجعة شاملة | BuildItByAI">
  <meta name="twitter:description" content="${tool.metaDesc || tool.shortDesc}">
  <meta name="twitter:image" content="https://builditbyai.com/${tool.logo.startsWith('./') ? tool.logo.substring(2) : tool.logo}">

  <!-- Schema.org JSON-LD -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "${tool.name}",
    "description": "${tool.shortDesc}",
    "applicationCategory": "${tool.category}",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  }
  </script>
  
  <link rel="icon" type="image/png" href="../favicon.png">
  <link rel="manifest" href="../manifest.json">
  <link rel="stylesheet" href="../style.css">
  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-H4F0DNNBP1"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    gtag('js', new Date());
    gtag('config', 'G-H4F0DNNBP1');
  </script>
</head>
<body>
  <!-- Navbar -->
  <nav class="navbar">
    <div class="container">
      <a href="../index.html" class="logo" dir="ltr">Build<span>It</span>ByAI</a>
      <div class="nav-actions">
        <label class="theme-switch" for="themeToggle">
          <input type="checkbox" id="themeToggle">
          <span class="theme-slider"></span>
        </label>
      </div>
    </div>
  </nav>

  <!-- Content -->
  <main class="container" style="padding: 40px 24px; max-width: 800px; margin-top: 20px; min-height: 80vh;">
    <a href="../index.html" style="color: var(--text-secondary); margin-bottom: 24px; display: inline-block; font-weight: 600; text-decoration: none;">&rarr; العودة للدليل</a>
    
    <article style="background:var(--bg-card); padding: 40px; border-radius: var(--radius-xl); box-shadow: var(--shadow-md); border: 1px solid var(--border);">
      <header style="display:flex;align-items:center;gap:20px;margin-bottom:24px;">
        <img src="${tool.logo.replace('./', '../')}" alt="${tool.name}" 
             style="width:80px;height:80px;border-radius:var(--radius-lg);border:1px solid var(--border);background:#fff; object-fit: contain; padding: 6px;"
             onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 72 72%22><rect fill=%22%23f1f5f9%22 width=%2272%22 height=%2272%22 rx=%2214%22/><text x=%2236%22 y=%2246%22 text-anchor=%22middle%22 font-size=%2228%22>🤖</text></svg>'">
        <div>
          <h1 style="font-size:1.8rem;font-weight:700;margin-bottom:8px; line-height: 1.2;">${tool.name}</h1>
          <p style="color:var(--text-secondary);font-size:1.1rem; margin-bottom:0;">${tool.shortDesc}</p>
        </div>
      </header>
      
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:30px;">
        <span class="tool-tag">${tool.category}</span>
        <span class="tool-tag">💰 ${tool.price}</span>
        ${tool.tags.map(t => `<span class="tool-tag">${t}</span>`).join('')}
      </div>
      
      <div style="margin-bottom: 2.5rem; line-height: 1.8; color: var(--text-primary);">
        ${formatText(tool.fullReview).replace(/<p style="margin-bottom: 20px; line-height: 1.8;">النتيجة النهائية: (.*?)<\/p>/g, '<p style="margin-top: 30px; font-size: 1.5rem; font-weight: 900; color: var(--accent); border-top: 2px solid var(--border); padding-top: 20px; display: inline-block;">النتيجة النهائية: $1</p>')}
      </div>
      
      <a href="${tool.affiliateLink}" target="_blank" rel="noopener noreferrer"
         style="display:block;text-align:center;padding:18px;background:linear-gradient(135deg, var(--accent), #f97316);
         color:#fff;border-radius:var(--radius-md);font-weight:800;font-size:1.2rem;
         text-decoration:none;transition:all 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 10px 20px rgba(249,115,22,0.4);
         border: 1px solid rgba(255,255,255,0.1); position: relative; overflow: hidden;"
         onmouseover="this.style.transform='translateY(-3px) scale(1.02)'; this.style.boxShadow='0 15px 30px rgba(249,115,22,0.5)'"
         onmouseout="this.style.transform='none'; this.style.boxShadow='0 10px 20px rgba(249,115,22,0.4)'">
        ${tool.ctaText || `زيارة الموقع الرسمي لـ ${tool.name} ↗`}
      </a>
    </article>

    ${relatedTools.length > 0 ? `
      <section style="margin-top: 40px;">
        <h3 style="font-size:1.2rem;font-weight:700;margin-bottom:20px;color:var(--text-primary);">🔄 أدوات مشابهة (بدائل)</h3>
        <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px;">
          ${relatedTools.map(alt => `
            <a href="${alt.id}.html" style="display:flex;align-items:center;gap:12px;padding:16px;
                 border-radius:var(--radius-md);background:var(--bg-card);border:1px solid var(--border);
                 transition:all 0.2s ease;text-decoration:none;color:inherit; box-shadow: var(--shadow-sm);"
                 onmouseover="this.style.transform='translateY(-2px)'"
                 onmouseout="this.style.transform='none'">
              <img src="${alt.logo.replace('./', '../')}" alt="${alt.name}" 
                   style="width:48px;height:48px;border-radius:12px;border:1px solid var(--border); background:#fff; padding:4px;"
                   onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 36 36%22><rect fill=%22%23f1f5f9%22 width=%2236%22 height=%2236%22 rx=%228%22/><text x=%2218%22 y=%2224%22 text-anchor=%22middle%22 font-size=%2214%22>🤖</text></svg>'">
              <div style="min-width:0;">
                <div style="font-weight:700;font-size:0.95rem;">${alt.name}</div>
                <div style="font-size:0.8rem;color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${alt.shortDesc}</div>
              </div>
            </a>
          `).join('')}
        </div>
      </section>
    ` : ''}
  </main>
  
  <footer class="footer" style="margin-top: 40px;">
    <div class="container">
      <div class="footer-brand" dir="ltr">Build<span>It</span>ByAI</div>
      <div class="footer-disclosure-box">
        <p class="footer-disclosure-text">
          💛 شفافيتنا هي نبراسنا: نحن نجتهد بالبحث في عالم الذكاء الاصطناعي، لتقديم المحتوى مجاناً وبأعلى جودة، <strong>دعمك لنا دون أي تكلفة إضافية عليك</strong> بالتسجيل أو الشراء عبر بعض الروابط الموجودة في هذا الدليل يمنحنا عمولة تسويقية تساعدنا في تحمل تكاليف الموقع واستمراره.
        </p>
      </div>
      <div class="footer-policies">
        <a href="/">الرئيسية</a>
        <a href="../about.html">من نحن</a>
        <a href="../privacy.html">سياسة الخصوصية</a>
        <a href="../terms.html">شروط الاستخدام</a>
        <a href="../disclaimer.html">إخلاء المسؤولية</a>
      </div>
      <p class="footer-copyright">© 2026 BuildItByAI — جميع الحقوق محفوظة.</p>
    </div>
  </footer>

  <script src="../neural-bg.js"></script>
  <script>
    const themeBtn = document.getElementById('themeToggle');
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeBtn.checked = savedTheme === 'dark';
    themeBtn.addEventListener('change', () => {
      const next = themeBtn.checked ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
    });
  </script>
</body>
</html>`;

let count = 0;
toolsData.forEach(tool => {
  const related = toolsData.filter(t => t.category === tool.category && t.id !== tool.id).slice(0, 3);
  fs.writeFileSync(path.join(outDir, tool.id + '.html'), template(tool, related), 'utf8');
  count++;
});

console.log('Successfully built ' + count + ' dedicated pages in /tools folder!');
