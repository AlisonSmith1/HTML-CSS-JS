import { API_URL } from "./service/auth.service.js";
import { app } from "./service/app.service.js";

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token")?.replace("Bearer ", "");
  fetchMyProducts(token);
});

async function fetchMyProducts(token) {
  try {
    const res = await fetch(`${API_URL}/api/commodity/my-products`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const products = await res.json();

    if (!res.ok) {
      showNotification(products.error || "無法取得商品", "error");
      return;
    }

    const container = document.getElementById("product-list");
    container.innerHTML = "";

    if (products.length === 0) {
      container.innerHTML = "<p>目前尚未上架商品。</p>";
      return;
    }

    products.forEach((product) => {
      const card = document.createElement("div");
      card.className = "card";
      card.style.display = "flex";
      card.style.alignItems = "center";
      card.style.gap = "20px";
      card.style.border = "1px solid #ccc";
      card.style.padding = "10px";
      card.style.marginBottom = "10px";
      card.style.borderRadius = "8px";
      card.style.backgroundColor = "#f9f9f9";

      card.innerHTML = `
    <img src="${product.image_url}" alt="${product.name}" width="120" height="120" style="object-fit: cover; border-radius: 4px;" />
    <div class="info">
      <h2 style="margin: 0;">${product.name}</h2>
      <p style="margin: 5px 0;">${product.description}</p>
      <p>庫存：${product.stock}</p>
      <p>分類：${product.category_id}</p>
      <p>價格：NT$${product.price}</p>
      <button class="edit-btn">編輯</button>
      <button class="delete-btn">刪除</button>
    </div>
  `;

      card.querySelector(".edit-btn").addEventListener("click", () => {
        localStorage.setItem("productId", product.product_id);
        window.location.href = `/client/edit.html?product_id=${product.product_id}`;
      });

      card.querySelector(".delete-btn").addEventListener("click", () => {
        deleteProduct(product.product_id);
      });

      container.appendChild(card);
    });
  } catch (err) {
    console.error("取得我的商品失敗：", err);
    showNotification("伺服器錯誤", "error");
  }
}

function showNotification(message, type = "error") {
  const notification = document.getElementById("notification");
  notification.textContent = message;
  notification.className = `notification ${type}`;
  notification.style.display = "block";

  setTimeout(() => {
    notification.style.display = "none";
  }, 3000);
}

async function editProduct(productId) {
  window.location.href = `/client/edit.html/${productId}`;
}

async function deleteProduct(productId) {
  console.log(productId);
  const token = localStorage.getItem("token")?.replace("Bearer ", "");
  try {
    const res = await fetch(`${API_URL}/api/commodity/delete/${productId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      showNotification("刪除成功", "success");
      location.reload();
    } else {
      const result = await res.json();
      console.log(result);
      showNotification(result.error || "刪除失敗", "error");
    }
  } catch (err) {
    console.error("刪除商品錯誤：", err);
    showNotification("刪除錯誤", "error");
  }
}
