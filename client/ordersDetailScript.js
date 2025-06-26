document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get("order_id");
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user.id; // 商家ID
  const token = localStorage.getItem("token")?.replace("Bearer ", "");

  try {
    const res = await fetch(
      `https://html-css-js-production.up.railway.app/api/commodity/ordersDetail/${orderId}?owner_id=${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();
    const order = data;

    const items = data.items;

    // 顯示訂單資訊
    const orderInfo = document.getElementById("order-info");
    console.log(orderInfo);

    orderInfo.innerHTML = `
      <p><strong>訂單編號：</strong>${order.order_id}</p>
      <p><strong>姓名：</strong>${order.name}</p>
      <p><strong>電話：</strong>${order.phone}</p>
      <p><strong>地址：</strong>${order.address}</p>
      <p><strong>付款方式：</strong>${order.payment}</p>
      <p><strong>總金額：</strong>NT$${order.total}</p>
      <p><strong>日期：</strong>${order.date || "未提供"}</p>
    `;

    // 顯示商品列表
    const itemsList = document.getElementById("items-list"); // ✅ 正確取得 UL 容器
    itemsList.innerHTML = "";

    items.forEach((item) => {
      const li = document.createElement("li");
      li.innerHTML = `
    <strong>${item.name}</strong> - 數量：${item.quantity}，單價：NT$${item.price}
  `;
      itemsList.appendChild(li);
    });
  } catch (err) {
    console.error("載入失敗", err);
    alert("無法取得訂單詳情");
  }
});

document.getElementById("download-pdf").addEventListener("click", () => {
  const element = document.getElementById("order-content");
  html2pdf()
    .from(element)
    .set({
      margin: 1,
      filename: "訂單.pdf",
      html2canvas: { scale: 2 },
      jsPDF: { unit: "cm", format: "a4", orientation: "portrait" },
    })
    .save();
});
