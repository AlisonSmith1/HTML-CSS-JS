router.post("/post/:userId", async (req, res) => {
  const { name, price, description, image_url, stock, category_id } = req.body;
  const { userId } = req.params; // ✅ 修正這一行
  console.log({
    name,
    price,
    description,
    image_url,
    stock,
    category_id,
    userId,
  });

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
