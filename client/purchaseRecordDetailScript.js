import { API_URL } from './service/auth.service.js';

const params = new URLSearchParams(window.location.search);
const orderId = params.get('order_id');
const token = localStorage.getItem('token')?.replace('Bearer ', '');

async function fetchpurchaseRecordDetail() {
  try {
    const res = await fetch(
      `${API_URL}/api/commodity/purchaseRecordDetail/${orderId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();
    console.log(data);
    const order = data.order;
    const items = data.items;

    document.getElementById('order-info').innerHTML = `
      <p><strong>訂單編號：</strong> ${order.order_id}</p>
      <p><strong>姓名：</strong> ${order.name}</p>
      <p><strong>日期：</strong> ${order.date || '無資料'}</p>
      <p><strong>電話：</strong> ${order.phone}</p>
      <p><strong>總金額：</strong> NT$${order.total}</p>
      <p><strong>購買商品：</strong> ${items
        .map((item) => `${item.name} x${item.quantity}`)
        .join(', ')}</p>
    `;
  } catch (err) {
    console.error('載入失敗', err);
  }
}

fetchpurchaseRecordDetail();
