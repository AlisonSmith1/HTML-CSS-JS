import { API_URL } from "./service/auth.service.js";
import { app } from "./service/app.service.js";

const params = new URLSearchParams(window.location.search);
const product_id = params.get("id");

async function fetchProduct() {
  try {
    const res = await fetch(`${API_URL}/homepage/${product_id}`);

    if (res.status === 401) {
      throw new Error("未授權，請重新登入");
    }

    const product = await res.json(); // 取得商品資料
    console.log(product);
    const detail = document.getElementById("product-detail");

    detail.innerHTML = `
          <img src="${product.image_url}" alt="${product.name}" style="max-width:300px;" />
          <h2>${product.name}</h2>
          <p>描述:${product.description}</p>
          <p>數量：${product.stock}</p>
          <p>分類：${product.category_id}</p>
          <p><strong>NT$${product.price}</strong></p>
          <button id="add-to-cart-btn">加入購物車</button>
        `;
    document
      .getElementById("add-to-cart-btn")
      .addEventListener("click", (e) => {
        e.stopPropagation();
        e.preventDefault();
        addToCartHandler(product.product_id);
      });
  } catch (err) {
    console.error("取得商品失敗：", err);
    document.getElementById("product-detail").textContent = "找不到該商品";
  }
}

async function addToCartHandler(id) {
  const token = localStorage.getItem("token")?.replace("Bearer ", "");

  if (!token) {
    showNotification("請先登入才能加入購物車", "error");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/api/commodity/cart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        product_id: id,
        quantity: 1,
      }),
    });

    const result = await res.json();

    if (res.ok) {
      showNotification("已加入購物車！", "success");
    } else {
      showNotification("加入購物車失敗：" + result.error, "error");
    }
  } catch (err) {
    console.error("加入購物車失敗：", err);
    showNotification("加入購物車失敗，請稍後再試", "error");
  }
}

function showNotification(message, type = "sussess") {
  const notification = document.getElementById("notification");
  notification.textContent = message;
  notification.className = `notification ${type}`;
  notification.style.display = "block";

  setTimeout(() => {
    notification.style.display = "none";
  }, 1000);
}

fetchProduct();
