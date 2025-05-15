import express from 'express';
import {
  getAllBooks,
  getBookDetails,
  addReview
} from '../controllers/bookController.js';
import { isLoggedIn } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAllBooks);
router.get('/:slug', getBookDetails);
router.post('/:id/reviews', isLoggedIn, addReview);

export default router;