import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import Book from '../../models/Book.js';
import Category from '../../models/Category.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set up multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../public/uploads/books');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`);
  }
});

// Check file type
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|webp/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận ảnh (jpeg, jpg, png, webp)'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5000000 } // 5MB
});

// @desc    Get all books
// @route   GET /author/books
// @access  Private/Author
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    
    let query = { author: req.session.user.id };
    
    // Search by title
    if (req.query.search) {
      query.title = { $regex: req.query.search, $options: 'i' };
    }
    
    // Filter by category
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    // Count total books
    const total = await Book.countDocuments(query);
    
    // Find books
    const books = await Book.find(query)
      .populate('category', 'name')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
      
    // Get all categories for filter
    const categories = await Category.find();
    
    res.render('author/books/index', {
      title: 'Sách của tôi',
      layout: 'layouts/author',
      books,
      categories,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      search: req.query.search || '',
      category: req.query.category || ''
    });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Không thể tải danh sách sách');
    res.redirect('/author');
  }
});

// @desc    Show add book form
// @route   GET /author/books/add
// @access  Private/Author
router.get('/add', async (req, res) => {
  try {
    const categories = await Category.find();
    
    res.render('author/books/add', {
      title: 'Thêm sách mới',
      layout: 'layouts/author',
      categories
    });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Không thể tải form thêm sách');
    res.redirect('/author/books');
  }
});

// @desc    Add new book
// @route   POST /author/books
// @access  Private/Author
router.post('/', upload.single('cover'), async (req, res) => {
  try {
    const {
      title,
      publisher,
      category,
      description,
      price,
      pages,
      publicationDate,
      stock,
      isbn
    } = req.body;
    
    // Create book
    const book = new Book({
      title,
      author: req.session.user.id,
      publisher,
      category,
      description,
      price,
      pages,
      publicationDate,
      stock,
      isbn,
      featured: false // Only admin can feature books
    });
    
    // Add cover if uploaded
    if (req.file) {
      const coverPath = `/uploads/books/${req.file.filename}`;
      book.cover = coverPath;
    }
    
    await book.save();
    
    req.flash('success_msg', 'Thêm sách thành công');
    res.redirect('/author/books');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Không thể thêm sách');
    res.redirect('/author/books/add');
  }
});

// @desc    Show edit book form
// @route   GET /author/books/edit/:id
// @access  Private/Author
router.get('/edit/:id', async (req, res) => {
  try {
    const book = await Book.findOne({
      _id: req.params.id,
      author: req.session.user.id
    });
    
    if (!book) {
      req.flash('error_msg', 'Không tìm thấy sách hoặc bạn không có quyền chỉnh sửa');
      return res.redirect('/author/books');
    }
    
    const categories = await Category.find();
    
    res.render('author/books/edit', {
      title: 'Chỉnh sửa sách',
      layout: 'layouts/author',
      book,
      categories
    });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Không thể tải thông tin sách');
    res.redirect('/author/books');
  }
});

// @desc    Update book
// @route   PUT /author/books/:id
// @access  Private/Author
router.put('/:id', upload.single('cover'), async (req, res) => {
  try {
    const {
      title,
      publisher,
      category,
      description,
      price,
      pages,
      publicationDate,
      stock,
      isbn
    } = req.body;
    
    const book = await Book.findOne({
      _id: req.params.id,
      author: req.session.user.id
    });
    
    if (!book) {
      req.flash('error_msg', 'Không tìm thấy sách hoặc bạn không có quyền chỉnh sửa');
      return res.redirect('/author/books');
    }
    
    // Update fields
    book.title = title;
    book.publisher = publisher;
    book.category = category;
    book.description = description;
    book.price = price;
    book.pages = pages;
    book.publicationDate = publicationDate;
    book.stock = stock;
    book.isbn = isbn;
    
    // Update cover if uploaded
    if (req.file) {
      // Delete old cover if exists
      if (book.cover && book.cover !== '/images/books/default-book.png') {
        const oldCoverPath = path.join(__dirname, '../../public', book.cover);
        if (fs.existsSync(oldCoverPath)) {
          fs.unlinkSync(oldCoverPath);
        }
      }
      
      const coverPath = `/uploads/books/${req.file.filename}`;
      book.cover = coverPath;
    }
    
    await book.save();
    
    req.flash('success_msg', 'Cập nhật sách thành công');
    res.redirect('/author/books');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Không thể cập nhật sách');
    res.redirect(`/author/books/edit/${req.params.id}`);
  }
});

// @desc    Delete book
// @route   DELETE /author/books/:id
// @access  Private/Author
router.delete('/:id', async (req, res) => {
  try {
    const book = await Book.findOne({
      _id: req.params.id,
      author: req.session.user.id
    });
    
    if (!book) {
      req.flash('error_msg', 'Không tìm thấy sách hoặc bạn không có quyền xóa');
      return res.redirect('/author/books');
    }
    
    // Delete cover if exists
    if (book.cover && book.cover !== '/images/books/default-book.png') {
      const coverPath = path.join(__dirname, '../../public', book.cover);
      if (fs.existsSync(coverPath)) {
        fs.unlinkSync(coverPath);
      }
    }
    
    await book.remove();
    
    req.flash('success_msg', 'Xóa sách thành công');
    res.redirect('/author/books');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Không thể xóa sách');
    res.redirect('/author/books');
  }
});

export default router;