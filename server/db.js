const { Pool } = require("pg");
const dotenv = require("dotenv");
dotenv.config();

// const pool = new Pool({
//   user: "postgres",
//   host: "localhost",
//   database: "shop",
//   password: "1234",
//   port: 5432,
// });

// 資料庫連線設定（Render 上會自動設定 DATABASE_URL）
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

module.exports = pool;
