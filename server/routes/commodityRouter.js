const router = require("express").Router();
const pool = require("../db");
const authenticateToken = require("../middleware/auth");

router.get("/search", authenticateToken, async (req, res) => {
  const { keyword } = req.query;

  try {
    const result = await pool.query(
      `SELECT * FROM products WHERE name ILIKE $1 OR description ILIKE $1`,
      [`%${keyword}%`]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("搜尋錯誤：", err);
    res.status(500).json({ error: "伺服器錯誤" });
  }
});

// GET /api/orders/search?keyword=abc
router.get("/searchPurchaseRecord", authenticateToken, async (req, res) => {
  const keyword = req.query.keyword.toLowerCase();
  const userId = req.query.userId;

  try {
    const result = await pool.query(
      `SELECT * FROM orders
       WHERE user_id = $1 AND (name LIKE $2 OR order_id LIKE $2)`,
      [userId, `%${keyword}%`]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "搜尋失敗" });
  }
});

// GET /api/orders/search?keyword=abc
router.get("/searchOrders", authenticateToken, async (req, res) => {
  const { keyword = "" } = req.query;
  const owner_id = req.user.id; // 建議從 token 取，避免偽造

  const queryText = `
    SELECT 
    o.order_id,
    o.name,
    o.total,
    o.date,
    o.payment
  FROM orders o
  JOIN order_items oi ON o.order_id = oi.order_id
  JOIN products p ON oi.product_id = p.product_id
  WHERE p.owner_id = $1 AND o.order_id LIKE $2
  GROUP BY o.order_id, o.name, o.total, o.date, o.payment
  ORDER BY o.order_id DESC
    `;
  const queryValues = [owner_id, `%${keyword}%`];

  try {
    const result = await pool.query(queryText, queryValues);
    res.json(result.rows);
  } catch (err) {
    console.error("搜尋錯誤:", err);
    res.status(500).json({ message: "伺服器錯誤" });
  }
});

// 取得特定使用者的商品
router.get("/my-products", authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await pool.query(
      "SELECT * FROM products WHERE owner_id = $1 AND stock > 0 ORDER BY created_at DESC ",
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "伺服器錯誤" });
  }
});

