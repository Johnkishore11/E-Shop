const express = require("express");
const router = express.Router();
const { getProducts, getProductById } = require("../controllers/productController");

// Route paths are relative to /api/products
router.get("/", getProducts);
router.get("/:id", getProductById);

module.exports = router;
