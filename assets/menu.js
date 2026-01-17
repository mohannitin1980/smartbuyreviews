/**
 * Smart Navigation Menu System v2.0
 * Supports language switching and 3-level menus (Reviews > Category > Pages)
 */
class SmartNavigationMenu {
  constructor(options = {}) {
    this.menuContainerId = options.menuContainerId || 'dynamic-menu';
    this.menuDataUrl = options.menuDataUrl || '/data/menu.json';
    this.currentLanguage = this.detectLanguageFromPath() || 'en';
    this.menuData = null;
    this.init();
  }

  detectLanguageFromPath() {
    const path = window.location.pathname;
    const langMatch = path.match(/\/contents\/regions\/([a-z]{2})\//);
    return langMatch ? langMatch[1] : null;
  }

  init() {
    this.loadMenuData();
  }

  loadMenuData() {
    fetch(this.menuDataUrl)
      .then(response => response.json())
      .then(data => {
        this.menuData = data;
        this.currentLanguage = this.detectLanguageFromPath() || data.defaultLanguage || 'en';
        this.renderMenu();
      })
      .catch(error => {
        console.warn('Failed to load menu data:', error);
        this.renderFallbackMenu();
      });
  }

  renderMenu() {
    const container = document.getElementById(this.menuContainerId);
    if (!container) {
      // If no container found, try to inject into nav
      this.injectMenuIntoNav();
      return;
    }
    container.innerHTML = this.buildMenuHtml();
    this.attachEventListeners();
  }

  injectMenuIntoNav() {
    const nav = document.querySelector('nav');
    if (!nav) return;

    // Check if there's already a menu wrapper
    let menuWrapper = nav.querySelector('.menu-wrapper');
    if (!menuWrapper) {
      // Create wrapper and move existing content
      const existingContent = nav.innerHTML;
      menuWrapper = document.createElement('div');
      menuWrapper.className = 'menu-wrapper';
      menuWrapper.id = this.menuContainerId;
      nav.innerHTML = '';
      nav.appendChild(menuWrapper);
    }

    menuWrapper.innerHTML = this.buildMenuHtml();
    this.attachEventListeners();
  }

  buildMenuHtml() {
    const regionData = this.menuData.regions[this.currentLanguage];
    if (!regionData) return this.buildFallbackHtml();

    let html = '<ul class="menu-list">';

    // Home link
    html += '<li class="menu-item"><a href="/" class="menu-link">🏠 Home</a></li>';

    // Reviews mega menu with categories and pages
    html += this.buildReviewsMenu(regionData);

    // About link
    html += '<li class="menu-item"><a href="/about.html" class="menu-link">About</a></li>';

    // Language dropdown
    html += this.buildLanguageDropdown();

    html += '</ul>';
    return html;
  }

  buildReviewsMenu(regionData) {
    const categories = regionData.categories;
    if (!categories || Object.keys(categories).length === 0) {
      return '';
    }

    let html = `<li class="menu-item menu-item--with-children">
      <span class="menu-link menu-link--parent">⭐ Reviews</span>
      <ul class="menu-submenu">`;

    for (const [catKey, catData] of Object.entries(categories)) {
      const catUrl = `/contents/regions/${this.currentLanguage}/reviews/${catKey}/`;

      if (catData.pages && catData.pages.length > 0) {
        // Category with pages - create sub-submenu
        html += `<li class="menu-submenu-item menu-submenu-item--with-children">
          <span class="menu-submenu-link menu-submenu-link--parent">${catData.icon || ''} ${catData.label}</span>
          <ul class="menu-subsubmenu">`;

        for (const page of catData.pages) {
          const pageUrl = `${catUrl}${page.file}`;
          html += `<li class="menu-subsubmenu-item">
            <a href="${pageUrl}" class="menu-subsubmenu-link">${page.label}</a>
          </li>`;
        }

        html += `</ul></li>`;
      } else {
        // Category without pages - just show category link
        html += `<li class="menu-submenu-item">
          <a href="${catUrl}" class="menu-submenu-link">${catData.icon || ''} ${catData.label}</a>
        </li>`;
      }
    }

    html += '</ul></li>';
    return html;
  }

  buildLanguageDropdown() {
    const languages = this.menuData.languages;
    if (!languages || languages.length <= 1) return '';

    const currentLangData = languages.find(l => l.code === this.currentLanguage) || languages[0];

    let html = `<li class="menu-item menu-item--with-children menu-item--language">
      <span class="menu-link menu-link--parent">🌐 ${currentLangData.label}</span>
      <ul class="menu-submenu menu-submenu--language">`;

    for (const lang of languages) {
      const isActive = lang.code === this.currentLanguage;
      const activeClass = isActive ? ' menu-submenu-link--active' : '';
      html += `<li class="menu-submenu-item">
        <a href="#" class="menu-submenu-link${activeClass}" data-lang="${lang.code}">${lang.label}</a>
      </li>`;
    }

    html += '</ul></li>';
    return html;
  }

  buildFallbackHtml() {
    return `
      <ul class="menu-list">
        <li class="menu-item"><a href="/" class="menu-link">🏠 Home</a></li>
        <li class="menu-item"><a href="/about.html" class="menu-link">About</a></li>
        <li class="menu-item"><a href="/privacy-policy.html" class="menu-link">Privacy Policy</a></li>
      </ul>
    `;
  }

  attachEventListeners() {
    // Language switching
    document.querySelectorAll('[data-lang]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const newLang = e.target.dataset.lang;
        this.switchLanguage(newLang);
      });
    });

    // Touch support for mobile
    document.querySelectorAll('.menu-item--with-children').forEach(item => {
      item.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
          const submenu = item.querySelector('.menu-submenu');
          if (submenu) {
            e.stopPropagation();
            item.classList.toggle('menu-item--open');
          }
        }
      });
    });

    // Sub-submenu touch support
    document.querySelectorAll('.menu-submenu-item--with-children').forEach(item => {
      item.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
          const submenu = item.querySelector('.menu-subsubmenu');
          if (submenu) {
            e.stopPropagation();
            item.classList.toggle('menu-submenu-item--open');
          }
        }
      });
    });
  }

  switchLanguage(newLang) {
    const currentPath = window.location.pathname;

    // If we're on a region-specific page, switch the language in the path
    if (currentPath.includes('/contents/regions/')) {
      const newPath = currentPath.replace(
        /\/contents\/regions\/[a-z]{2}\//,
        `/contents/regions/${newLang}/`
      );
      window.location.href = newPath;
    } else {
      // Store preference and reload
      localStorage.setItem('preferredLanguage', newLang);
      this.currentLanguage = newLang;
      this.renderMenu();
    }
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
