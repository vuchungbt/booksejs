import express from 'express';
import {
  getCheckout,
  createOrder,
  getOrderDetails,
  getUserOrders
} from '../controllers/orderController.js';
import { isLoggedIn } from '../middleware/auth.js';

const router = express.Router();

router.get('/checkout', isLoggedIn, getCheckout);
router.post('/', isLoggedIn, createOrder);
router.get('/:id', isLoggedIn, getOrderDetails);
router.get('/', isLoggedIn, getUserOrders);

export default router;