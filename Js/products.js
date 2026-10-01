import { getProducts } from './data.js';

(async () => {
  try {
    const products = await getProducts();
    const grid = document.getElementById('productsGrid');
    if (!products.length) {
      grid.innerHTML = '<div class="loading">No products yet.</div>';
      return;
    }
    grid.innerHTML = products.map((p, i) => `
      <div class="product-card" style="animation-delay:${i * .05}s">
        <img src="${p.image}" alt="${p.name}"
          onerror="this.src='https://via.placeholder.com/300x180/111/fff?text=CF'"/>
        <div class="pc-body">
          <div class="pc-name">${p.name}</div>
          <div class="pc-price">Starting <b>GH₵ ${p.plans?.[0]?.price ?? 0}</b></div>
          <a href="product-details.html?id=${p.id}" class="btn-view">VIEW PRODUCT</a>
        </div>
      </div>
    `).join('');
  } catch (e) {
    console.error(e);
    document.getElementById('productsGrid').innerHTML =
      '<div class="loading">Failed to load products.</div>';
  }
})();
