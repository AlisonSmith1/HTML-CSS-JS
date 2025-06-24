// login.js
document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault(); // 防止表單自己跳轉刷新頁面

  const formData = new FormData(e.target);
  const email = formData.get("email");
  const password = formData.get("password");

  try {
    const res = await fetch("http://localhost:3000/api/user/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      // 登入成功，可以儲存 token 或跳轉頁面
      alert(data.message);
      // 例如存 token 到 localStorage:
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // 跳轉到會員頁或首頁
      window.location.href = "/app/index.html";
    } else {
      // 登入失敗，顯示錯誤訊息
      document.getElementById("error-message").textContent =
        data.error || "登入失敗";
    }
  } catch (err) {
    document.getElementById("error-message").textContent =
      "伺服器錯誤，請稍後再試";
  }
});
