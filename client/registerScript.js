const form = document.getElementById("registerForm");
const messageDiv = document.getElementById("message");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    name: document.getElementById("name").value,
    phone: document.getElementById("phone").value,
    password: document.getElementById("password").value,
    email: document.getElementById("email").value,
    address: document.getElementById("address").value,
  };

  try {
    const res = await fetch("http://localhost:3000/api/user/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (!res.ok) {
      // 伺服器回傳 400、500 等錯誤狀態時處理
      document.getElementById("error").innerText = `錯誤：${
        result.error || "未知錯誤"
      }`;
      return;
    }

    console.log("註冊成功，導向登入頁");
    window.location.href = "/app/login.html";
  } catch (err) {
    console.error("註冊時發生錯誤：", err);
  }
});
