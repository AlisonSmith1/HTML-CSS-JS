const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "kainingyang22@gmail.com",
    pass: "mssk xuya xqus vdeo",
  },
});

async function sendRegisterEmail(to, name) {
  const mailOptions = {
    from: '"作品" <kainingyang22@gmail.com>',
    to: "kainingyang22@gmail.com",
    subject: "歡迎註冊！",
    html: `<h3>Hi ${name}，歡迎加入我們網站！</h3><p>感謝你的註冊，我們會努力提供最好的服務。</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("✅ 郵件已寄出");
  } catch (err) {
    console.error("❌ 寄送郵件失敗：", err);
  }
}

// 範例呼叫
sendRegisterEmail("user@example.com", "用戶名稱");
