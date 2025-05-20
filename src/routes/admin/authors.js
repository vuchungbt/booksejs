import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import User from '../../models/User.js';
import Book from '../../models/Book.js';
import { isAdmin } from '../../middleware/auth.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set up multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../public/uploads/authors');
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

// Use single for avatar upload
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2000000 } // 2MB
});

// Apply admin middleware to all routes
router.use(isAdmin);

// @desc    Get all authors
// @route   GET /admin/authors
// @access  Private/Admin
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    let query = { role: 'author' };
    
    // Search by name or email
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Count total authors
    const total = await User.countDocuments(query);
    
    // Get authors
    const authors = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    res.render('admin/authors/index', {
      title: 'Quản lý tác giả',
      layout: 'layouts/admin',
      authors,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalAuthors: total,
      search: req.query.search || ''
    });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Không thể tải danh sách tác giả');
    res.redirect('/admin');
  }
});

// @desc    Show add author form
// @route   GET /admin/authors/add
// @access  Private/Admin
router.get('/add', async (req, res) => {
  res.render('admin/authors/add', {
    title: 'Thêm tác giả mới',
    layout: 'layouts/admin'
  });
});

// @desc    Add new author
// @route   POST /admin/authors
// @access  Private/Admin
router.post('/', upload.single('avatar'), async (req, res) => {
  try {
    const { name, email, password, phone, address, bio, education } = req.body;
    const expertise = req.body.expertise ? req.body.expertise.split(',').map(skill => skill.trim()) : [];
    
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      req.flash('error_msg', 'Email đã được sử dụng');
      return res.redirect('/admin/authors/add');
    }
    
    // Create new author
    const author = new User({
      name,
      email,
      password,
      role: 'author',
      phone: phone || '',
      address: address || '',
      bio: bio || '',
      education: education || '',
      expertise,
      socialLinks: {
        facebook: req.body.facebook || '',
        twitter: req.body.twitter || '',
        instagram: req.body.instagram || '',
        website: req.body.website || ''
      },
      avatar: '/images/avatars/default-avatar.png' // Set default avatar
    });

    // Add avatar if uploaded
    if (req.file) {
      author.avatar = `/uploads/authors/${req.file.filename}`;
    }
    
    await author.save();
    
    req.flash('success_msg', 'Thêm tác giả mới thành công');
    res.redirect('/admin/authors');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Không thể thêm tác giả mới');
    res.redirect('/admin/authors/add');
  }
});

// @desc    Show author details
// @route   GET /admin/authors/:id
// @access  Private/Admin
router.get('/:id', async (req, res) => {
  try {
    const author = await User.findOne({
      _id: req.params.id,
      role: 'author'
    });
    
    if (!author) {
      req.flash('error_msg', 'Không tìm thấy tác giả');
      return res.redirect('/admin/authors');
    }
    
    // Get author's books count
    const bookCount = await Book.countDocuments({ author: author._id });
    
    // Get author's books
    const books = await Book.find({ author: author._id })
      .sort({ createdAt: -1 })
      .limit(5);
    
    res.render('admin/authors/detail', {
      title: `Chi tiết tác giả: ${author.name}`,
      layout: 'layouts/admin',
      author,
      bookCount,
      books
    });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Không thể tải thông tin tác giả');
    res.redirect('/admin/authors');
  }
});

// @desc    Show edit author form
// @route   GET /admin/authors/edit/:id
// @access  Private/Admin
router.get('/edit/:id', async (req, res) => {
  try {
    const author = await User.findOne({
      _id: req.params.id,
      role: 'author'
    });
    
    if (!author) {
      req.flash('error_msg', 'Không tìm thấy tác giả');
      return res.redirect('/admin/authors');
    }
    
    res.render('admin/authors/edit', {
      title: `Chỉnh sửa tác giả: ${author.name}`,
      layout: 'layouts/admin',
      author
    });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Không thể tải thông tin tác giả');
    res.redirect('/admin/authors');
  }
});

// @desc    Update author
// @route   PUT /admin/authors/:id
// @access  Private/Admin
router.put('/:id', upload.single('avatar'), async (req, res) => {
  try {
    const { name, phone, address, bio, education } = req.body;
    const expertise = req.body.expertise ? req.body.expertise.split(',').map(skill => skill.trim()) : [];
    
    const author = await User.findOne({
      _id: req.params.id,
      role: 'author'
    });
    
    if (!author) {
      req.flash('error_msg', 'Không tìm thấy tác giả');
      return res.redirect('/admin/authors');
    }
    
    // Update author
    author.name = name;
    author.phone = phone || '';
    author.address = address || '';
    author.bio = bio || '';
    author.education = education || '';
    author.expertise = expertise;
    author.socialLinks = {
      facebook: req.body.facebook || '',
      twitter: req.body.twitter || '',
      instagram: req.body.instagram || '',
      website: req.body.website || ''
    };

    // Update avatar if uploaded
    if (req.file) {
      // Delete old avatar if exists and not default
      if (author.avatar && author.avatar !== '/images/avatars/default-avatar.png') {
        const oldAvatarPath = path.join(__dirname, '../../public', author.avatar);
        if (fs.existsSync(oldAvatarPath)) {
          fs.unlinkSync(oldAvatarPath);
        }
      }
      author.avatar = `/uploads/authors/${req.file.filename}`;
    }
    
    await author.save();
    
    req.flash('success_msg', 'Cập nhật tác giả thành công');
    res.redirect(`/admin/authors/${author._id}`);
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Không thể cập nhật tác giả');
    res.redirect(`/admin/authors/edit/${req.params.id}`);
  }
});

// @desc    Delete author
// @route   DELETE /admin/authors/:id
// @access  Private/Admin
router.delete('/:id', async (req, res) => {
  try {
    const author = await User.findOne({
      _id: req.params.id,
      role: 'author'
    });
    
    if (!author) {
      req.flash('error_msg', 'Không tìm thấy tác giả');
      return res.redirect('/admin/authors');
    }
    
    // Check if author has books
    const bookCount = await Book.countDocuments({ author: author._id });
    
    if (bookCount > 0) {
      req.flash('error_msg', `Không thể xóa tác giả này vì đang có ${bookCount} sách liên kết. Hãy xóa hoặc chuyển sách sang tác giả khác trước.`);
      return res.redirect('/admin/authors');
    }
    
    await author.remove();
    
    req.flash('success_msg', 'Xóa tác giả thành công');
    res.redirect('/admin/authors');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Không thể xóa tác giả');
    res.redirect('/admin/authors');
  }
});

export default router; 