// cart取得購物車商品;
router.get("/getCartItems/", authenticateToken, async (req, res) => {
  const userId = parseInt(req.user.id);
  if (isNaN(userId)) {
    return res.status(400).json({ error: "無效的使用者 ID" });
  }

  try {
    const result = await pool.query(
      `SELECT ci.id, ci.userid, ci.product_id, ci.quantity,
              p.name, p.price
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.product_id
       WHERE ci.userid = $1`, // ✅ 修正這裡
      [userId]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "找不到商品" });

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

//getOrder取得使用者購物車中的商品
router.get("/getOrder/", authenticateToken, async (req, res) => {
  const userid = req.user.id;
  try {
    const result = await pool.query(
      `SELECT ci.id, ci.userid, ci.product_id, ci.quantity,
              p.name, p.price, p.stock
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.product_id
       WHERE ci.userid = $1`,
      [userid]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "找不到商品" });

    res.json(result.rows); // 每個項目都包含商品資訊
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 新增商品
router.post("/post/", authenticateToken, async (req, res) => {
  const { name, price, description, image_url, stock, category_id } = req.body;
  const userId = req.user.id;

  // 檢查欄位是否有缺
  if (
    !name ||
    price == null ||
    !description ||
    !image_url ||
    stock == null ||
    !category_id
  ) {
    return res.status(400).json({ error: "請完整填寫" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO products 
      (name, price, description, image_url, stock, category_id, owner_id) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [name, price, description, image_url, stock, category_id, userId]
    );

    res.json({ msg: "商品新增成功", product: result.rows[0] });
  } catch (err) {
    console.error("資料庫錯誤：", err);
    res.status(500).json({ error: "新增商品失敗" });
  }
});

//post index使用者購物車中的商品
router.post("/cart/", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { product_id, quantity } = req.body; //userId來自 JWT

  try {
    // 檢查是否已經加入過該商品 → 若有則更新數量
    const check = await pool.query(
      "SELECT * FROM cart_items WHERE userId = $1 AND product_id = $2",
      [userId, product_id]
    );

    if (check.rows.length > 0) {
      // 已存在該商品 → 更新數量
      await pool.query(
        "UPDATE cart_items SET quantity = quantity + $1 WHERE userId = $2 AND product_id = $3",
        [quantity, userId, product_id]
      );
    } else {
      // 沒有該商品 → 新增一筆
      await pool.query(
        "INSERT INTO cart_items (userId, product_id, quantity ) VALUES ($1, $2, $3)",
        [userId, product_id, quantity]
      );
    }

    res.status(200).json({ message: "商品已加入購物車" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "加入購物車失敗" });
  }
});

// 拿到要更新的商品
router.get("/editProduct/:productId", authenticateToken, async (req, res) => {
  const { productId } = req.params;
  try {
    const result = await pool.query(
      `SELECT*FROM products WHERE product_id = $1`,
      [productId]
    );
    res.json({ msg: "商品更新成功", product: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "更新商品失敗" });
  }
});

router.get(
  "/purchaseRecordDetail/:orderId",
  authenticateToken,
  async (req, res) => {
    const { orderId } = req.params;
    try {
      const orderResult = await pool.query(
        `SELECT order_id, name, phone, total, date FROM orders WHERE order_id = $1`,
        [orderId]
      );
      const itemsResult = await pool.query(
        `SELECT name, price, quantity FROM order_items WHERE order_id = $1`,
        [orderId]
      );

      res.json({
        order: orderResult.rows[0],
        items: itemsResult.rows,
      });
    } catch (err) {
      console.error("查詢訂單明細失敗：", err);
      res.status(500).json({ error: "伺服器錯誤" });
    }
  }
);

router.get("/ordersDetail/:orderId", authenticateToken, async (req, res) => {
  const orderId = req.params.orderId;
  const ownerId = req.query.owner_id; // 商家ID，必須從前端帶入且驗證

  if (!ownerId) {
    return res.status(400).json({ error: "缺少 owner_id" });
  }

  try {
    // 1. 取得訂單主檔資料
    const orderResult = await pool.query(
      `SELECT order_id, name, phone, address, payment, total, date
       FROM orders WHERE order_id = $1`,
      [orderId]
    );

    if (orderResult.rowCount === 0) {
      return res.status(404).json({ error: "訂單不存在" });
    }

    const order = orderResult.rows[0];

    // 2. 取得該訂單中該商家擁有的商品明細
    const itemsResult = await pool.query(
      `SELECT p.name, oi.quantity, oi.price
       FROM order_items oi
       JOIN products p ON oi.product_id = p.product_id
       WHERE oi.order_id = $1 AND p.owner_id = $2`,
      [orderId, ownerId]
    );

    order.items = itemsResult.rows;

    return res.json(order);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "伺服器錯誤" });
  }
});

router.post("/post/:userId", authenticateToken, async (req, res) => {
  const { name, price, description, image_url, stock, category_id } = req.body;
  const { userId } = req.params; // ✅ 修正這一行

  // 檢查欄位是否有缺
  if (
    !name ||
    price == null ||
    !description ||
    !image_url ||
    stock == null ||
    !category_id
  ) {
    return res.status(400).json({ error: "請完整填寫" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO products 
      (name, price, description, image_url, stock, category_id, user_id) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [name, price, description, image_url, stock, category_id, userId]
    );

    res.json({ msg: "商品新增成功", product: result.rows[0] });
  } catch (err) {
    console.error("資料庫錯誤：", err);
    res.status(500).json({ error: "新增商品失敗" });
  }
});

router.post("/order/:userId", authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    const { order_id, name, phone, address, payment, total, date, items } =
      req.body;
    const userId = req.user.id;

    await client.query("BEGIN");

    // ➤ 儲存訂單
    const insertOrderText = `
      INSERT INTO orders (order_id, name, phone, address, payment, total, date, user_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;
    const insertOrderValues = [
      order_id,
      name,
      phone,
      address,
      payment,
      total,
      date,
      userId,
    ];
    await client.query(insertOrderText, insertOrderValues);

    // ➤ 儲存訂單明細
    const insertItemText = `
  INSERT INTO order_items (order_id, product_id, name, price, quantity, user_id)
  VALUES ($1, $2, $3, $4, $5, $6)
  `;
    for (let item of items) {
      await client.query(insertItemText, [
        order_id, // 訂單編號
        item.product_id, // 商品 ID
        item.name,
        item.price,
        item.quantity,
        userId,
      ]);
    }

    await client.query("COMMIT");
    res.status(201).json({ message: "訂單建立成功", orderId: order_id });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("訂單寫入失敗:", err);
    res.status(500).json({ message: "伺服器錯誤" });
  } finally {
    client.release();
  }
});

// 更新商品
router.patch(
  "/patchProduct/:productId",
  authenticateToken,
  async (req, res) => {
    const { productId } = req.params;
    const { name, price, description, image_url, stock, category_id } =
      req.body;

    try {
      const result = await pool.query(
        `UPDATE products 
         SET name=$1, price=$2, description=$3, image_url=$4, stock=$5, category_id=$6 
         WHERE product_id=$7 
         RETURNING *`,
        [name, price, description, image_url, stock, category_id, productId]
      );

      if (result.rowCount === 0) {
        return res
          .status(404)
          .json({ error: "找不到此商品，可能已被刪除或商品 ID 錯誤" });
      }

      res.json({ msg: "商品更新成功", product: result.rows[0] });
    } catch (err) {
      console.error("商品更新錯誤：", err);
      res.status(500).json({ error: "更新商品失敗" });
    }
  }
);

// 修改購物車中某一項商品的數量
router.patch("/patchCartItem/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  if (!quantity || isNaN(quantity) || quantity <= 0) {
    return res.status(400).json({ error: "無效的數量" });
  }

  try {
    const result = await pool.query(
      `UPDATE cart_items
       SET quantity = $1
       WHERE id = $2
       RETURNING *`,
      [quantity, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "找不到購物車項目" });
    }

    res.json({ message: "數量更新成功", cartItem: result.rows[0] });
  } catch (err) {
    console.error("更新購物車數量失敗:", err);
    res.status(500).json({ error: "伺服器錯誤" });
  }
});

//減少庫存
router.patch("/reduceQuantity/:userId", authenticateToken, async (req, res) => {
  const { items } = req.body;

  const client = await pool.connect();
  try {
    await client.query("BEGIN"); //如果中間任何一筆扣庫存失敗，就會回滾所有已執行的操作

    for (const item of items) {
      const { product_id, quantity } = item;

      const check = await client.query(
        `SELECT stock FROM products WHERE product_id = $1`,
        [product_id]
      );
      if (check.rows.length === 0) {
        throw new Error(`找不到商品 ID: ${product_id}`);
      }

      if (check.rows[0].stock < quantity) {
        throw new Error(`商品 ID ${product_id} 庫存不足`);
      }

      await client.query(
        `UPDATE products SET stock = stock - $1 WHERE product_id = $2`,
        [quantity, product_id]
      );
    }

    await client.query("COMMIT");
    res.json({ message: "庫存已更新" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("減少庫存錯誤：", err);
    res.status(500).json({ error: "伺服器錯誤：" + err.message });
  } finally {
    client.release();
  }
});

// 刪除商品
router.delete("/delete/:productId", authenticateToken, async (req, res) => {
  const { productId } = req.params;
  console.log(productId);
  try {
    const result = await pool.query(
      "DELETE FROM products WHERE product_id = $1",
      [productId]
    );
    console.log(result);
    res.json({ msg: "商品已刪除", deleteProduct: result.rows[0] });
  } catch (err) {
    console.error(err); // 看這裡的錯誤訊息
    res.status(500).json({ error: "刪除商品失敗" });
  }
});

//刪除購物車商品
router.delete(
  "/cleanCartItems/:userId",
  authenticateToken,
  async (req, res) => {
    const userId = parseInt(req.params.userId);

    if (isNaN(userId)) {
      return res.status(400).json({ error: "無效的使用者 ID" });
    }

    try {
      const result = await pool.query(
        "DELETE FROM cart_items WHERE userid = $1",
        [userId]
      );
      res.json({ msg: "購物車商品已刪除", deletedCount: result.rowCount });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "刪除購物車商品失敗" });
    }
  }
);

// 刪除購物車項目
router.delete(
  "/deleteCartItem/:product_id",
  authenticateToken,
  async (req, res) => {
    const { product_id } = req.params;

    try {
      const result = await pool.query(
        `DELETE FROM cart_items WHERE product_id = $1 RETURNING *`,
        [product_id]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ error: "找不到該購物車項目" });
      }

      res.json({ message: "刪除成功", deletedItem: result.rows[0] });
    } catch (err) {
      console.error("刪除購物車項目錯誤:", err);
      res.status(500).json({ error: "伺服器錯誤" });
    }
  }
);

router.delete("/ordersDelete", authenticateToken, async (req, res) => {
  const { order_id } = req.body;

  if (!order_id) {
    return res.status(400).json({ error: "缺少 order_id" });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 先刪除指定的訂單明細
    const delItemResult = await client.query(
      "DELETE FROM order_items WHERE order_id = $1 RETURNING *",
      [order_id]
    );

    if (delItemResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "找不到該訂單明細" });
    }

    // 再刪除指定的訂單
    const delOrderResult = await client.query(
      "DELETE FROM orders WHERE order_id = $1 RETURNING *",
      [order_id]
    );

    if (delOrderResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "找不到該訂單" });
    }

    await client.query("COMMIT");

    res.json({
      message: "訂單與訂單明細刪除成功",
      deletedOrderItem: delItemResult.rows[0],
      deletedOrder: delOrderResult.rows[0],
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("刪除訂單及訂單明細錯誤:", err);
    res.status(500).json({ error: "伺服器錯誤" });
  } finally {
    client.release();
  }
});

module.exports = router;
