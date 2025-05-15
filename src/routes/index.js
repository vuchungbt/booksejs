import express from 'express';
import Book from '../models/Book.js';
import Category from '../models/Category.js';

const router = express.Router();

// @desc    Homepage
// @route   GET /
// @access  Public
router.get('/', async (req, res) => {
  try {
    // Get featured books
    const featuredBooks = await Book.find({ featured: true })
      .populate('category', 'name')
      .populate('author', 'name')
      .limit(8);
      
    // Get latest books
    const latestBooks = await Book.find()
      .populate('category', 'name')
      .populate('author', 'name')
      .sort({ createdAt: -1 })
      .limit(8);
      
    // Get categories
    const categories = await Category.find().limit(10);
      
    res.render('home', {
      title: 'Trang chủ',
      featuredBooks,
      latestBooks,
      categories
    });
  } catch (error) {
    console.error(error);
    res.render('home', {
      title: 'Trang chủ',
      featuredBooks: [],
      latestBooks: [],
      categories: []
    });
  }
});

// @desc    About page
// @route   GET /about
// @access  Public
router.get('/about', (req, res) => {
  res.render('about', {
    title: 'Giới thiệu'
  });
});

// @desc    Contact page
// @route   GET /contact
// @access  Public
router.get('/contact', (req, res) => {
  res.render('contact', {
    title: 'Liên hệ'
  });
});

export default router;