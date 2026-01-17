/**
 * Smart Navigation Menu System
 * Works at any folder depth - detects region/language from URL and filters menu accordingly
 */
class SmartNavigationMenu {
    constructor(options = {}) {
          this.menuSelector = options.menuSelector || 'nav';
          this.menuDataUrl = options.menuDataUrl || '/data/menu.json';
          this.currentPagePath = this.getCurrentPagePath();
          this.detectedRegion = this.detectRegionFromPath();
          this.siteRoot = options.siteRoot || '/';
          this.init();
    }

  getCurrentPagePath() {
        const path = window.location.pathname;
        const pathWithoutFile = path.substring(0, path.lastIndexOf('/') + 1);
        return pathWithoutFile === '' ? '/' : pathWithoutFile;
  }

  detectRegionFromPath() {
        const path = window.location.pathname;
        // Match pattern: /contents/regions/{region}/...
      const regionMatch = path.match(/\/contents\/regions\/([a-z]{2})\//);
        return regionMatch ? regionMatch[1] : null;
  }

  getDepthLevel() {
        const path = this.getCurrentPagePath();
        if (path === '/') return 0;
        const count = (path.match(/\//g) || []).length - 1;
        return count;
  }

  toRelativeUrl(absoluteUrl) {
        if (absoluteUrl.startsWith('http')) {
                return absoluteUrl;
        }
        if (absoluteUrl.startsWith('/')) {
                const depth = this.getDepthLevel();
                if (depth === 0) return absoluteUrl;
                return '../'.repeat(depth) + absoluteUrl.substring(1);
        }
        return absoluteUrl;
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
                    console.warn('Failed to load menu data, using fallback menu');
                    this.renderFallbackMenu();
          });
  }

  renderMenu() {
        const navElement = document.querySelector(this.menuSelector);
        if (!navElement) return;

      // Determine which region to use
      const region = this.detectedRegion || this.menuData.defaultRegion || 'en';
        const regionData = this.menuData.regions[region];

      if (!regionData) {
              this.renderFallbackMenu();
              return;
      }

      const menuHtml = this.createMenuHtml(regionData.menu);
        navElement.innerHTML = menuHtml;
  }

  createMenuHtml(menuItems) {
        let html = '<ul class="menu-list">';

      menuItems.forEach(item => {
              if (item.children && item.children.length > 0) {
                        // Create dropdown menu
                html += this.createMenuItemWithDropdown(item);
              } else {
                        // Regular menu item
                html += this.createMenuItem(item);
              }
      });

      html += '</ul>';
        return html;
  }

  createMenuItem(item) {
        const url = this.toRelativeUrl(item.url);
        const icon = item.icon ? item.icon + ' ' : '';
        return `<li class="menu-item"><a href="${url}" class="menu-link">${icon}${item.label}</a></li>`;
  }

  createMenuItemWithDropdown(item) {
        const icon = item.icon ? item.icon + ' ' : '';
        let html = `<li class="menu-item menu-item--with-children">
                          <span class="menu-link menu-link--parent">${icon}${item.label}</span>
                                            <ul class="menu-submenu">`;

      item.children.forEach(child => {
              const url = this.toRelativeUrl(child.url);
              html += `<li class="menu-submenu-item"><a href="${url}" class="menu-submenu-link">${child.label}</a></li>`;
      });

      html += `</ul>
                   </li>`;
        return html;
  }

  renderFallbackMenu() {
        const navElement = document.querySelector(this.menuSelector);
        if (!navElement) return;

      const fallbackHtml = `
            <ul class="menu-list">
                    <li class="menu-item"><a href="/" class="menu-link">🏠 HOME</a></li>
                            <li class="menu-item"><a href="/about.html" class="menu-link">ABOUT</a></li>
                                    <li class="menu-item"><a href="/privacy-policy.html" class="menu-link">PRIVACY POLICY</a></li>
                                          </ul>
                                              `;
        navElement.innerHTML = fallbackHtml;
  }
}

// Initialize the menu when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
          new SmartNavigationMenu();
    });
} else {
    new SmartNavigationMenu();
}
