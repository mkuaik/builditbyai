const fs = require('fs');

const domain = 'https://builditbyai.com/'; // Replace with actual domain when launching

// Read tools data
let content = fs.readFileSync('tools-data.js', 'utf8');
let MathStartIndex = content.indexOf('[');
let MathEndIndex = content.lastIndexOf(']');
let toolsData = JSON.parse(content.substring(MathStartIndex, MathEndIndex + 1));

// Static Pages
const staticPages = [
    'index.html',
    'about.html',
    'privacy.html',
    'terms.html',
    'disclaimer.html'
];

let sitemapXML = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

// Add static pages
staticPages.forEach(page => {
    sitemapXML += `  <url>\n    <loc>${domain}${page}</loc>\n    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${page === '' ? '1.0' : '0.8'}</priority>\n  </url>\n`;
});

// Add tool pages
toolsData.forEach(tool => {
    sitemapXML += `  <url>\n    <loc>${domain}/tools/${tool.id}.html</loc>\n    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
});

sitemapXML += `</urlset>`;

fs.writeFileSync('sitemap.xml', sitemapXML);
console.log(`sitemap.xml has been successfully generated with ${staticPages.length + toolsData.length} URLs.`);

const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${domain}/sitemap.xml
`;

fs.writeFileSync('robots.txt', robotsTxt);
console.log('robots.txt has been successfully generated.');
