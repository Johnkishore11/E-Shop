const express = require("express");
const router = express.Router();
const { signup, login, getProfile } = require("../controllers/authController");
const { verifyToken } = require("../middlewares/authMiddleware");

// Route paths are relative to /api/auth
router.post("/signup", signup);
router.post("/login", login);
router.get("/profile", verifyToken, getProfile);

module.exports = router;
