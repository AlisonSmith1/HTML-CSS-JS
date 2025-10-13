"# 交易平台"

前端 (HTML / CSS / JavaScript)
────────────────────────────────────

1. 首頁 / 商品列表

   - 顯示商品縮圖、名稱、價格
   - 搜尋商品欄（搜尋已上架商品）
   - 註冊頁
   - 輸入帳號密碼 → POST /register

2. 登入頁

   - 輸入帳號密碼 → POST /login
   - 成功後取得 Session / Cookie

3. 商品詳細頁

   - 顯示商品圖片、描述、價格、庫存
   - 加入購物車 → 更新 localStorage / 後端購物車資料

4. 購物車頁

   - 顯示加入的商品清單
   - 調整數量 / 移除商品
   - 計算總金額
   - 訂單流程
   - 填寫收件人資訊與付款方式 → POST /orders
   - 訂單確認 → 訂單成立
   - 訂單完成頁（感謝頁）

5. 查詢購買紀錄 → GET /orders

6. 賣家商品管理

   - 我的商品管理頁
   - 新增 / 編輯 / 刪除商品 → POST / PUT / DELETE /products

7. 查看買家下單紀錄 → GET /orders

────────────────────────────────────

後端 (Node.js + Express)
────────────────────────────────────

1. HTTP Route
   - POST /register
     - 建立新使用者 → 資料存 users 資料表
   - POST /login
     - 驗證帳號密碼 → 成功後回傳 Session / Cookie
   - GET /products
     - 取得商品列表
   - GET /products/:id
     - 取得單一商品資料
   - POST /cart
     - 加入購物車
   - PUT /cart/:id
     - 更新購物車數量
   - DELETE /cart/:id
     - 移除購物車項目
   - POST /orders
     - 建立訂單
   - GET /orders
     - 查詢使用者訂單紀錄
   - GET /orders/:id
     - 查詢單筆訂單詳情
   - POST /products (賣家)
     - 新增商品
   - PUT /products/:id (賣家)
     - 編輯商品
   - DELETE /products/:id (賣家) -刪除商品

────────────────────────────────────

資料庫 (PostgreSQL)
────────────────────────────────────

- users
  - id, username, password(hashed), email, created_at
- products
  - id, name, description, price, stock, image_url, created_at
- orders
  - id, user_id, total_price, status, created_at
- order_items
  - id, order_id, product_id, quantity, price
- cart_items
  - id, user_id, product_id, quantity, created_at

────────────────────────────────────
