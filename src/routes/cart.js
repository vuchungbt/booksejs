import express from 'express';
import {
  getCart,
  addToCart,
  removeFromCart,
  updateCart,
  clearCart,
  applyVoucher,
  removeVoucher
} from '../controllers/cartController.js';
import { isLoggedIn } from '../middleware/auth.js';

const router = express.Router();

router.get('/', isLoggedIn, getCart);
router.post('/add/:id', isLoggedIn, addToCart);
router.get('/remove/:id', isLoggedIn, removeFromCart);
router.post('/update/:id', isLoggedIn, updateCart);
router.get('/clear', isLoggedIn, clearCart);
router.post('/voucher', isLoggedIn, applyVoucher);
router.get('/voucher/remove', isLoggedIn, removeVoucher);

export default router;