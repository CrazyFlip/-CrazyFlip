import { firebaseConfig } from './firebase-config.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getDatabase, ref, set, get, push, update, remove, onValue, child
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

/* ========== PRODUCTS ========== */
export async function getProducts() {
  const snap = await get(ref(db, 'products'));
  const data = snap.val() || {};
  return Object.keys(data).map(id => ({ id, ...data[id] }));
}
export async function addProduct(data) {
  const newRef = push(ref(db, 'products'));
  await set(newRef, data);
  return newRef.key;
}
export async function updateProduct(id, data) {
  return update(ref(db, 'products/' + id), data);
}
export async function deleteProduct(id) {
  return remove(ref(db, 'products/' + id));
}

/* ========== BANNERS ========== */
export async function getBanners() {
  const snap = await get(ref(db, 'banners'));
  const data = snap.val() || {};
  return Object.keys(data).map(id => ({ id, ...data[id] }));
}
export async function addBanner(data) {
  const newRef = push(ref(db, 'banners'));
  await set(newRef, data);
  return newRef.key;
}
export async function updateBanner(id, data) {
  return update(ref(db, 'banners/' + id), data);
}
export async function deleteBanner(id) {
  return remove(ref(db, 'banners/' + id));
}

/* ========== ORDERS ========== */
export async function addOrder(data) {
  const newRef = push(ref(db, 'orders'));
  await set(newRef, data);
  return newRef.key;
}
export function listenOrders(cb) {
  return onValue(ref(db, 'orders'), snap => {
    const data = snap.val() || {};
    const orders = Object.keys(data).map(id => ({ id, ...data[id] }))
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    cb(orders);
  });
}
export async function updateOrder(id, data) {
  return update(ref(db, 'orders/' + id), data);
}
export async function deleteOrder(id) {
  return remove(ref(db, 'orders/' + id));
}
export async function generateOrderId() {
  const snap = await get(ref(db, 'orders'));
  const data = snap.val() || {};
  const count = Object.keys(data).length;
  return `CF-${1001 + count}`;
}

/* ========== SETTINGS ========== */
export async function getSettings() {
  const snap = await get(ref(db, 'settings'));
  return snap.val() || {
    siteName: "CRAZY FLIP",
    logo: "",
    momoNumber: "",
    accountName: "",
    paymentText: "Send Money to the number below, then enter your details.",
    whatsapp: "",
    telegram: ""
  };
}
export async function saveSettings(data) {
  return update(ref(db, 'settings'), data);
}
