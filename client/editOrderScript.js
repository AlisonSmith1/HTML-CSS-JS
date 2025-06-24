// const urlParams = new URLSearchParams(window.location.search);
// const index = parseInt(urlParams.get("index"), 10);

// let orders = JSON.parse(localStorage.getItem("orders")) || [];
// const order = orders[index];

// if (!order) {
//   document.body.innerHTML = "<p>查無此訂單。</p>";
// } else {
//   document.getElementById("order-id").textContent = order.orderId;
//   const form = document.getElementById("edit-order-form");
//   form.name.value = order.name;
//   form.phone.value = order.phone || "";
//   form.address.value = order.address;

//   form.addEventListener("submit", (e) => {
//     e.preventDefault();

//     // 清除錯誤訊息
//     document.getElementById("name-error").textContent = "";
//     document.getElementById("phone-error").textContent = "";
//     document.getElementById("address-error").textContent = "";

//     const name = form.name.value.trim();
//     const phone = form.phone.value.trim();
//     const address = form.address.value.trim();
//     let valid = true;

//     if (name === "") {
//       document.getElementById("name-error").textContent = "請輸入姓名";
//       valid = false;
//     }

//     if (!/^\d{8,10}$/.test(phone)) {
//       document.getElementById("phone-error").textContent =
//         "請輸入8~10位數字電話";
//       valid = false;
//     }

//     if (address.length < 5) {
//       document.getElementById("address-error").textContent = "地址至少需5個字";
//       valid = false;
//     }

//     if (!valid) return;

//     // 更新資料
//     order.name = name;
//     order.phone = phone;
//     order.address = address;

//     orders[index] = order;
//     localStorage.setItem("orders", JSON.stringify(orders));

//     alert("訂單已更新！");
//     window.location.href = "orders.html";
//   });
// }
