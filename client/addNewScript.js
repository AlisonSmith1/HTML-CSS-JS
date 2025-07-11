// 新的-可
import { API_URL } from "./service/auth.service.js";
import { app } from "./service/app.service.js";
let imageUrl = "";

// 監聽表單送出
async function setupProductFormHandler() {
  document
    .getElementById("add-product-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = new FormData(e.target);

      // 整理商品資料
      const product = {
        name: formData.get("name"),
        price: parseInt(formData.get("price")),
        description: formData.get("description"),
        image_url: imageUrl,
        stock: parseInt(formData.get("stock")),
        category_id: formData.get("category"),
      };
      console.log(product);
      try {
        const res = await fetch(`${API_URL}/api/commodity/post`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage
              .getItem("token")
              ?.replace("Bearer ", "")}`,
          },
          body: JSON.stringify(product),
        });

        const data = await res.json();
        console.log(data);

        if (res.ok) {
          alert("商品新增成功！");
          e.target.reset();
          imageUrl = "";
          document.getElementById("image-preview").style.display = "none";
          window.location.href = `/${app}/index.html`;
        } else if (!imageUrl) {
          alert("請上傳圖片檔案");
          return;
        } else {
          alert("新增失敗：" + data.message);
        }
      } catch (error) {
        console.error("新增商品失敗：", error);
        alert("新增商品失敗，請稍後再試");
      }
    });
}
// 監聽上傳圖片按鈕
async function setupImageUploadHandler() {
  document.getElementById("upload-btn").addEventListener("click", async (e) => {
    const input = document.getElementById("image");
    const file = input.files[0];

    if (!file) {
      alert("請上傳圖片檔案");
      return;
    }

    // 先建立 Image 物件來檢查尺寸
    const img = new Image();
    img.onload = async function () {
      const width = img.width;
      const height = img.height;

      if (width > 1024 || height > 1024) {
        alert("圖片尺寸過大，請上傳 1024x1024 以下的圖片");
        document.getElementById("image").value = "";
        return;
      }

      // 通過尺寸檢查，才開始上傳
      const formData = new FormData();
      formData.append("image", file);

      try {
        const res = await fetch(
          `https://html-css-js-production.up.railway.app/api/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        console.log(res);
        if (!res.ok) {
          const errMsg = await res.text();
          console.error("錯誤訊息：", errMsg);
          throw new Error(`圖片上傳失敗: ${errMsg}`);
        }

        const result = await res.json();
        console.log("上傳成功：", result);
        imageUrl = result.url;

        console.log(imageUrl);
        document.getElementById("image_url").value = imageUrl;

        const preview = document.getElementById("image-preview");
        preview.src = imageUrl;
        preview.style.display = "block";

        alert("圖片上傳成功！");
      } catch (error) {
        console.error("圖片上傳失敗：", error);
      }
    };
    img.src = URL.createObjectURL(file);
  });
}

window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("image-preview").style.display = "none";
  setupProductFormHandler();
  setupImageUploadHandler();
});

// // 舊的:
// import { API_URL } from "./service/auth.service.js";
// import { app } from "./service/app.service.js";
// let imageUrl = "";

// // 監聽表單送出
// async function setupProductFormHandler() {
//   document
//     .getElementById("add-product-form")
//     .addEventListener("submit", async (e) => {
//       e.preventDefault();

//       const formData = new FormData(e.target);

//       // 整理商品資料
//       const product = {
//         name: formData.get("name"),
//         price: parseInt(formData.get("price")),
//         description: formData.get("description"),
//         image_url: formData.get("image_url"),
//         stock: parseInt(formData.get("stock")),
//         category_id: formData.get("category"),
//       };
//       console.log(product);
//       try {
//         const res = await fetch(`${API_URL}/api/commodity/post`, {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${localStorage
//               .getItem("token")
//               ?.replace("Bearer ", "")}`,
//           },
//           body: JSON.stringify(product),
//         });

//         const data = await res.json();
//         console.log(data);

//         if (res.ok) {
//           alert("商品新增成功！");
//           e.target.reset();
//           imageUrl = "";
//           document.getElementById("image-preview").style.display = "none";
//           window.location.href = `/${app}/index.html`;
//         } else {
//           alert("新增失敗：" + data.message);
//         }
//       } catch (error) {
//         console.error("新增商品失敗：", error);
//         alert("新增商品失敗，請稍後再試");
//       }
//     });
// }
// // 監聽上傳圖片按鈕
// async function setupImageUploadHandler() {
//   document.getElementById("upload-btn").addEventListener("click", async (e) => {
//     const input = document.getElementById("image");
//     const file = input.files[0];

//     if (!file) {
//       alert("請先選擇圖片");
//       return;
//     }

//     // 先建立 Image 物件來檢查尺寸
//     const img = new Image();
//     img.onload = async function () {
//       const width = img.width;
//       const height = img.height;

//       if (width > 1024 || height > 1024) {
//         alert("圖片尺寸過大，請上傳 1024x1024 以下的圖片");
//         document.getElementById("image").value = "";
//         return;
//       }

//       // 通過尺寸檢查，才開始上傳
//       const formData = new FormData();
//       formData.append("image", file);

//       try {
//         const res = await fetch(`${API_URL}/api/upload`, {
//           method: "POST",
//           body: formData,
//         });

//         if (!res.ok) {
//           const errMsg = await res.text();
//           throw new Error(`圖片上傳失敗: ${errMsg}`);
//         }

//         const result = await res.json();

//         imageUrl = `${API_URL}${result.url}`;
//         document.getElementById("image_url").value = imageUrl;

//         const preview = document.getElementById("image-preview");
//         preview.src = imageUrl;
//         preview.style.display = "block";

//         alert("圖片上傳成功！");
//       } catch (error) {
//         console.error("圖片上傳失敗：", error);
//         alert(`圖片上傳失敗：${error.message}`);
//       }
//     };

//     img.src = URL.createObjectURL(file);
//   });
// }

// window.addEventListener("DOMContentLoaded", () => {
//   document.getElementById("image-preview").style.display = "none";
//   setupProductFormHandler();
//   setupImageUploadHandler();
// });
