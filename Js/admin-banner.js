import { getBanners, addBanner, updateBanner, deleteBanner } from './data.js';

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

renderSidebar('banner');

const modal = document.getElementById('modal');
const modalContent = document.getElementById('modalContent');
document.getElementById('modalClose').onclick = () => modal.classList.remove('open');
modal.onclick = e => { if (e.target === modal) modal.classList.remove('open'); };

let allBanners = [];

async function load() {
  allBanners = await getBanners();
  const list = document.getElementById('bannersList');
  if (!allBanners.length) {
    list.innerHTML = '<p style="color:#666">No banners yet.</p>';
    return;
  }
  list.innerHTML = allBanners.map(b => `
    <div class="item-card">
      <div class="item-info">
        <h4>${b.title || '(no title)'}</h4>
        <p style="word-break:break-all">${b.image}</p>
      </div>
      <div class="actions">
        <button class="btn-edit" data-edit="${b.id}">EDIT</button>
        <button class="btn-delete" data-del="${b.id}">DELETE</button>
      </div>
    </div>
  `).join('');
  list.querySelectorAll('[data-edit]').forEach(btn =>
    btn.onclick = () => bannerForm(allBanners.find(x => x.id === btn.dataset.edit)));
  list.querySelectorAll('[data-del]').forEach(btn =>
    btn.onclick = async () => {
      if (confirm('Delete banner?')) { await deleteBanner(btn.dataset.del); load(); }
    });
}

document.getElementById('addBannerBtn').onclick = () => bannerForm(null);

function bannerForm(b) {
  modalContent.innerHTML = `
    <h2>${b ? 'Edit' : 'Add'} Banner</h2>
    <label>Image URL</label><input id="fbImage" value="${b?.image || ''}" />
    <label>Title (optional)</label><input id="fbTitle" value="${b?.title || ''}" />
    <label>Link (optional)</label><input id="fbLink" value="${b?.link || ''}" />
    <button class="save-btn" id="fbSave">SAVE</button>
  `;
  modal.classList.add('open');

  document.getElementById('fbSave').onclick = async () => {
    const data = {
      image: document.getElementById('fbImage').value.trim(),
      title: document.getElementById('fbTitle').value.trim(),
      link: document.getElementById('fbLink').value.trim()
    };
    if (!data.image) return alert('Image URL দিন');
    if (b) await updateBanner(b.id, data);
    else await addBanner(data);
    modal.classList.remove('open');
    load();
  };
}

load();
