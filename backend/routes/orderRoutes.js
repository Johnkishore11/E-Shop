const express = require("express");
const router = express.Router();
const { placeOrder, getUserOrders } = require("../controllers/orderController");
const { verifyToken } = require("../middlewares/authMiddleware");

// All routes require verification
router.use(verifyToken);

router.post("/", placeOrder);
router.get("/", getUserOrders);

module.exports = router;
