// ============================================
// BuildItByAI — Main Application Logic
// ============================================

let toolsData = [];
let activeFilter = 'الكل';
let activeType = 'الكل';
let searchQuery = '';
let visibleLimit = 15; // Load More pagination limit

// --- Truncate text at word boundary ---
function truncateText(text, maxLen) {
  if (!text) return '';
  if (text.length <= maxLen) return text;
  const trimmed = text.substring(0, maxLen);
  const lastSpace = trimmed.lastIndexOf(' ');
  return (lastSpace > 0 ? trimmed.substring(0, lastSpace) : trimmed) + '...';
}

// --- Load Tools Data ---
async function loadTools() {
  try {
    const res = await fetch('./data/tools.json');
    if (!res.ok) throw new Error('HTTP error');
    toolsData = await res.json();
  } catch (err) {
    // Fallback: use inline data if fetch fails (e.g., file:// protocol)
    if (typeof TOOLS_DATA !== 'undefined') {
      toolsData = TOOLS_DATA;
    } else {
      console.error('Error loading tools:', err);
      return;
    }
  }
  extractCategories();
  renderTools();
}

// --- Extract Unique Categories ---
function extractCategories() {
  const cats = ['الكل', ...new Set(toolsData.map(t => t.category))];
  const container = document.getElementById('filtersContainer');
  container.innerHTML = cats.map(cat => `
    <button class="filter-btn ${cat === 'الكل' ? 'active' : ''}" 
            onclick="setFilter('${cat}')">
      ${cat}
    </button>
  `).join('');
}

// --- Set Active Filter ---
function setFilter(cat) {
  activeFilter = cat;
  visibleLimit = 15; // Reset pagination
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.textContent.trim() === cat);
  });
  renderTools();
}

// --- Set Type Filter ---
function setTypeFilter(type) {
  activeType = type;
  visibleLimit = 15; // Reset pagination
  document.querySelectorAll('.type-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('onclick').includes("'" + type + "'"));
  });
  renderTools();
}

// --- Render Trending ---
function renderTrending() {
  const section = document.getElementById('trendingSection');
  const grid = document.getElementById('trendingGrid');
  if (!section || !grid) return;

  if (activeFilter === 'الكل' && activeType === 'الكل' && !searchQuery) {
    // Highlight first 3 featured or affiliate tools
    const trendingTools = toolsData.filter(t => t.featured || t.hasAffiliate).slice(0, 3);
    if (trendingTools.length > 0) {
      grid.innerHTML = trendingTools.map((tool, i) => renderToolCard(tool, i, false)).join(''); // Use false to avoid duplicating the badge if we already style it
      section.style.display = 'block';
    } else {
      section.style.display = 'none';
    }
  } else {
    section.style.display = 'none';
  }
}

// --- Render Tools ---
function renderTools() {
  const grid = document.getElementById('toolsGrid');
  const noResults = document.getElementById('noResults');
  const countEl = document.getElementById('toolsCount');

  let filtered = toolsData;

  renderTrending();

  // Apply type filter
  if (activeType !== 'الكل') {
    filtered = filtered.filter(t => (t.type || 'tool') === activeType);
  }

  // Apply category filter
  if (activeFilter !== 'الكل') {
    filtered = filtered.filter(t => t.category === activeFilter);
  }

  // Apply search
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(t =>
      t.name.toLowerCase().includes(q) ||
      t.shortDesc.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      (t.tags && t.tags.some(tag => tag.toLowerCase().includes(q)))
    );
  }

  if (filtered.length === 0) {
    grid.style.display = 'none';
    noResults.style.display = 'block';
    countEl.textContent = '';
    removeLoadMoreButton();
    return;
  }

  grid.style.display = 'flex';
  noResults.style.display = 'none';

  // Slice for pagination
  const displayedTools = filtered.slice(0, visibleLimit);

  const typeLabels = { 'tool': 'أداة', 'website': 'موقع', 'app': 'تطبيق' };
  const countLabel = activeType !== 'الكل' ? typeLabels[activeType] || 'عنصر' : 'أداة';
  countEl.textContent = `عرض ${displayedTools.length} من أصل ${filtered.length} ${countLabel}`;

  // Group by category when showing all and no search
  if (activeFilter === 'الكل' && !searchQuery) {
    const groups = {};
    displayedTools.forEach(tool => {
      if (!groups[tool.category]) groups[tool.category] = [];
      groups[tool.category].push(tool);
    });

    let html = '';
    let globalIndex = 0;
    for (const [category, tools] of Object.entries(groups)) {
      html += `<div class="category-header">${category}</div>`;
      tools.forEach((tool, i) => {
        html += renderToolCard(tool, globalIndex, tool.featured === true);
        globalIndex++;
      });
    }
    grid.innerHTML = html;
  } else {
    // Flat list for filtered/search view
    grid.innerHTML = displayedTools.map((tool, i) => renderToolCard(tool, i, false)).join('');
  }

  // Handle Load More button
  if (filtered.length > visibleLimit) {
    setupLoadMoreButton();
  } else {
    removeLoadMoreButton();
  }
}

