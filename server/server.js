// server.js
const express = require("express");
const cors = require("cors");
const app = express();
const homepage = require("./routes/homepage");
const authRouter = require("./routes/authRouter");
const commodityRouter = require("./routes/commodityRouter");
const uploadRoute = require("./routes/uploadRouter");
const dotenv = require("dotenv");
dotenv.config();
const path = require("path");
const passport = require("passport");
require("./config/passport")(passport);
app.use(passport.initialize());
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json()); // 確保能解析 JSON 請求
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public"))); // 讓 /uploads 可被存取
app.get("/favicon.ico", (req, res) => res.status(204).end());

app.use(express.static(path.join(__dirname, "../intro"))); // 或 client/public 等
// ✅ 加入開場動畫首頁（Opening.html）→ 進入網址根目錄 /
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../intro/Opening.html"));
});

// ✅ 提供前端應用（如 client/index.html）
app.use("/app", express.static(path.join(__dirname, "../client")));
app.get("/app", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/index.html"));
});

// 路由設定
app.use("/api", uploadRoute); // 接住 /api/upload 請求
app.use("/api/user", authRouter);
app.use(
  "/api/commodity",
  passport.authenticate("jwt", { session: false }),
  commodityRouter
);
app.use("/homepage", homepage);
app.listen(port, () => {
  console.log(`伺服器已啟動：http://localhost:${port}`);
});
