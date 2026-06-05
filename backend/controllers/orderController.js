const db = require("../config/db");

// Place an order (Checkout)
const placeOrder = async (req, res) => {
  const userId = req.user.id;
  const { shippingAddress, phone } = req.body;

  if (!shippingAddress || !phone) {
    return res.status(400).json({ message: "Shipping address and phone number are required" });
  }

  // Get active db client from pool to handle transactions
  const client = await db.pool.connect();

  try {
    // 1. Fetch user's cart items with product details
    const cartResult = await client.query(
      `SELECT c.product_id, c.quantity, p.name, p.price, p.stock 
       FROM cart_items c 
       JOIN products p ON c.product_id = p.id 
       WHERE c.user_id = $1`,
      [userId]
    );

    if (cartResult.rows.length === 0) {
      client.release();
      return res.status(400).json({ message: "Your cart is empty" });
    }

    const cartItems = cartResult.rows;

    // 2. Validate stock levels
    for (const item of cartItems) {
      if (item.quantity > item.stock) {
        client.release();
        return res.status(400).json({ 
          message: `Insufficient stock for product: ${item.name}. Available: ${item.stock}, In Cart: ${item.quantity}` 
        });
      }
    }

    // 3. Calculate total amount
    let totalAmount = 0;
    cartItems.forEach(item => {
      totalAmount += parseFloat(item.price) * item.quantity;
    });

    // Start database transaction
    await client.query("BEGIN");

    // 4. Create Order record
    const orderResult = await client.query(
      `INSERT INTO orders (user_id, total_amount, status, shipping_address, phone) 
       VALUES ($1, $2, 'Pending', $3, $4) 
       RETURNING id, total_amount, status, shipping_address, phone, created_at`,
      [userId, totalAmount, shippingAddress, phone]
    );

    const orderId = orderResult.rows[0].id;

    // 5. Insert order items and deduct stock
    for (const item of cartItems) {
      // Insert item
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price) 
         VALUES ($1, $2, $3, $4)`,
        [orderId, item.product_id, item.quantity, item.price]
      );

      // Deduct stock
      await client.query(
        `UPDATE products SET stock = stock - $1 WHERE id = $2`,
        [item.quantity, item.product_id]
      );
    }

    // 6. Clear user's cart
    await client.query("DELETE FROM cart_items WHERE user_id = $1", [userId]);

    // Commit transaction
    await client.query("COMMIT");
    client.release();

    res.status(201).json({
      message: "Order placed successfully",
      order: {
        id: orderId,
        totalAmount,
        status: "Pending",
        shippingAddress,
        phone,
        itemsCount: cartItems.length,
      }
    });
  } catch (err) {
    // Rollback transaction on failure
    await client.query("ROLLBACK");
    client.release();
    console.error("Place order transaction error:", err.message);
    res.status(500).json({ message: "Server error during checkout process" });
  }
};

// Get user orders history
const getUserOrders = async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await db.query(
      `SELECT o.id, o.total_amount, o.status, o.shipping_address, o.phone, o.created_at,
         COALESCE(
           json_agg(
             json_build_object(
               'id', oi.id,
               'product_id', oi.product_id,
               'quantity', oi.quantity,
               'price', oi.price,
               'product_name', p.name,
               'product_image', p.image_url
             )
           ) FILTER (WHERE oi.id IS NOT NULL),
           '[]'
         ) as items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE o.user_id = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Get user orders error:", err.message);
    res.status(500).json({ message: "Server error fetching your order history" });
  }
};

module.exports = {
  placeOrder,
  getUserOrders,
};
