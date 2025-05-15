import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import Book from '../../models/Book.js';
import Category from '../../models/Category.js';
import User from '../../models/User.js';

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

// Use array for multiple file uploads
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5000000 } // 5MB
});

// Set up the upload fields
const uploadFields = upload.fields([
  { name: 'cover', maxCount: 1 },
  { name: 'additionalImages', maxCount: 2 }
]);

// @desc    Get all books
// @route   GET /admin/books
// @access  Private/Admin
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    
    let query = {};
    
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
      .populate('author', 'name')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
      
    // Get all categories for filter
    const categories = await Category.find();
    
    res.render('admin/books/index', {
      title: 'Quản lý sách',
      layout: 'layouts/admin',
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
    res.redirect('/admin');
  }
});

// @desc    Show add book form
// @route   GET /admin/books/add
// @access  Private/Admin
router.get('/add', async (req, res) => {
  try {
    const categories = await Category.find();
    const authors = await User.find({ role: 'author' });
    
    res.render('admin/books/add', {
      title: 'Thêm sách mới',
      layout: 'layouts/admin',
      categories,
      authors
    });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Không thể tải form thêm sách');
    res.redirect('/admin/books');
  }
});

// @desc    Add new book
// @route   POST /admin/books
// @access  Private/Admin
router.post('/', uploadFields, async (req, res) => {
  try {
    const {
      title,
      author,
      publisher,
      category,
      description,
      price,
      pages,
      publicationDate,
      stock,
      isbn,
      featured
    } = req.body;
    
    // Create book
    const book = new Book({
      title,
      author,
      publisher,
      category,
      description,
      price,
      pages,
      publicationDate,
      stock,
      isbn,
      featured: featured === 'on'
    });
    
    // Add cover if uploaded
    if (req.files && req.files.cover && req.files.cover.length > 0) {
      const coverPath = `/uploads/books/${req.files.cover[0].filename}`;
      book.cover = coverPath;
    }
    
    // Add additional images if uploaded
    if (req.files && req.files.additionalImages) {
      const additionalImages = req.files.additionalImages.map(
        file => `/uploads/books/${file.filename}`
      );
      book.images = additionalImages;
    }
    
    await book.save();
    
    req.flash('success_msg', 'Thêm sách thành công');
    res.redirect('/admin/books');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Không thể thêm sách');
    res.redirect('/admin/books/add');
  }
});

// @desc    Show edit book form
// @route   GET /admin/books/edit/:id
// @access  Private/Admin
router.get('/edit/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      req.flash('error_msg', 'Không tìm thấy sách');
      return res.redirect('/admin/books');
    }
    
    const categories = await Category.find();
    const authors = await User.find({ role: 'author' });
    
    res.render('admin/books/edit', {
      title: 'Chỉnh sửa sách',
      layout: 'layouts/admin',
      book,
      categories,
      authors
    });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Không thể tải thông tin sách');
    res.redirect('/admin/books');
  }
});

// @desc    Update book
// @route   PUT /admin/books/:id
// @access  Private/Admin
router.put('/:id', uploadFields, async (req, res) => {
  try {
    const {
      title,
      author,
      publisher,
      category,
      description,
      price,
      pages,
      publicationDate,
      stock,
      isbn,
      featured,
      deleteImages
    } = req.body;
    
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      req.flash('error_msg', 'Không tìm thấy sách');
      return res.redirect('/admin/books');
    }
    
    // Update fields
    book.title = title;
    book.author = author;
    book.publisher = publisher;
    book.category = category;
    book.description = description;
    book.price = price;
    book.pages = pages;
    book.publicationDate = publicationDate;
    book.stock = stock;
    book.isbn = isbn;
    book.featured = featured === 'on';
    
    // Update cover if uploaded
    if (req.files && req.files.cover && req.files.cover.length > 0) {
      // Delete old cover if exists
      if (book.cover && book.cover !== '/images/books/default-book.png') {
        const oldCoverPath = path.join(__dirname, '../../public', book.cover);
        if (fs.existsSync(oldCoverPath)) {
          fs.unlinkSync(oldCoverPath);
        }
      }
      
      const coverPath = `/uploads/books/${req.files.cover[0].filename}`;
      book.cover = coverPath;
    }
    
    // Handle image deletions
    if (deleteImages) {
      const deleteIndices = Array.isArray(deleteImages) ? deleteImages : [deleteImages];
      
      // Convert to indices array
      const indicesToDelete = deleteIndices.map(index => parseInt(index));
      
      // Delete physical files
      indicesToDelete.forEach(index => {
        if (book.images[index] && book.images[index] !== '/images/books/default-book.png') {
          const imagePath = path.join(__dirname, '../../public', book.images[index]);
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
          }
        }
      });
      
      // Filter out deleted images
      book.images = book.images.filter((_, index) => !indicesToDelete.includes(index));
    }
    
    // Add additional images if uploaded
    if (req.files && req.files.additionalImages) {
      const additionalImages = req.files.additionalImages.map(
        file => `/uploads/books/${file.filename}`
      );
      
      // Ensure we don't exceed 3 images total
      const totalImages = [...book.images, ...additionalImages].slice(0, 3);
      book.images = totalImages;
    }
    
    await book.save();
    
    req.flash('success_msg', 'Cập nhật sách thành công');
    res.redirect('/admin/books');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Không thể cập nhật sách');
    res.redirect(`/admin/books/edit/${req.params.id}`);
  }
});

// @desc    Delete book
// @route   DELETE /admin/books/:id
// @access  Private/Admin
router.delete('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      req.flash('error_msg', 'Không tìm thấy sách');
      return res.redirect('/admin/books');
    }
    
    // Delete cover if exists
    if (book.cover && book.cover !== '/images/books/default-book.png') {
      const coverPath = path.join(__dirname, '../../public', book.cover);
      if (fs.existsSync(coverPath)) {
        fs.unlinkSync(coverPath);
      }
    }
    
    // Delete additional images if exist
    if (book.images && book.images.length > 0) {
      book.images.forEach(image => {
        if (image && image !== '/images/books/default-book.png') {
          const imagePath = path.join(__dirname, '../../public', image);
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
          }
        }
      });
    }
    
    await book.remove();
    
    req.flash('success_msg', 'Xóa sách thành công');
    res.redirect('/admin/books');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Không thể xóa sách');
    res.redirect('/admin/books');
  }
});

export default router;