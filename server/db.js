const { Pool } = require("pg");
const dotenv = require("dotenv");
dotenv.config({ path: "../env" });

// 資料庫連線設定（Render 上會自動設定 DATABASE_URL）
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// const pool = new Pool({
//   user: "postgres", // 請確認你 PostgreSQL 使用者名稱
//   host: "localhost", // 不要帶 http:// 和 port
//   database: "shop",
//   password: "1234",
//   port: 5432,
//   ssl: false, // 本機可先關閉 ssl
// });

module.exports = pool;
