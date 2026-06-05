const express = require("express");
const router = express.Router();
const { 
  getStats, 
  getAllOrders, 
  updateOrderStatus, 
  getAllUsers, 
  addProduct, 
  editProduct, 
  deleteProduct 
} = require("../controllers/adminController");
const { verifyToken, isAdmin } = require("../middlewares/authMiddleware");

// All admin routes require token verification AND admin privileges
router.use(verifyToken);
router.use(isAdmin);

router.get("/stats", getStats);
router.get("/orders", getAllOrders);
router.put("/orders/:id", updateOrderStatus);
router.get("/users", getAllUsers);

router.post("/products", addProduct);
router.put("/products/:id", editProduct);
router.delete("/products/:id", deleteProduct);

module.exports = router;
