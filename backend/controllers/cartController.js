const db = require("../config/db");

// Get cart items for logged in user
const getCart = async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await db.query(
      `SELECT c.id, c.product_id, c.quantity, p.name, p.price, p.image_url, p.stock 
       FROM cart_items c 
       JOIN products p ON c.product_id = p.id 
       WHERE c.user_id = $1 
       ORDER BY c.created_at ASC`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Get cart error:", err.message);
    res.status(500).json({ message: "Server error fetching cart items" });
  }
};

// Add item to cart
const addToCart = async (req, res) => {
  const userId = req.user.id;
  const { productId, quantity } = req.body;

  if (!productId) {
    return res.status(400).json({ message: "Product ID is required" });
  }

  const qty = parseInt(quantity, 10) || 1;

  try {
    // Check if product exists and check its stock
    const productResult = await db.query("SELECT id, name, stock FROM products WHERE id = $1", [productId]);
    if (productResult.rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    const product = productResult.rows[0];

    // Check if item is already in user's cart to check combined stock
    const existingResult = await db.query(
      "SELECT quantity FROM cart_items WHERE user_id = $1 AND product_id = $2",
      [userId, productId]
    );

    let currentQtyInCart = 0;
    if (existingResult.rows.length > 0) {
      currentQtyInCart = existingResult.rows[0].quantity;
    }

    if (currentQtyInCart + qty > product.stock) {
      return res.status(400).json({ 
        message: `Cannot add more items. Only ${product.stock} items are in stock, and you have ${currentQtyInCart} in your cart.` 
      });
    }

    // Insert or update quantity
    await db.query(
      `INSERT INTO cart_items (user_id, product_id, quantity) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (user_id, product_id) 
       DO UPDATE SET quantity = cart_items.quantity + $3`,
      [userId, productId, qty]
    );

    res.status(201).json({ message: "Item added to cart successfully" });
  } catch (err) {
    console.error("Add to cart error:", err.message);
    res.status(500).json({ message: "Server error adding item to cart" });
  }
};

// Update cart item quantity
const updateCartItem = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params; // cart item id
  const { quantity } = req.body;

  if (quantity === undefined || quantity === null) {
    return res.status(400).json({ message: "Quantity is required" });
  }

  const qty = parseInt(quantity, 10);
  if (qty <= 0) {
    return res.status(400).json({ message: "Quantity must be a positive integer" });
  }

  try {
    // Check if cart item exists and belongs to user
    const cartResult = await db.query(
      "SELECT product_id FROM cart_items WHERE id = $1 AND user_id = $2",
      [id, userId]
    );
    if (cartResult.rows.length === 0) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    const productId = cartResult.rows[0].product_id;

    // Check product stock limit
    const productResult = await db.query("SELECT stock FROM products WHERE id = $1", [productId]);
    const stock = productResult.rows[0].stock;

    if (qty > stock) {
      return res.status(400).json({ message: `Only ${stock} items are in stock` });
    }

    // Update quantity
    await db.query("UPDATE cart_items SET quantity = $1 WHERE id = $2 AND user_id = $3", [qty, id, userId]);

    res.json({ message: "Cart item quantity updated successfully" });
  } catch (err) {
    console.error("Update cart error:", err.message);
    res.status(500).json({ message: "Server error updating cart item" });
  }
};

// Remove item from cart
const removeCartItem = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params; // cart item id

  try {
    const result = await db.query("DELETE FROM cart_items WHERE id = $1 AND user_id = $2", [id, userId]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    res.json({ message: "Item removed from cart successfully" });
  } catch (err) {
    console.error("Remove from cart error:", err.message);
    res.status(500).json({ message: "Server error removing item from cart" });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
};
