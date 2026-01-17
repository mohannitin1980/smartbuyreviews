/**
 * Smart Navigation Menu System
 * Works at any folder depth - calculates relative paths automatically
 */
class SmartNavigationMenu {
  constructor(options = {}) {
    this.menuSelector = options.menuSelector || 'nav';
    this.menuDataUrl = options.menuDataUrl || '/data/menu.json';
    this.currentPagePath = this.getCurrentPagePath();
    this.siteRoot = options.siteRoot || '/';
    this.init();
  }

  getCurrentPagePath() {
    const path = window.location.pathname;
    const pathWithoutFile = path.substring(0, path.lastIndexOf('/') + 1);
    return pathWithoutFile === '/' ? '/' : pathWithoutFile;
  }

  getDepthLevel() {
    const path = this.getCurrentPagePath();
    if (path === '/') return 0;
    const count = (path.match(/\\//g) || []).length - 1;
    return count;
  }

  toRelativeUrl(absoluteUrl) {
    if (absoluteUrl.startsWith('#') || absoluteUrl.startsWith('http')) {
      return absoluteUrl;
    }

    const depth = this.getDepthLevel();
    if (depth === 0) {
      return absoluteUrl;
    }

    const prefix = '../'.repeat(depth);
    const urlWithoutSlash = absoluteUrl.startsWith('/') 
      ? absoluteUrl.substring(1) 
      : absoluteUrl;

    return prefix + urlWithoutSlash;
  }

  async init() {
    try {
      const response = await fetch(this.menuDataUrl);
      const data = await response.json();
      this.renderMenu(data.menu);
    } catch (error) {
      console.error('Failed to load menu:', error);
      this.createFallbackMenu();
    }
  }

  renderMenu(menuItems) {
    const nav = document.querySelector(this.menuSelector);
    if (!nav) return;

    const ul = document.createElement('ul');
    ul.className = 'flex flex-col md:flex-row gap-0 md:gap-6';

    menuItems.forEach(item => {
      const li = this.createMenuItem(item);
      ul.appendChild(li);
    });

    nav.innerHTML = '';
    nav.appendChild(ul);
  }

  createMenuItem(item) {
    const li = document.createElement('li');
    
    if (item.children && item.children.length > 0) {
      li.className = 'relative group';
      
      const link = document.createElement('a');
      link.href = '#';
      link.className = 'block px-4 py-2 text-slate-900 hover:bg-slate-100 cursor-pointer font-medium';
      link.textContent = `${item.icon ? item.icon + ' ' : ''}${item.label}`;
      link.style.userSelect = 'none';
      
      link.addEventListener('click', (e) => e.preventDefault());
      
      const dropdown = document.createElement('ul');
      dropdown.className = 'hidden group-hover:block absolute left-0 top-full mt-0 bg-white border border-slate-200 rounded shadow-lg z-50 w-56';
      
      item.children.forEach(child => {
        const childLi = document.createElement('li');
        const childLink = document.createElement('a');
        
        const relativeUrl = this.toRelativeUrl(child.url);
        
        childLink.href = relativeUrl;
        childLink.className = 'block px-4 py-2 text-slate-900 hover:bg-slate-100 text-sm';
        childLink.textContent = child.label;
        
        childLi.appendChild(childLink);
        dropdown.appendChild(childLi);
      });
      
      li.appendChild(link);
      li.appendChild(dropdown);
    } else {
      const link = document.createElement('a');
      const relativeUrl = this.toRelativeUrl(item.url);
      
      link.href = relativeUrl;
      link.className = 'block px-4 py-2 text-slate-900 hover:bg-slate-100 font-medium';
      link.textContent = `${item.icon ? item.icon + ' ' : ''}${item.label}`;
      
      li.appendChild(link);
    }
    
    return li;
  }

  createFallbackMenu() {
    const nav = document.querySelector(this.menuSelector);
    if (!nav) return;

    const fallbackMenu = [
      { label: 'Home', url: this.toRelativeUrl('/') },
      { label: 'About', url: this.toRelativeUrl('/about.html') },
      { label: 'Privacy', url: this.toRelativeUrl('/privacy-policy.html') }
    ];

    const ul = document.createElement('ul');
    ul.className = 'flex gap-4';

    fallbackMenu.forEach(item => {
      const li = document.createElement('li');
      const link = document.createElement('a');
      link.href = item.url;
      link.className = 'text-slate-900 hover:text-blue-600';
      link.textContent = item.label;
      li.appendChild(link);
      ul.appendChild(li);
    });

    nav.appendChild(ul);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new SmartNavigationMenu();
  });
} else {
  new SmartNavigationMenu();
}
