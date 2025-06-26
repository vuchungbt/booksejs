import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import Article from '../../models/Article.js';
import Book from '../../models/Book.js';
import User from '../../models/User.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set up multer storage for article images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../public/uploads/articles');
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
  limits: { fileSize: 10000000 } // 10MB
});

// @desc    Get all articles
// @route   GET /admin/articles
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
    
    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    // Filter by author
    if (req.query.author) {
      query.author = req.query.author;
    }
    
    // Count total articles
    const total = await Article.countDocuments(query);
    
    // Find articles
    const articles = await Article.find(query)
      .populate('author', 'name')
      .populate('relatedBooks', 'title')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    // Get all authors for filter
    const authors = await User.find({ role: { $in: ['admin', 'author'] } }).select('name');
    
    res.render('admin/articles/index', {
      title: 'Quản lý bài viết',
      layout: 'layouts/admin',
      articles,
      authors,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      search: req.query.search || '',
      status: req.query.status || '',
      author: req.query.author || ''
    });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Không thể tải danh sách bài viết');
    res.redirect('/admin');
  }
});

// @desc    Show add article form
// @route   GET /admin/articles/add
// @access  Private/Admin
router.get('/add', async (req, res) => {
  try {
    const books = await Book.find().select('title');
    const authors = await User.find({ role: { $in: ['admin', 'author'] } }).select('name');
    
    res.render('admin/articles/add', {
      title: 'Thêm bài viết mới',
      layout: 'layouts/admin',
      books,
      authors
    });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Không thể tải form thêm bài viết');
    res.redirect('/admin/articles');
  }
});

// @desc    Add new article
// @route   POST /admin/articles
// @access  Private/Admin
router.post('/', upload.single('featuredImage'), async (req, res) => {
  try {
    const {
      title,
      excerpt,
      content,
      author,
      relatedBooks,
      tags,
      status,
      featured
    } = req.body;
    
    // Process tags
    const tagArray = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : [];
    
    // Process related books
    const relatedBooksArray = relatedBooks ? (Array.isArray(relatedBooks) ? relatedBooks : [relatedBooks]) : [];
    
    // Create article
    const article = new Article({
      title,
      excerpt,
      content,
      author: author || req.session.user.id,
      relatedBooks: relatedBooksArray,
      tags: tagArray,
      status: status || 'draft',
      featured: featured === 'on'
    });
    
    // Add featured image if uploaded
    if (req.file) {
      article.featuredImage = `/uploads/articles/${req.file.filename}`;
    }
    
    await article.save();
    
    req.flash('success_msg', 'Thêm bài viết thành công');
    res.redirect('/admin/articles');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Không thể thêm bài viết');
    res.redirect('/admin/articles/add');
  }
});

// @desc    Show edit article form
// @route   GET /admin/articles/edit/:id
// @access  Private/Admin
router.get('/edit/:id', async (req, res) => {
  try {
    const article = await Article.findById(req.params.id).populate('relatedBooks', 'title');
    
    if (!article) {
      req.flash('error_msg', 'Không tìm thấy bài viết');
      return res.redirect('/admin/articles');
    }
    
    const books = await Book.find().select('title');
    const authors = await User.find({ role: { $in: ['admin', 'author'] } }).select('name');
    
    res.render('admin/articles/edit', {
      title: 'Chỉnh sửa bài viết',
      layout: 'layouts/admin',
      article,
      books,
      authors
    });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Không thể tải thông tin bài viết');
    res.redirect('/admin/articles');
  }
});

// @desc    Update article
// @route   PUT /admin/articles/:id
// @access  Private/Admin
router.put('/:id', upload.single('featuredImage'), async (req, res) => {
  try {
    const {
      title,
      excerpt,
      content,
      author,
      relatedBooks,
      tags,
      status,
      featured
    } = req.body;
    
    const article = await Article.findById(req.params.id);
    
    if (!article) {
      req.flash('error_msg', 'Không tìm thấy bài viết');
      return res.redirect('/admin/articles');
    }
    
    // Process tags
    const tagArray = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : [];
    
    // Process related books
    const relatedBooksArray = relatedBooks ? (Array.isArray(relatedBooks) ? relatedBooks : [relatedBooks]) : [];
    
    // Update fields
    article.title = title;
    article.excerpt = excerpt;
    article.content = content;
    article.author = author || req.session.user.id;
    article.relatedBooks = relatedBooksArray;
    article.tags = tagArray;
    article.status = status || 'draft';
    article.featured = featured === 'on';
    
    // Update featured image if uploaded
    if (req.file) {
      // Delete old image if exists
      if (article.featuredImage && article.featuredImage !== '/images/articles/default-article.jpg') {
        const oldImagePath = path.join(__dirname, '../../public', article.featuredImage);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      
      article.featuredImage = `/uploads/articles/${req.file.filename}`;
    }
    
    await article.save();
    
    req.flash('success_msg', 'Cập nhật bài viết thành công');
    res.redirect('/admin/articles');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Không thể cập nhật bài viết');
    res.redirect(`/admin/articles/edit/${req.params.id}`);
  }
});

// @desc    Delete article
// @route   DELETE /admin/articles/:id
// @access  Private/Admin
router.delete('/:id', async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    
    if (!article) {
      req.flash('error_msg', 'Không tìm thấy bài viết');
      return res.redirect('/admin/articles');
    }
    
    // Delete featured image if exists
    if (article.featuredImage && article.featuredImage !== '/images/articles/default-article.jpg') {
      const imagePath = path.join(__dirname, '../../public', article.featuredImage);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    await Article.findByIdAndDelete(req.params.id);
    
    req.flash('success_msg', 'Xóa bài viết thành công');
    res.redirect('/admin/articles');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Không thể xóa bài viết');
    res.redirect('/admin/articles');
  }
});

export default router; 