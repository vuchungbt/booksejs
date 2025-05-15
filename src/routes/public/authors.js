import express from 'express';
import User from '../../models/User.js';
import Book from '../../models/Book.js';

const router = express.Router();

// @desc    Get all authors
// @route   GET /authors
// @access  Public
router.get('/', async (req, res) => {
  try {
    // Fetch all authors
    const authors = await User.find({ role: 'author' })
      .select('name avatar bio') // Only select necessary fields
      .sort({ name: 1 });
    
    res.render('authors/index', {
      title: 'Danh sách tác giả',
      authors
    });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Không thể tải danh sách tác giả');
    res.redirect('/');
  }
});

// @desc    Get author profile
// @route   GET /authors/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    // Find author by ID
    const author = await User.findOne({ 
      _id: req.params.id,
      role: 'author'
    });
    
    if (!author) {
      req.flash('error_msg', 'Không tìm thấy thông tin tác giả');
      return res.redirect('/authors');
    }
    
    // Get books by this author
    const books = await Book.find({ author: author._id })
      .sort({ createdAt: -1 })
      .limit(6);
    
    // Get total books count
    const totalBooks = await Book.countDocuments({ author: author._id });
    
    res.render('authors/profile', {
      title: `Tác giả ${author.name}`,
      author,
      books,
      totalBooks
    });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Không thể tải thông tin tác giả');
    res.redirect('/authors');
  }
});

// @desc    Get author's books
// @route   GET /authors/:id/books
// @access  Public
router.get('/:id/books', async (req, res) => {
  try {
    // Find author by ID
    const author = await User.findOne({ 
      _id: req.params.id,
      role: 'author'
    });
    
    if (!author) {
      req.flash('error_msg', 'Không tìm thấy thông tin tác giả');
      return res.redirect('/authors');
    }
    
    const page = parseInt(req.query.page, 10) || 1;
    const limit = 12;
    const skip = (page - 1) * limit;
    
    // Get books by this author
    const books = await Book.find({ author: author._id })
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get total books count
    const totalBooks = await Book.countDocuments({ author: author._id });
    
    res.render('authors/books', {
      title: `Sách của ${author.name}`,
      author,
      books,
      currentPage: page,
      totalPages: Math.ceil(totalBooks / limit),
      totalBooks
    });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Không thể tải sách của tác giả');
    res.redirect('/authors');
  }
});

// @desc    Get author introduction
// @route   GET /authors/:id/introduction
// @access  Public
router.get('/:id/introduction', async (req, res) => {
  try {
    // Find author by ID
    const author = await User.findOne({ 
      _id: req.params.id,
      role: 'author'
    });
    
    if (!author) {
      req.flash('error_msg', 'Không tìm thấy thông tin tác giả');
      return res.redirect('/authors');
    }
    
    res.render('authors/introduction', {
      title: `Giới thiệu về ${author.name}`,
      author
    });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Không thể tải thông tin giới thiệu tác giả');
    res.redirect('/authors');
  }
});

export default router; 