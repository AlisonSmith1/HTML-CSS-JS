import { API_URL } from "./service/auth.service.js";
import { app } from "./service/app.service.js";

document.getElementById("search-btn").addEventListener("click", async () => {
  const keyword = document.getElementById("search-input").value.trim();
  const token = localStorage.getItem("token")?.replace("Bearer ", "");
  const ordersList = document.getElementById("orders-list");
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;

  try {
    const res = await fetch(
      `${API_URL}/api/commodity/searchPurchaseRecord?keyword=${encodeURIComponent(
        keyword
      )}&userId=${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const results = await res.json();
    console.log(results);

    ordersList.innerHTML = "";

    if (!results || results.length === 0) {
      ordersList.innerHTML = "<p>查無訂單</p>";
      return;
    }

    results.forEach((order) => {
      const li = document.createElement("li");
      console.log(order);
      li.innerHTML = `
        <strong>訂單編號：</strong> ${order.order_id}<br>
        <strong>姓名：</strong> ${order.name}<br>
        <strong>總金額：</strong> NT$${order.total}<br>
        <strong>訂購日期：</strong> ${order.date || "無日期"}<br>
        <a href="purchaseRecordDetail.html?order_id=${
          order.order_id
        }">查看詳情</a>
 
      `;

      ordersList.appendChild(li);
    });
  } catch (err) {
    console.error(err);
    // showNotification("error");
  }
});
