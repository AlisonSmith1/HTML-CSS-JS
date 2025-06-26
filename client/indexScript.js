import { API_URL } from "./service/auth.service.js";
import { app } from "./service/app.service.js";

const slides = document.querySelectorAll(".slide");
const prevBtn = document.querySelector(".prev");
const nextBtn = document.querySelector(".next");
let currentIndex = 0;

function showSlide(index) {
  slides.forEach((slide, i) => {
    slide.classList.toggle("active", i === index);
  });
}

function nextSlide() {
  currentIndex = (currentIndex + 1) % slides.length;
  showSlide(currentIndex);
}

function prevSlide() {
  currentIndex = (currentIndex - 1 + slides.length) % slides.length;
  showSlide(currentIndex);
}

nextBtn.addEventListener("click", nextSlide);
prevBtn.addEventListener("click", prevSlide);

// 自動輪播
setInterval(nextSlide, 6000);

// 初始化
showSlide(currentIndex);

function showProductsByCategory(category) {
  const allProducts = document.querySelectorAll(".product-card");
  allProducts.forEach((card) => {
    if (category === "all" || card.dataset.category === category) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });
}

async function fetchProducts() {
  try {
    const res = await fetch(`${API_URL}/homepage/index`);
    const products = await res.json();
    const container = document.getElementById("product-list");

    container.innerHTML = "";

    products.forEach((product) => {
      const card = document.createElement("div");
      card.className = "card product-card";
      card.dataset.category = product.category_id;

      card.innerHTML = `
        <a href="/${app}/product.html?id=${product.product_id}" class="card-link">
          <img src="${product.image_url}" alt="${product.name}" style="max-width: 280px; max-height: 280px; object-fit: contain;"/>
          <h2>${product.name}</h2>
          <p>數量:${product.stock}</p>
          <p><strong>價格:NT$${product.price}</strong></p>
        </a>
        <button class="add-to-cart-btn">加入購物車</button>
      `;

      card.querySelector(".add-to-cart-btn").addEventListener("click", (e) => {
        e.stopPropagation();
        e.preventDefault();
        addToCartHandler(product.product_id);
      });

      container.appendChild(card);
    });

    // ✅ 加在這裡：商品都建立完後再綁分類按鈕
    const buttons = document.querySelectorAll(".category-btn");
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        // 移除所有 active
        buttons.forEach((b) => b.classList.remove("active"));
        // 加到目前按的
        btn.classList.add("active");

        const category = btn.dataset.category;
        showProductsByCategory(category);
      });
    });

    // 預設高亮第一個（全部）
    buttons[0].classList.add("active");
    showProductsByCategory("all");
  } catch (err) {
    console.error("取得商品失敗：", err);
  }
}

async function addToCartHandler(id) {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user || !user.id) {
    showNotification("找不到使用者資訊，請重新登入", "error");
    return;
  }
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

function showNotification(message, type = "error") {
  const notification = document.getElementById("notification");
  notification.textContent = message;
  notification.className = `notification ${type}`;
  notification.style.display = "block";

  setTimeout(() => {
    notification.style.display = "none";
  }, 3000);
}

function checkCartBtnState() {
  const viewCartBtn = document.getElementById("view-cart-btn");
  if (!viewCartBtn) return;

  viewCartBtn.addEventListener("click", () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      showNotification("請先登入才能查看購物車", "error");
      return;
    }
    window.location.href = `/${app}/cart.html`;
  });
}

function checkPostAnchorState() {
  const addProductLink = document.getElementById("add-product-link");
  if (!addProductLink) return;

  addProductLink.addEventListener("click", function (e) {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      showNotification("請先登入才能新增商品", "error");
      return;
    }
    window.location.href = `/${app}/addNew.html`;
  });
}

function checkMyProductsState() {
  const myProductLink = document.getElementById("my-products-link");
  if (!myProductLink) return;

  myProductLink.addEventListener("click", function (e) {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      showNotification("請先登入才能查看商品", "error");
      return;
    }
    window.location.href = `/${app}/myProducts.html`;
  });
}
async function checkLoginState() {
  document.getElementById("logout-link")?.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    location.reload();
  });
}

document.getElementById("search-btn").addEventListener("click", async () => {
  const keyword = document.getElementById("search-input").value.trim();
  const token = localStorage.getItem("token")?.replace("Bearer ", "");

  try {
    const res = await fetch(
      `${API_URL}/api/commodity/search?keyword=${encodeURIComponent(keyword)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const results = await res.json();

    const container = document.getElementById("product-list");
    container.innerHTML = ""; // 清空原本商品

    if (results.length === 0) {
      container.innerHTML = "<p>沒有找到相關商品</p>";
      return;
    }

    results.forEach((product) => {
      const card = document.createElement("div");
      card.className = "card product-card"; // 一定要加 product-card
      card.dataset.category = product.category_id; // 一定要設定分類屬性

      card.innerHTML = `
        <a href="/${app}/product.html?id=${product.product_id}" class="card-link">
          <img src="${product.image_url}" alt="${product.name}" style="max-width: 280px; max-height: 280px; object-fit: contain;" />
          <h2>${product.name}</h2>
          <p>數量:${product.stock}</p>
          <p><strong>價格:NT$${product.price}</strong></p>
        </a>
        <button class="add-to-cart-btn">加入購物車</button>
      `;

      card.querySelector(".add-to-cart-btn").addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        addToCartHandler(product.product_id);
      });

      container.appendChild(card);
    });
  } catch (err) {
    console.error("搜尋錯誤：", err);
    alert("搜尋失敗，請稍後再試");
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.getElementById("hamburger");
  const menu = document.getElementById("header-right");

  hamburger.addEventListener("click", () => {
    menu.classList.toggle("active");
  });

  checkPostAnchorState();
  checkMyProductsState();
  checkCartBtnState(); // 儘早綁定事件
  fetchProducts(); // 然後才 fetch 商品
  checkLoginState();
});
