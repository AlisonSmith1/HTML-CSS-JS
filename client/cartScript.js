import { API_URL } from "./service/auth.service.js";
import { app } from "./service/app.service.js";

const tbody = document.querySelector("#cart-table tbody");
const totalAmountEl = document.getElementById("total-amount");
let cart = [];
const user = JSON.parse(localStorage.getItem("user"));
const userId = parseInt(user.id);
console.log(user);

async function fetchCart() {
  const token = localStorage.getItem("token")?.replace("Bearer ", "");

  if (!userId || !token) {
    alert("缺少使用者資訊，請重新登入。");
    return;
  }
  //拿到資料
  try {
    const res = await fetch(`${API_URL}/api/commodity/getCartItems`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error("無法獲取購物車資料");
    }

    cart = await res.json();
    console.log("購物車內容:", cart);
    renderCart();
  } catch (err) {
    console.error("error:", err);
  }
}

function renderCart() {
  tbody.innerHTML = "";
  let total = 0;

  cart.forEach((item, index) => {
    const subtotal = item.price * item.quantity;
    total += subtotal;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.name}</td>
      <td>${item.price}</td>
      <td>
        <input type="number" class="quantity-input" data-index="${index}" value="${item.quantity}" min="1" />
      </td>
      <td>${subtotal}</td>
      <td><button class="remove-btn" data-index="${index}">刪除</button></td>
    `;
    tbody.appendChild(row);
  });

  totalAmountEl.textContent = `總金額:NT${total}`;

  //刪除;
  document.querySelectorAll(".remove-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const index = e.target.dataset.index;
      const cartItems = cart[index];

      // 刪除資料庫內容
      try {
        await fetch(
          `${API_URL}/api/commodity/deleteCartItem/${cartItems.product_id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${localStorage
                .getItem("token")
                ?.replace("Bearer ", "")}`,
            },
          }
        );

        cart.splice(index, 1);
        renderCart();
      } catch (err) {
        console.error("刪除購物車項目時出錯:", err);
        alert("刪除失敗，請稍後再試");
      }
    });
  });

  //  改數量
  document.querySelectorAll(".quantity-input").forEach((input) => {
    input.addEventListener("change", async (e) => {
      const index = e.target.dataset.index;
      const newQuantity = parseInt(e.target.value);

      if (!Number.isInteger(newQuantity) || newQuantity <= 0) {
        alert("請輸入有效的數量");
        e.target.value = cart[index].quantity; // 回復原本數量
        return;
      }

      const itemId = cart[index]?.id;

      if (!itemId) {
        console.error("找不到該商品的 cart item ID");
        return;
      }

      try {
        // 更新資料
        const res = await fetch(
          `${API_URL}/api/commodity/patchCartItem/${itemId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage
                .getItem("token")
                ?.replace("Bearer ", "")}`,
            },
            body: JSON.stringify({ quantity: newQuantity }),
          }
        );

        if (!res.ok) {
          throw new Error("更新數量失敗");
        }

        // 更新本地資料並重新渲染
        cart[index].quantity = newQuantity;
        renderCart();
      } catch (err) {
        console.error("更新數量時出錯:", err);
        alert("更新失敗，請稍後再試");
      }
    });
  });
}

document.getElementById("checkout-btn").addEventListener("click", () => {
  if (cart.length === 0) {
    alert("購物車是空的！");
    return;
  } else {
    window.location.href = `/${app}/order.html`;
  }
});

fetchCart();
