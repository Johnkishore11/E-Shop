const express = require("express");
const router = express.Router();
const { getCart, addToCart, updateCartItem, removeCartItem } = require("../controllers/cartController");
const { verifyToken } = require("../middlewares/authMiddleware");

// All routes here require verification
router.use(verifyToken);

router.get("/", getCart);
router.post("/", addToCart);
router.put("/:id", updateCartItem);
router.delete("/:id", removeCartItem);

module.exports = router;
