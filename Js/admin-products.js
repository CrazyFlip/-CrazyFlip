import { getProducts, addProduct, updateProduct, deleteProduct } from './data.js';

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

renderSidebar('products');

const modal = document.getElementById('modal');
const modalContent = document.getElementById('modalContent');

document.getElementById('modalClose').onclick = () => modal.classList.remove('open');
modal.onclick = (e) => { if (e.target === modal) modal.classList.remove('open'); };

let allProducts = [];

async function load() {
  allProducts = await getProducts();
  const list = document.getElementById('productsList');
  if (!allProducts.length) {
    list.innerHTML = '<p style="color:#666">No products yet.</p>';
    return;
  }
  list.innerHTML = allProducts.map(p => `
    <div class="item-card">
      <div class="item-info">
        <h4>${p.name}</h4>
        <p>Starting: <b>GH₵ ${p.plans?.[0]?.price ?? 0}</b> · Plans: <b>${p.plans?.length || 0}</b></p>
      </div>
      <div class="actions">
        <button class="btn-edit" data-edit="${p.id}">EDIT</button>
        <button class="btn-delete" data-del="${p.id}">DELETE</button>
      </div>
    </div>
  `).join('');

  list.querySelectorAll('[data-edit]').forEach(b =>
    b.onclick = () => productForm(allProducts.find(x => x.id === b.dataset.edit)));

  list.querySelectorAll('[data-del]').forEach(b =>
    b.onclick = async () => {
      if (confirm('Delete product?')) { await deleteProduct(b.dataset.del); load(); }
    });
}

document.getElementById('addProductBtn').onclick = () => productForm(null);

function productForm(p) {
  modalContent.innerHTML = `
    <h2>${p ? 'Edit' : 'Add'} Product</h2>
    <label>Name</label>
    <input id="fpName" value="${p?.name || ''}" />
    <label>Image URL</label>
    <input id="fpImage" value="${p?.image || ''}" />
    <label>Description</label>
    <textarea id="fpDesc" rows="3">${p?.description || ''}</textarea>
    <label>Plans (Plan Name|Price — প্রতি লাইনে একটা)</label>
    <textarea id="fpPlans" rows="5" placeholder="1 Month|30&#10;3 Months|90&#10;6 Months|170">${
      (p?.plans || []).map(x => `${x.name}|${x.price}`).join('\n')
    }</textarea>
    <button class="save-btn" id="fpSave">SAVE</button>
  `;
  modal.classList.add('open');

  document.getElementById('fpSave').onclick = async () => {
    const plansText = document.getElementById('fpPlans').value.trim();
    const plans = plansText
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean)
      .map(l => {
        const parts = l.split('|');
        return { name: parts[0].trim(), price: Number(parts[1]) || 0 };
      });

    const data = {
      name: document.getElementById('fpName').value.trim(),
      image: document.getElementById('fpImage').value.trim(),
      description: document.getElementById('fpDesc').value.trim(),
      plans
    };

    if (!data.name || !data.image) {
      alert('Name & Image URL দিন');
      return;
    }

    try {
      if (p) await updateProduct(p.id, data);
      else await addProduct(data);
      modal.classList.remove('open');
      load();
    } catch (err) {
      console.error(err);
      alert('Save failed: ' + err.message);
    }
  };
}

load();
