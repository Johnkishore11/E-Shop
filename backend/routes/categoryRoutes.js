const express = require("express");
const router = express.Router();
const { getCategories } = require("../controllers/categoryController");

// Route path relative to /api/categories
router.get("/", getCategories);

module.exports = router;
