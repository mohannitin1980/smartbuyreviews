/**
 * Smart Navigation Menu - Simplified v3.0
 * Simple flat menu with Reviews dropdown listing all review pages
 */
class SmartNavigationMenu {
  constructor(options = {}) {
    this.menuContainerId = options.menuContainerId || 'dynamic-menu';
    this.menuDataUrl = options.menuDataUrl || '/data/menu.json';
    this.menuData = null;
    this.init();
  }

  init() {
    this.loadMenuData();
  }

  loadMenuData() {
    fetch(this.menuDataUrl)
      .then(response => response.json())
      .then(data => {
        this.menuData = data;
        this.renderMenu();
      })
      .catch(error => {
        console.warn('Failed to load menu data:', error);
        this.renderFallbackMenu();
      });
  }

  renderMenu() {
    const container = document.getElementById(this.menuContainerId);
    if (!container) return;
    container.innerHTML = this.buildMenuHtml();
    this.attachEventListeners();
  }

  buildMenuHtml() {
    if (!this.menuData) return this.buildFallbackHtml();

    const reviews = this.menuData.reviews || [];
    const languages = this.menuData.languages || [];

    let html = '<ul class="menu-list flex flex-wrap items-center gap-4 lg:gap-6">';

    // Home link
    html += '<li class="menu-item"><a href="/" class="menu-link text-white hover:text-slate-200 transition-colors">Home</a></li>';

    // Reviews dropdown (only if there are reviews)
    if (reviews.length > 0) {
      html += `<li class="menu-item menu-item--with-children relative">
        <button class="menu-link menu-link--parent text-white hover:text-slate-200 transition-colors flex items-center gap-1">
          Reviews
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
        </button>
        <ul class="menu-submenu absolute top-full left-0 mt-2 bg-slate-800 rounded-lg shadow-xl py-2 min-w-[250px] hidden z-50">`;

      for (const review of reviews) {
        html += `<li class="menu-submenu-item">
          <a href="${review.url}" class="menu-submenu-link block px-4 py-2 text-slate-200 hover:bg-slate-700 hover:text-white transition-colors">${review.label}</a>
        </li>`;
      }

      html += '</ul></li>';
    }

    // About link
    html += '<li class="menu-item"><a href="/about.html" class="menu-link text-white hover:text-slate-200 transition-colors">About</a></li>';

    // Privacy Policy link
    html += '<li class="menu-item"><a href="/privacy-policy.html" class="menu-link text-white hover:text-slate-200 transition-colors">Privacy Policy</a></li>';

    // Language dropdown (if multiple languages)
    if (languages.length > 1) {
      html += this.buildLanguageDropdown(languages);
    }

    html += '</ul>';
    return html;
  }

  buildLanguageDropdown(languages) {
    let html = `<li class="menu-item menu-item--with-children relative ml-4">
      <button class="menu-link menu-link--parent text-white hover:text-slate-200 transition-colors flex items-center gap-1 border border-white/20 rounded px-3 py-1">
        <span class="text-sm">EN</span>
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
      </button>
      <ul class="menu-submenu absolute top-full right-0 mt-2 bg-slate-800 rounded-lg shadow-xl py-2 min-w-[140px] hidden z-50">`;

    for (const lang of languages) {
      html += `<li class="menu-submenu-item">
        <a href="#" class="menu-submenu-link block px-4 py-2 text-slate-200 hover:bg-slate-700 hover:text-white transition-colors" data-lang="${lang.code}">${lang.flag} ${lang.label}</a>
      </li>`;
    }

    html += '</ul></li>';
    return html;
  }

  buildFallbackHtml() {
    return `
      <ul class="menu-list flex flex-wrap items-center gap-4 lg:gap-6">
        <li class="menu-item"><a href="/" class="menu-link text-white hover:text-slate-200">Home</a></li>
        <li class="menu-item"><a href="/about.html" class="menu-link text-white hover:text-slate-200">About</a></li>
        <li class="menu-item"><a href="/privacy-policy.html" class="menu-link text-white hover:text-slate-200">Privacy Policy</a></li>
      </ul>
    `;
  }

  attachEventListeners() {
    // Dropdown toggle on click
    document.querySelectorAll('.menu-item--with-children').forEach(item => {
      const button = item.querySelector('.menu-link--parent');
      const submenu = item.querySelector('.menu-submenu');

      if (button && submenu) {
        button.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();

          // Close other open menus
          document.querySelectorAll('.menu-submenu').forEach(sm => {
            if (sm !== submenu) sm.classList.add('hidden');
          });

          submenu.classList.toggle('hidden');
        });
      }
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.menu-item--with-children')) {
        document.querySelectorAll('.menu-submenu').forEach(sm => {
          sm.classList.add('hidden');
        });
      }
    });

    // Language switching
    document.querySelectorAll('[data-lang]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const newLang = e.target.dataset.lang;
        localStorage.setItem('preferredLanguage', newLang);
        // For now just show an alert - full language support would need more pages
        alert(`Language preference saved: ${newLang}. Full multilingual support coming soon!`);
      });
    });
  }

  renderFallbackMenu() {
    const container = document.getElementById(this.menuContainerId);
    if (container) {
      container.innerHTML = this.buildFallbackHtml();
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new SmartNavigationMenu();
  });
} else {
  new SmartNavigationMenu();
}
