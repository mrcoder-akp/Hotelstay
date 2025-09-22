const express = require('express');
const {
  getCart,
  addToCart,
  removeFromCart,
  updateCartItem,
  clearCart
} = require('../controllers/cart.controller');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // All cart routes require authentication

router.get('/', getCart);
router.post('/add', addToCart);
router.delete('/item/:itemId', removeFromCart);
router.put('/item/:itemId', updateCartItem);
router.delete('/clear', clearCart);

module.exports = router;