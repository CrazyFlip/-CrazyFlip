import { getProducts, getSettings, addOrder, generateOrderId } from './data.js';

const params = new URLSearchParams(window.location.search);
const productId = params.get('id');
const planIndex = Number(params.get('planIndex') || 0);

let currentProduct = null;
let currentPlan = null;
let settings = {};

(async () => {
  const wrap = document.getElementById('paymentWrap');
  if (!productId) {
    wrap.innerHTML = '<div class="loading">Invalid request.</div>';
    return;
  }
  try {
    settings = await getSettings();
    const products = await getProducts();
    currentProduct = products.find(p => p.id === productId);
    if (!currentProduct || !currentProduct.plans?.[planIndex]) {
      wrap.innerHTML = '<div class="loading">Product or plan not found.</div>';
      return;
    }
    currentPlan = currentProduct.plans[planIndex];
    renderPayment();
  } catch (e) {
    console.error(e);
    wrap.innerHTML = '<div class="loading">Failed to load. Check connection.</div>';
  }
})();

function renderPayment() {
  const wrap = document.getElementById('paymentWrap');
  wrap.innerHTML = `
    <h2 class="pay-title">PAYMENT</h2>

    <div class="pay-info">
      <div class="pay-row"><span>Product</span><b>${currentProduct.name}</b></div>
      <div class="pay-row"><span>Plan</span><b>${currentPlan.name}</b></div>
      <div class="pay-row"><span>Total Price</span><b>GH₵ ${currentPlan.price}</b></div>
      <div class="pay-row"><span>Method</span><b>Ghana Cedis (GHS)</b></div>
    </div>

    <div class="pay-box">
      <p style="color:#bbb; font-size:13px; margin-bottom:12px; font-weight:500">
        ${settings.paymentText || 'Send money to the number below, then enter your details.'}
      </p>
      <div class="momo-row">
        <span>MoMo Number</span><b id="momoNum">${settings.momoNumber || '-'}</b>
        <button class="copy-btn" id="copyMomo">COPY</button>
      </div>
      <div class="momo-row">
        <span>Account Name</span><b>${settings.accountName || '-'}</b>
      </div>
    </div>

    <div class="form-group">
      <label>YOUR WHATSAPP NUMBER</label>
      <input id="inpWhatsapp" type="text" placeholder="+233XXXXXXXXX" />
    </div>
    <div class="form-group">
      <label>TRANSACTION ID</label>
      <input id="inpTxid" type="text" placeholder="TX123456" />
    </div>

    <div class="confirm-buttons">
      <button class="btn-primary" id="btnWhatsapp">CONFIRM VIA WHATSAPP</button>
      <button class="btn-secondary" id="btnTelegram">CONFIRM VIA TELEGRAM</button>
    </div>
  `;

  document.getElementById('copyMomo').onclick = () => {
    navigator.clipboard.writeText(settings.momoNumber || '');
    const b = document.getElementById('copyMomo');
    b.textContent = 'COPIED!';
    setTimeout(() => b.textContent = 'COPY', 1500);
  };

  document.getElementById('btnWhatsapp').onclick = () => confirmOrder('WhatsApp');
  document.getElementById('btnTelegram').onclick = () => confirmOrder('Telegram');
}

async function confirmOrder(source) {
  const wp = document.getElementById('inpWhatsapp').value.trim();
  const tx = document.getElementById('inpTxid').value.trim();
  if (!wp || !tx) return alert('WhatsApp number & Transaction ID দিন!');

  const now = new Date();
  const dateStr = now.toLocaleString('en-GB', {
    day:'2-digit', month:'2-digit', year:'numeric',
    hour:'2-digit', minute:'2-digit'
  });

  const orderId = await generateOrderId();

  const orderData = {
    orderId,
    product: currentProduct.name,
    plan: currentPlan.name,
    price: currentPlan.price,
    whatsappNumber: wp,
    transactionId: tx,
    date: dateStr,
    status: 'Pending',
    source: source,
    createdAt: Date.now()
  };

  await addOrder(orderData);

  const msg =
`Order ID: ${orderId}

Product: ${currentProduct.name}
Plan: ${currentPlan.name}
Price: GH₵ ${currentPlan.price}

WhatsApp Number:
${wp}

Transaction ID:
${tx}`;

  const encoded = encodeURIComponent(msg);

  if (source === 'WhatsApp') {
    const num = (settings.whatsapp || '').replace(/\D/g, '');
    if (!num) {
      alert('Order saved! But admin WhatsApp number set করা নেই।');
      return;
    }
    window.open(`https://wa.me/${num}?text=${encoded}`, '_blank');
  } else {
    const tg = (settings.telegram || '').replace('@', '');
    if (!tg) {
      alert('Order saved! But admin Telegram set করা নেই।');
      return;
    }
    navigator.clipboard.writeText(msg);
    window.open(`https://t.me/${tg}`, '_blank');
    setTimeout(() => alert('Order saved! Telegram এ message paste করে পাঠান।'), 500);
  }

  setTimeout(() => {
    window.location.href = 'index.html';
  }, 1500);
}
