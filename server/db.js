const { Pool } = require("pg");
const dotenv = require("dotenv");
dotenv.config({ path: ".env" });

// 資料庫連線設定（Render 上會自動設定 DATABASE_URL）
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

module.exports = pool;
