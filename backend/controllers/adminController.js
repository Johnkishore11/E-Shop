const db = require("../config/db");

// Get admin dashboard stats
const getStats = async (req, res) => {
  try {
    const statsResult = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM orders) as total_orders,
        (SELECT COALESCE(SUM(total_amount), 0) FROM orders) as total_revenue,
        (SELECT COUNT(*) FROM products) as total_products,
        (SELECT COUNT(*) FROM users) as total_users
    `);
    
    res.json(statsResult.rows[0]);
  } catch (err) {
    console.error("Get admin stats error:", err.message);
    res.status(500).json({ message: "Server error fetching dashboard statistics" });
  }
};

// Get all orders (for admin management)
const getAllOrders = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT o.id, o.total_amount, o.status, o.shipping_address, o.phone, o.created_at,
             u.name as user_name, u.email as user_email,
             COALESCE(
               json_agg(
                 json_build_object(
                   'id', oi.id,
                   'product_id', oi.product_id,
                   'quantity', oi.quantity,
                   'price', oi.price,
                   'product_name', p.name
                 )
               ) FILTER (WHERE oi.id IS NOT NULL),
               '[]'
             ) as items
      FROM orders o
      JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      GROUP BY o.id, u.id
      ORDER BY o.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Get all orders error:", err.message);
    res.status(500).json({ message: "Server error fetching all orders" });
  }
};

// Update order status (e.g. Shipped, Delivered)
const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: "Status is required" });
  }

  const validStatuses = ["Pending", "Shipped", "Delivered", "Cancelled"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  try {
    const result = await db.query(
      "UPDATE orders SET status = $1 WHERE id = $2 RETURNING *",
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ message: "Order status updated successfully", order: result.rows[0] });
  } catch (err) {
    console.error("Update order status error:", err.message);
    res.status(500).json({ message: "Server error updating order status" });
  }
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const result = await db.query("SELECT id, name, email, role, created_at FROM users ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Get all users error:", err.message);
    res.status(500).json({ message: "Server error fetching user list" });
  }
};

// Add product
const addProduct = async (req, res) => {
  const { name, description, price, imageUrl, categoryId, stock } = req.body;

  if (!name || !price || !categoryId || stock === undefined) {
    return res.status(400).json({ message: "Name, price, category, and stock are required" });
  }

  try {
    // Check if category exists
    const categoryResult = await db.query("SELECT id FROM categories WHERE id = $1", [categoryId]);
    if (categoryResult.rows.length === 0) {
      return res.status(400).json({ message: "Invalid category ID" });
    }

    const result = await db.query(
      `INSERT INTO products (name, description, price, image_url, category_id, stock) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [name, description, parseFloat(price), imageUrl || null, categoryId, parseInt(stock, 10)]
    );

    res.status(201).json({ message: "Product created successfully", product: result.rows[0] });
  } catch (err) {
    console.error("Add product error:", err.message);
    res.status(500).json({ message: "Server error adding product" });
  }
};

// Edit product
const editProduct = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, imageUrl, categoryId, stock } = req.body;

  if (!name || !price || !categoryId || stock === undefined) {
    return res.status(400).json({ message: "Name, price, category, and stock are required" });
  }

  try {
    // Check if product exists
    const productResult = await db.query("SELECT id FROM products WHERE id = $1", [id]);
    if (productResult.rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if category exists
    const categoryResult = await db.query("SELECT id FROM categories WHERE id = $1", [categoryId]);
    if (categoryResult.rows.length === 0) {
      return res.status(400).json({ message: "Invalid category ID" });
    }

    const result = await db.query(
      `UPDATE products 
       SET name = $1, description = $2, price = $3, image_url = $4, category_id = $5, stock = $6 
       WHERE id = $7 
       RETURNING *`,
      [name, description, parseFloat(price), imageUrl || null, categoryId, parseInt(stock, 10), id]
    );

    res.json({ message: "Product updated successfully", product: result.rows[0] });
  } catch (err) {
    console.error("Edit product error:", err.message);
    res.status(500).json({ message: "Server error updating product" });
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query("DELETE FROM products WHERE id = $1 RETURNING *", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deleted successfully", product: result.rows[0] });
  } catch (err) {
    console.error("Delete product error:", err.message);
    res.status(500).json({ message: "Server error deleting product" });
  }
};

module.exports = {
  getStats,
  getAllOrders,
  updateOrderStatus,
  getAllUsers,
  addProduct,
  editProduct,
  deleteProduct,
};