// --- Load More Logic ---
function setupLoadMoreButton() {
  let btnWrapper = document.getElementById('loadMoreWrapper');
  if (!btnWrapper) {
    btnWrapper = document.createElement('div');
    btnWrapper.id = 'loadMoreWrapper';
    btnWrapper.style.cssText = 'text-align:center; padding: 24px 0 10px; margin-top:16px;';
    btnWrapper.innerHTML = `
      <button onclick="loadMoreTools()" 
              style="padding: 12px 32px; font-size: 1rem; font-weight: 600; 
                     background: var(--bg-card); color: var(--text-primary); 
                     border: 2px solid var(--border); border-radius: 100px; 
                     cursor: pointer; transition: all 0.2s ease;">
        عرض المزيد ↓
      </button>
    `;
    document.getElementById('toolsGrid').parentNode.appendChild(btnWrapper);
  }
  btnWrapper.style.display = 'block';
}

function removeLoadMoreButton() {
  const btnWrapper = document.getElementById('loadMoreWrapper');
  if (btnWrapper) btnWrapper.style.display = 'none';
}

function loadMoreTools() {
  visibleLimit += 15;
  renderTools();
}

// --- Render Single Tool Card ---
function renderToolCard(tool, index, isFeatured) {
  return `
    <div class="tool-card ${isFeatured ? 'featured' : ''}" 
         style="--i: ${index}; position: relative; cursor: pointer;"
         onclick="window.location.href='./tools/${tool.id}.html'">
      <a href="./tools/${tool.id}.html" style="position: absolute; inset: 0; z-index: 1;" aria-label="عرض تفاصيل ${tool.name}"></a>
      <img class="tool-logo" 
           src="${tool.logo}" 
           alt="${tool.name}"
           loading="lazy"
           onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 56 56%22><rect fill=%22%23f1f5f9%22 width=%2256%22 height=%2256%22 rx=%2212%22/><text x=%2228%22 y=%2236%22 text-anchor=%22middle%22 font-size=%2220%22>🤖</text></svg>'">
      <div class="tool-info">
        <div class="tool-name">
          ${tool.name}
          ${isFeatured ? '<span class="badge-featured">إعلان مدفوع</span>' : ''}
          <span class="badge-type badge-${tool.type || 'tool'}">
            ${(tool.type || 'tool') === 'website' ? '🌐 موقع' :
      (tool.type || 'tool') === 'app' ? '📱 تطبيق' : '🔧 أداة'}
          </span>
        </div>
        <div class="tool-desc">${tool.shortDesc}</div>
        <div class="tool-meta">
          ${tool.tags.includes('مجاني') ? '<span class="tool-tag" style="color:#16a34a">🟢 مجاني</span>' : ''}
        </div>
      </div>
      <span class="tool-price">${tool.price}</span>
      <div class="tool-actions">
        <a href="${tool.affiliateLink}" 
           target="_blank" 
           rel="noopener noreferrer"
           class="btn-visit"
           style="position: relative; z-index: 2;"
           onclick="event.stopPropagation()">
          زيارة ↗
        </a>
      </div>
    </div>
  `;
}


// --- Search ---
let searchTimeout;
document.getElementById('searchInput').addEventListener('input', (e) => {
  clearTimeout(searchTimeout);
  const val = e.target.value.trim();
  searchTimeout = setTimeout(() => {
    searchQuery = val;
    visibleLimit = 15; // Reset pagination on search
    renderTools();
  }, 1500); // 1.5 seconds human-friendly debounce
});

// --- Dark Mode Toggle ---
const themeBtn = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);
themeBtn.checked = savedTheme === 'dark';

themeBtn.addEventListener('change', () => {
  const next = themeBtn.checked ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
});

// --- Init ---
loadTools();

// --- Cookie Consent Logic ---
function initCookieConsent() {
  if (localStorage.getItem('cookieConsent')) return;

  const cookieDiv = document.createElement('div');
  cookieDiv.className = 'cookie-toast';
  cookieDiv.innerHTML = `
    <div class="cookie-toast-header">
      🍪 ملفات تعريف الارتباط
    </div>
    <div class="cookie-toast-body">
      نستخدم ملفات في <strong>BuildItByAI</strong> لتحسين وتخصيص تجربتك، وتحليل أداء الموقع لتقديم أفضل الأدوات باستمرار. بالاستمرار بالتصفح أنت توافق على سياساتنا.
    </div>
    <div class="cookie-actions">
      <button class="btn-cookie-accept" onclick="acceptCookies()">موافق</button>
      <button class="btn-cookie-reject" onclick="rejectCookies()">الرفض</button>
    </div>
  `;
  document.body.appendChild(cookieDiv);

  // Trigger animation
  setTimeout(() => {
    cookieDiv.classList.add('show');
  }, 1000);
}

window.acceptCookies = function () {
  localStorage.setItem('cookieConsent', 'accepted');
  const toast = document.querySelector('.cookie-toast');
  if (toast) {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 500);
  }
}

window.rejectCookies = function () {
  localStorage.setItem('cookieConsent', 'rejected');
  const toast = document.querySelector('.cookie-toast');
  if (toast) {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 500);
  }
}

// init cookie consent
initCookieConsent();
