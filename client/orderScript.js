const cartItemsEl = document.getElementById("cart-items");
const totalAmountEl = document.getElementById("total-amount");
// 取得使用者 ID
const user = JSON.parse(localStorage.getItem("user"));
const userId = parseInt(user.id);

let cart = [];
let totalPrice = 0;
async function fetchOrder() {
  const token = localStorage.getItem("token")?.replace("Bearer ", "");
  try {
    const res = await fetch(
      `https://html-css-js-production.up.railway.app/api/commodity/getOrder`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      throw new Error("伺服器回應錯誤");
    }

    cart = await res.json(); // 存起來
    console.log("購物車內容:", cart);

    let total = 0;
    cart.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = `${item.name} - NT$${item.price} x ${item.quantity}`;
      cartItemsEl.appendChild(li);
      total += item.price * item.quantity;
    });
    totalPrice = total; // 儲存供表單送出用
    totalAmountEl.textContent = `總金額：NT$${total}`;
  } catch (err) {
    console.error("無法讀取購物車資料:", err);
    alert("無法讀取購物車資料，請稍後再試。");
  }
}

fetchOrder();

// 驗證函式
function validateOrderForm(formData) {
  const errors = {};

  if (!formData.name || formData.name.trim() === "") {
    errors.name = "請輸入姓名";
  }

  if (!formData.address || formData.address.trim().length < 5) {
    errors.address = "請輸入完整地址（至少5字）";
  }

  if (!formData.phone || !/^\d{8,10}$/.test(formData.phone)) {
    errors.phone = "電話號碼需為8-10位數字";
  }

  if (!formData.payMethod || formData.payMethod === "") {
    errors.payMethod = "請選擇付款方式";
  }

  return errors;
}

// 顯示錯誤訊息區塊
function showErrors(errors) {
  // 清除先前錯誤訊息
  const oldErrors = document.querySelectorAll(".error-message");
  oldErrors.forEach((el) => el.remove());

  if (errors.name) {
    const nameInput = document.querySelector('input[name="name"]');
    const err = document.createElement("div");
    err.className = "error-message";
    err.style.color = "red";
    err.textContent = errors.name;
    nameInput.parentNode.appendChild(err);
  }

  if (errors.phone) {
    const phoneInput = document.querySelector('input[name="phone"]');
    const err = document.createElement("div");
    err.className = "error-message";
    err.style.color = "red";
    err.textContent = errors.phone;
    phoneInput.parentNode.appendChild(err);
  }

  if (errors.address) {
    const addressInput = document.querySelector('input[name="address"]');
    const err = document.createElement("div");
    err.className = "error-message";
    err.style.color = "red";
    err.textContent = errors.address;
    addressInput.parentNode.appendChild(err);
  }

  if (errors.payMethod) {
    const paymentSelect = document.querySelector('select[name="payment"]');
    const err = document.createElement("div");
    err.className = "error-message";
    err.style.color = "red";
    err.textContent = errors.payMethod;
    paymentSelect.parentNode.appendChild(err);
  }
}

// 表單送出處理
// 將訂單送到後端儲存
document
  .getElementById("submit-order-btn")
  .addEventListener("click", async function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const address = document.getElementById("address").value;
    const phone = document.getElementById("phone").value;
    const paymentSelect = document.querySelector('select[name="payment"]');
    const payMethod = paymentSelect ? paymentSelect.value : "";
    const formData = { name, address, phone, payMethod };
    const errors = validateOrderForm(formData);
    if (Object.keys(errors).length > 0) {
      showErrors(errors);
      return;
    }

    const order = {
      name: formData.name,
      address: formData.address,
      phone: formData.phone,
      payment: formData.payMethod,
      order_id: "OD" + Date.now(),
      date: new Date().toISOString(),
      total: totalPrice,
      items: cart,
    };
    console.log(order);

    try {
      const res = await fetch(
        `https://html-css-js-production.up.railway.app/api/commodity/order/${userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage
              .getItem("token")
              ?.replace("Bearer ", "")}`,
          },
          body: JSON.stringify(order),
        }
      );

      if (!res.ok) throw new Error("訂單送出失敗");

      const data = await res.json();
      console.log("後端回傳成功：", data);
      alert(`訂單已送出！訂單編號：${order.order_id}`);

      await reduceQuantity(cart); // 減少庫存
      await cleanCartItems(); // 清空購物車

      window.location.href = `/app/thankyou.html`;
    } catch (err) {
      console.error("送出訂單時錯誤：", err);
      alert("訂單送出失敗，請稍後再試");
    }
  });

async function reduceQuantity(cart) {
  const token = localStorage.getItem("token")?.replace("Bearer ", "");
  try {
    const res = await fetch(
      `https://html-css-js-production.up.railway.app/api/commodity/reduceQuantity/${userId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage
            .getItem("token")
            ?.replace("Bearer ", "")}`,
        },
        body: JSON.stringify({ items: cart }), // 傳送購物車商品與數量
      }
    );

    if (!res.ok) throw new Error("庫存更新失敗");

    const data = await res.json();
    console.log("庫存已更新：", data);
  } catch (err) {
    console.error("減少庫存錯誤：", err);
  }
}

async function cleanCartItems() {
  console.log("前端送出清空 userId：", userId);
  try {
    const res = await fetch(
      `https://html-css-js-production.up.railway.app/api/commodity/cleanCartItems/${userId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage
            .getItem("token")
            ?.replace("Bearer ", "")}`,
        },
      }
    );
    const data = await res.json();
    console.log("購物車已清空：", data);
  } catch (err) {
    console.error("清空購物車失敗：", err);
  }
}
