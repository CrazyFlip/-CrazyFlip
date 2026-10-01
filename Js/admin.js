import { listenOrders } from './data.js';

function renderSidebar(active) {
  const pages = [
    { key: 'dashboard', label: '📊 Dashboard', href: 'admin.html' },
    { key: 'orders',    label: '📦 Orders',    href: 'admin-orders.html' },
    { key: 'products',  label: '🛍️ Products',  href: 'admin-products.html' },
    { key: 'banner',    label: '🖼️ Banner Manager', href: 'admin-banner.html' },
    { key: 'settings',  label: '⚙️ Website Settings', href: 'admin-settings.html' }
  ];
  document.getElementById('sidebar').innerHTML = `
    <aside class="sidebar">
      <a href="index.html" class="side-logo">CRAZY<span>FLIP</span></a>
      <nav>
        ${pages.map(p => `
          <a class="nav-btn ${p.key === active ? 'active' : ''}" href="${p.href}">
            ${p.label}
          </a>
        `).join('')}
      </nav>
    </aside>
  `;
}

renderSidebar('dashboard');

listenOrders(orders => {
  document.getElementById('stTotal').textContent = orders.length;
  document.getElementById('stPending').textContent =
    orders.filter(o => o.status === 'Pending').length;
  document.getElementById('stCompleted').textContent =
    orders.filter(o => o.status === 'Completed').length;
  document.getElementById('stRevenue').textContent =
    orders.filter(o => o.status === 'Completed')
          .reduce((s, o) => s + (Number(o.price) || 0), 0);
});
