// server.js
const express = require("express");
const cors = require("cors");
const app = express();
const { Pool } = require("pg");
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
const port = 3000;

// PostgreSQL 連線設定（請根據你的本機設定調整）
const pool = new Pool({
  user: "postgres", // PostgreSQL 使用者名稱
  host: "localhost",
  database: "shop", // 請改成你剛建立的資料庫名稱
  password: "1234", // 請改成你的密碼
  port: 5432,
});

// app.use((req, res, next) => {
//   console.log("Authorization Header:", req.headers.authorization);
//   next();
// });

app.use(cors());
app.use(express.json()); // 確保能解析 JSON 請求
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public"))); // 讓 /uploads 可被存取

app.use("/", homepage);

app.use("/api", uploadRoute); // 接住 /api/upload 請求

app.use("/api/user", authRouter);
app.use(
  "/api/commodity",
  passport.authenticate("jwt", { session: false }),
  commodityRouter
);

app.listen(port, () => {
  console.log(`伺服器已啟動：http://localhost:${port}`);
});
