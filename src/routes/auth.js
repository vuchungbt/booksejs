import express from 'express';
import {
  register,
  login,
  logout,
  getLoginPage,
  getRegisterPage
} from '../controllers/authController.js';
import { isLoggedIn, isLoggedOut } from '../middleware/auth.js';

const router = express.Router();

router.get('/login', isLoggedOut, getLoginPage);
router.get('/register', isLoggedOut, getRegisterPage);
router.post('/register', isLoggedOut, register);
router.post('/login', isLoggedOut, login);
router.get('/logout', isLoggedIn, logout);

export default router;