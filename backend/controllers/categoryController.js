const db = require("../config/db");

// Get all categories
const getCategories = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM categories ORDER BY name ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Get categories error:", err.message);
    res.status(500).json({ message: "Server error fetching categories" });
  }
};

module.exports = {
  getCategories,
};
