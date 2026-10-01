import { getProducts } from './data.js';

const params = new URLSearchParams(window.location.search);
const productId = params.get('id');

let currentProduct = null;
let currentPlan = null;

(async () => {
  const wrap = document.getElementById('detailWrap');
  if (!productId) {
    wrap.innerHTML = '<div class="loading">Product not found.</div>';
    return;
  }
  try {
    const products = await getProducts();
    currentProduct = products.find(p => p.id === productId);
    if (!currentProduct) {
      wrap.innerHTML = '<div class="loading">Product not found.</div>';
      return;
    }
    renderDetail();
  } catch (e) {
    console.error(e);
    wrap.innerHTML = '<div class="loading">Failed to load product.</div>';
  }
})();

function renderDetail() {
  const p = currentProduct;
  const plans = p.plans || [];
  currentPlan = plans[0] || null;

  const wrap = document.getElementById('detailWrap');
  wrap.innerHTML = `
    <img src="${p.image}" alt="${p.name}"
      onerror="this.src='https://via.placeholder.com/500x500/111/fff?text=CF'"/>
    <div class="pd-info">
      <h1>${p.name}</h1>
      <p class="pd-desc">${p.description || ''}</p>
      <h3>CHOOSE PLAN:</h3>
      <div class="plans" id="plansBox">
        ${plans.map((pl, i) => `
          <div class="plan-item ${i === 0 ? 'active' : ''}" data-i="${i}">
            <span>${pl.name}</span>
            <b>GH₵ ${pl.price}</b>
          </div>
        `).join('')}
      </div>
      <div class="pd-total">Total: <span id="totalPrice">GH₵ ${currentPlan?.price ?? 0}</span></div>
      <button class="btn-primary" id="buyNowBtn">BUY NOW</button>
    </div>
  `;

  document.querySelectorAll('.plan-item').forEach(item => {
    item.onclick = () => {
      document.querySelectorAll('.plan-item').forEach(x => x.classList.remove('active'));
      item.classList.add('active');
      currentPlan = plans[+item.dataset.i];
      document.getElementById('totalPrice').textContent = `GH₵ ${currentPlan.price}`;
    };
  });

  document.getElementById('buyNowBtn').onclick = () => {
    if (!currentPlan) return alert('Select a plan');
    window.location.href =
      `payment.html?id=${p.id}&planIndex=${plans.indexOf(currentPlan)}`;
  };
}
