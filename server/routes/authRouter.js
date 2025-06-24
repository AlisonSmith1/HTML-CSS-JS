const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const express = require("express");
const router = express.Router();
const pool = require("../db"); // 假設你是這樣引入 PostgreSQL pool
require("dotenv").config();
const jwt = require("jsonwebtoken");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

router.post("/register", async (req, res) => {
  const { name, phone, password, email, address } = req.body;

  if (!name || !phone || !password || !email || !address) {
    return res.status(400).json({ error: "請填寫所有欄位" });
  }

  try {
    const emailExist = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if (emailExist.rows.length > 0) {
      return res.status(400).json({ error: "此信箱已被註冊過" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const insertQuery = `
      INSERT INTO users (name, phone, password, email, address)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *`;
    const values = [name, phone, hashedPassword, email, address];
    const result = await pool.query(insertQuery, values);

    // ✅ 寄送註冊確認信
    await transporter.sendMail({
      from: '"網站註冊通知" <你的Gmail帳號@gmail.com>',
      to: email,
      subject: "註冊成功通知",
      html: `<p>親愛的 ${name}，您好，</p>
             <p>感謝您註冊本網站，我們很高興有您加入！</p>
             <p>如有任何問題歡迎聯繫我們。</p>`,
    });

    return res.json({
      msg: "使用者成功註冊，已寄送確認信",
      savedUser: result.rows[0],
    });
  } catch (e) {
    console.error("註冊或寄信錯誤：", e);
    return res.status(500).json({ error: e.message });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const userQuery = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  const user = userQuery.rows[0];
  if (!user) return res.status(400).json({ error: "帳號或密碼輸入錯誤" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ error: "帳號或密碼錯誤" });

  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    {
      expiresIn: "3h", //這個 token 只能用 3 小時，3 小時後就會過期，需要重新登入產生新的 token
    }
  );

  return res.json({
    message: "登入成功",
    token: "Bearer " + token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  });
});

module.exports = router;
