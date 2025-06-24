const router = require("express").Router();
const pool = require("../db");

router.get("/index", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM products ORDER BY created_at DESC"
    );
    console.log(result);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "讀取商品失敗" });
  }
});

// products取得單一商品
router.get("/:product_id", async (req, res) => {
  const { product_id } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM products WHERE product_id = $1",
      [product_id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: error.message });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
