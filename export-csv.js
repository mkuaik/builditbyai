const fs = require('fs');
const path = require('path');

// Read tools data
const toolsDataRaw = fs.readFileSync(path.join(__dirname, 'data', 'tools.json'), 'utf8');
const toolsData = JSON.parse(toolsDataRaw);

// CSV header
const headers = ['id', 'name', 'category', 'type', 'price', 'hasAffiliate', 'tags', 'shortDesc'];
let csv = headers.join(',') + '\n';

// Escape CSV fields
function esc(val) {
  if (val === undefined || val === null) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

// Build rows
toolsData.forEach(tool => {
  const row = [
    esc(tool.id),
    esc(tool.name),
    esc(tool.category),
    esc(tool.type || 'tool'),
    esc(tool.price),
    tool.hasAffiliate ? 'true' : 'false',
    esc((tool.tags || []).join(' | ')),
    esc(tool.shortDesc)
  ];
  csv += row.join(',') + '\n';
});

fs.writeFileSync(path.join(__dirname, 'tools_database.csv'), csv, 'utf8');
console.log(`✅ Exported ${toolsData.length} tools to tools_database.csv`);
