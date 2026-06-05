const db = require("../config/db");

// Get all products (with search & filter)
const getProducts = async (req, res) => {
  const { search, category } = req.query;

  try {
    let queryText = `
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE 1=1
    `;
    const queryParams = [];

    // Add category filter
    if (category) {
      queryParams.push(category);
      queryText += ` AND p.category_id = $${queryParams.length}`;
    }

    // Add search filter
    if (search) {
      queryParams.push(`%${search}%`);
      queryText += ` AND (p.name ILIKE $${queryParams.length} OR p.description ILIKE $${queryParams.length})`;
    }

    queryText += " ORDER BY p.id DESC";

    const result = await db.query(queryText, queryParams);
    res.json(result.rows);
  } catch (err) {
    console.error("Get products error:", err.message);
    res.status(500).json({ message: "Server error fetching products" });
  }
};

// Get single product details
const getProductById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      `SELECT p.*, c.name as category_name 
       FROM products p 
       LEFT JOIN categories c ON p.category_id = c.id 
       WHERE p.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Get product by id error:", err.message);
    res.status(500).json({ message: "Server error fetching product details" });
  }
};

module.exports = {
  getProducts,
  getProductById,
};
