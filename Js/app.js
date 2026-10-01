import { getProducts, getBanners, getSettings } from './data.js';

let banners = [], bannerIndex = 0, bannerTimer;

async function init() {
  try {
    const settings = await getSettings();
    document.getElementById('footerName').textContent =
      (settings.siteName || 'CRAZY FLIP') + ' © 2026';
    document.title = settings.siteName || 'CRAZY FLIP';
    if (settings.logo) {
      document.getElementById('siteLogo').innerHTML =
        `<img src="${settings.logo}" style="height:32px" alt="logo"/>`;
    }
    banners = await getBanners();
    renderBanners();
    const products = await getProducts();
    renderProducts(products.slice(0, 8));
  } catch (e) {
    console.error(e);
    document.getElementById('productsGrid').innerHTML =
      '<div class="loading">Firebase connection failed. Check config & rules.</div>';
  }
}

function renderBanners() {
  const el = document.getElementById('bannerSlider');
  if (!banners.length) return;
  el.innerHTML = banners.map((b, i) => `
    <div class="banner-slide ${i === 0 ? 'active' : ''}"
         style="background-image:url('${b.image}')">
      <h2>${b.title || ''}</h2>
    </div>
  `).join('') + `<div class="banner-dots">${
    banners.map((_, i) => `<span class="${i === 0 ? 'active' : ''}" data-i="${i}"></span>`).join('')
  }</div>`;
  el.querySelectorAll('.banner-dots span').forEach(dot => {
    dot.onclick = () => goBanner(+dot.dataset.i);
  });
  bannerTimer = setInterval(() => goBanner((bannerIndex + 1) % banners.length), 4000);
}
function goBanner(i) {
  bannerIndex = i;
  document.querySelectorAll('.banner-slide').forEach((s, idx) =>
    s.classList.toggle('active', idx === i));
  document.querySelectorAll('.banner-dots span').forEach((d, idx) =>
    d.classList.toggle('active', idx === i));
}

function renderProducts(list) {
  const grid = document.getElementById('productsGrid');
  if (!list.length) {
    grid.innerHTML = '<div class="loading">No products yet.</div>';
    return;
  }
  grid.innerHTML = list.map((p, i) => `
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
}

init();
