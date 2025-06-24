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
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json()); // 確保能解析 JSON 請求
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public"))); // 讓 /uploads 可被存取
app.use(passport.initialize());

app.use("/", express.static(path.join(__dirname, "../intro")));
app.use("/app", express.static(path.join(__dirname, "../client")));

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
