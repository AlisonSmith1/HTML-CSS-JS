const productId = localStorage.getItem("productId");
const user = JSON.parse(localStorage.getItem("user") || "{}");
const userId = parseInt(user.id);

// 載入商品資料到表單
async function fetchEditProduct() {
  try {
    const token = localStorage.getItem("token")?.replace("Bearer ", "");
    const res = await fetch(
      `https://html-css-js-production.up.railway.app/api/commodity/editProduct/${productId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!res.ok) throw new Error("伺服器回應錯誤");

    const data = await res.json();
    const product = data.product[0] || data.product;

    if (product) {
      document.getElementById("name").value = product.name || "";
      document.getElementById("price").value = product.price || "";
      document.getElementById("description").value = product.description || "";
      // 不預設 image_url（讓使用者自己選圖片）
      document.getElementById("stock").value = product.stock || "";
      document.getElementById("sort").value = product.category_id || "";
    } else {
      console.warn("找不到商品資料");
    }
  } catch (error) {
    console.error("載入商品資料時發生錯誤：", error);
  }
}

// 提交編輯商品
document.getElementById("edit-btn").addEventListener("click", async (e) => {
  e.preventDefault();
  const token = localStorage.getItem("token")?.replace("Bearer ", "");

  const product = {
    name: document.getElementById("name").value.trim(),
    price: parseFloat(document.getElementById("price").value) || 0,
    description: document.getElementById("description").value.trim(),
    image_url: document.getElementById("image_url").value.trim(), // ✅ 正確抓圖片網址
    stock: parseInt(document.getElementById("stock").value) || 0,
    category_id: document.getElementById("sort").value,
  };

  try {
    const res = await fetch(
      `https://html-css-js-production.up.railway.app/api/commodity/patchProduct/${productId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(product),
      }
    );

    const data = await res.json();
    if (res.ok) {
      showNotification("商品更新成功", "success");
      setTimeout(() => {
        window.location.href = "/app/index.html";
      }, 500);
    } else {
      showNotification(data.error || "更新失敗", "error");
    }
  } catch (err) {
    console.error("編輯商品錯誤：", err);
    showNotification("編輯錯誤", "error");
  }
});

// 顯示通知訊息
function showNotification(message, type = "error") {
  const notification = document.getElementById("notification");
  notification.textContent = message;
  notification.className = `notification ${type}`;
  notification.style.display = "block";
  setTimeout(() => {
    notification.style.display = "none";
  }, 3000);
}

// 上傳圖片（不含預覽）
function setupImageUploadHandler() {
  document.getElementById("upload-btn").addEventListener("click", async (e) => {
    e.preventDefault();
    const input = document.getElementById("image");
    const file = input.files[0];

    if (!file) {
      alert("請先選擇圖片");
      return;
    }

    const img = new Image();
    img.onload = async function () {
      if (img.width > 1024 || img.height > 1024) {
        alert("圖片尺寸過大，請上傳 1024x1024 以下的圖片");
        document.getElementById("image").value = "";
        return;
      }

      const formData = new FormData();
      formData.append("image", file);

      try {
        const res = await fetch(
          "https://html-css-js-production.up.railway.app/api/upload",
          {
            method: "POST",
            body: formData,
          }
        );

        if (!res.ok) {
          const errMsg = await res.text();
          throw new Error(`圖片上傳失敗: ${errMsg}`);
        }

        const result = await res.json();
        const fullUrl = `https://html-css-js-production.up.railway.app${result.url}`;
        document.getElementById("image_url").value = fullUrl;
        alert("圖片上傳成功！");
      } catch (error) {
        console.error("圖片上傳失敗：", error);
        alert(`圖片上傳失敗：${error.message}`);
      }
    };

    img.src = URL.createObjectURL(file);
  });
}

// 初始化
fetchEditProduct();
setupImageUploadHandler();
