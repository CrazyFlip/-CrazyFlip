
import { getSettings, saveSettings } from './data.js';

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

renderSidebar('settings');

(async () => {
  const s = await getSettings();
  document.getElementById('setSiteName').value = s.siteName || '';
  document.getElementById('setLogo').value = s.logo || '';
  document.getElementById('setMomo').value = s.momoNumber || '';
  document.getElementById('setAcc').value = s.accountName || '';
  document.getElementById('setPayText').value = s.paymentText || '';
  document.getElementById('setWhatsapp').value = s.whatsapp || '';
  document.getElementById('setTelegram').value = s.telegram || '';

  document.getElementById('saveBtn').onclick = async () => {
    await saveSettings({
      siteName: document.getElementById('setSiteName').value.trim(),
      logo: document.getElementById('setLogo').value.trim(),
      momoNumber: document.getElementById('setMomo').value.trim(),
      accountName: document.getElementById('setAcc').value.trim(),
      paymentText: document.getElementById('setPayText').value.trim(),
      whatsapp: document.getElementById('setWhatsapp').value.trim(),
      telegram: document.getElementById('setTelegram').value.trim()
    });
    alert('Saved!');
  };
})();
