document.getElementById("search-btn").addEventListener("click", async () => {
  const keyword = document.getElementById("search-input").value.trim();
  const token = localStorage.getItem("token")?.replace("Bearer ", "");
  const ordersList = document.getElementById("orders-list");
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user.id;

  try {
    const res = await fetch(
      `http://localhost:3000/api/commodity/searchOrders?keyword=${encodeURIComponent(
        keyword
      )}&owner_id=${userId}`,
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
      li.innerHTML = `
        <strong>訂單編號：</strong> ${order.order_id}<br>
        <strong>姓名：</strong> ${order.name}<br>
        <strong>日期：</strong> ${order.date || "無日期"}<br>
        <strong>付款方式：</strong> ${order.payment}<br>
        <strong>總金額：</strong> NT$${order.total}<br>
        <a href="ordersDetail.html?order_id=${order.order_id}">查看詳情</a> |
        <a href="#" class="delete-btn" data-id="${order.order_id}">刪除</button>
      `;
      ordersList.appendChild(li);
    });
  } catch (err) {
    console.error(err);
  }
});

document.getElementById("orders-list").addEventListener("click", async (e) => {
  if (e.target.classList.contains("delete-btn")) {
    const orderId = e.target.dataset.id;
    const token = localStorage.getItem("token")?.replace("Bearer ", "");

    if (confirm("確定要刪除嗎？")) {
      try {
        const res = await fetch(
          `http://localhost:3000/api/commodity/ordersDelete`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ order_id: orderId }),
          }
        );

        const result = await res.json();
        alert(result.message || "刪除成功");
        e.target.closest("li").remove(); // 從畫面移除
      } catch (err) {
        console.error("刪除失敗:", err);
        alert("刪除失敗");
      }
    }
  }
});
