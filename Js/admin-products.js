import { getProducts, addProduct, updateProduct, deleteProduct } from './data.js';

/* ====== ELEMENTS ====== */
const modal = document.getElementById('modal');
const modalContent = document.getElementById('modalContent');
const closeBtn = document.getElementById('modalClose');
const addBtn = document.getElementById('addProductBtn');
const listBox = document.getElementById('productsList');

/* ====== MODAL CLOSE ====== */
closeBtn.addEventListener('click', () => {
  modal.classList.remove('open');
});
modal.addEventListener('click', (e) => {
  if (e.target === modal) modal.classList.remove('open');
});

/* ====== LOAD PRODUCTS ====== */
let allProducts = [];

async function loadProducts() {
  listBox.innerHTML = '<p style="color:#666">Loading products...</p>';
  try {
    allProducts = await getProducts();
  } catch (err) {
    console.error('Load error:', err);
    listBox.innerHTML = '<p style="color:#f55">⚠️ Failed to load. Firebase connection problem.</p>';
    return;
  }

  if (!allProducts.length) {
    listBox.innerHTML = '<p style="color:#666">No products yet. Click ADD PRODUCT to add one.</p>';
    return;
  }

  listBox.innerHTML = allProducts.map(p => {
    const firstPrice = p.plans?.[0]?.price ?? 0;
    const planCount = p.plans?.length || 0;
    return `
      <div class="item-card">
        <div class="item-info">
          <h4>${p.name}</h4>
          <p>Starting: <b>GH₵ ${firstPrice}</b> · Plans: <b>${planCount}</b></p>
        </div>
        <div class="actions">
          <button class="btn-edit" data-edit="${p.id}">EDIT</button>
          <button class="btn-delete" data-del="${p.id}">DELETE</button>
        </div>
      </div>
    `;
  }).join('');

  listBox.querySelectorAll('[data-edit]').forEach(btn => {
    btn.addEventListener('click', () => {
      const prod = allProducts.find(x => x.id === btn.dataset.edit);
      if (prod) openProductForm(prod);
    });
  });

  listBox.querySelectorAll('[data-del]').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('Delete this product?')) return;
      try {
        await deleteProduct(btn.dataset.del);
        loadProducts();
      } catch (err) {
        console.error(err);
        alert('Delete failed: ' + err.message);
      }
    });
  });
}

/* ====== ADD BUTTON ====== */
addBtn.addEventListener('click', () => {
  openProductForm(null);
});

/* ====== PRODUCT FORM ====== */
function openProductForm(product) {
  const isEdit = !!product;
  const plansText = (product?.plans || [])
    .map(x => `${x.name}|${x.price}`)
    .join('\n');

  modalContent.innerHTML = `
    <h2>${isEdit ? 'Edit Product' : 'Add Product'}</h2>

    <label>Product Name</label>
    <input id="fpName" type="text" placeholder="X Premium" value="${product?.name || ''}" />

    <label>Image URL</label>
    <input id="fpImage" type="text" placeholder="https://example.com/image.jpg" value="${product?.image || ''}" />

    <label>Description</label>
    <textarea id="fpDesc" rows="3" placeholder="Short description...">${product?.description || ''}</textarea>

    <label>Plans — Format: Name|Price (প্রতি লাইনে একটা)</label>
    <textarea id="fpPlans" rows="5" placeholder="1 Month|30&#10;3 Months|90&#10;6 Months|170">${plansText}</textarea>

    <button class="save-btn" id="fpSave">SAVE PRODUCT</button>
  `;

  modal.classList.add('open');

  document.getElementById('fpSave').addEventListener('click', async () => {
    const name = document.getElementById('fpName').value.trim();
    const image = document.getElementById('fpImage').value.trim();
    const description = document.getElementById('fpDesc').value.trim();
    const plansRaw = document.getElementById('fpPlans').value.trim();

    if (!name) return alert('Product Name দিন');
    if (!image) return alert('Image URL দিন');
    if (!plansRaw) return alert('অন্তত একটা Plan দিন');

    const plans = plansRaw
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)
      .map(line => {
        const parts = line.split('|');
        return {
          name: (parts[0] || '').trim(),
          price: Number((parts[1] || '').trim()) || 0
        };
      })
      .filter(p => p.name);

    if (!plans.length) return alert('Plans ঠিকভাবে লিখুন (Name|Price)');

    const data = { name, image, description, plans };

    const btn = document.getElementById('fpSave');
    try {
      btn.textContent = 'SAVING...';
      btn.disabled = true;

      if (isEdit) {
        await updateProduct(product.id, data);
      } else {
        await addProduct(data);
      }

      modal.classList.remove('open');
      alert('✅ Product saved!');
      loadProducts();
    } catch (err) {
      console.error('Save error:', err);
      alert('❌ Save failed: ' + err.message);
      btn.textContent = 'SAVE PRODUCT';
      btn.disabled = false;
    }
  });
}

/* ====== INIT ====== */
loadProducts();
