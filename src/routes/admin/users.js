import express from 'express';
import User from '../../models/User.js';
import bcrypt from 'bcrypt';

const router = express.Router();

// @desc    Get all users
// @route   GET /admin/users
// @access  Admin
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    
    let query = {};
    
    // Filter by role
    if (req.query.role && req.query.role !== 'all') {
      query.role = req.query.role;
    }
    
    // Filter by search
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    // Count total users
    const total = await User.countDocuments(query);
    
    // Get users
    const users = await User.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    res.render('admin/users/index', {
      title: 'Quản lý người dùng',
      layout: 'layouts/admin',
      users,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      role: req.query.role || 'all',
      search: req.query.search || ''
    });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Không thể tải danh sách người dùng');
    res.redirect('/admin');
  }
});

// @desc    Get user details
// @route   GET /admin/users/:id
// @access  Admin
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      req.flash('error_msg', 'Không tìm thấy người dùng');
      return res.redirect('/admin/users');
    }
    
    // Get author statistics (if user is author)
    let authorStats = null;
    
    if (user.role === 'author') {
      const Book = (await import('../../models/Book.js')).default;
      const Order = (await import('../../models/Order.js')).default;
      
      // Count books
      const bookCount = await Book.countDocuments({ author: user._id });
      
      // Books by this author
      const books = await Book.find({ author: user._id }).select('_id title');
      
      // Count sales
      let totalSales = 0;
      let totalOrders = 0;
      
      if (books.length > 0) {
        const bookIds = books.map(book => book._id);
        
        // Find orders containing these books
        const orders = await Order.find({
          'items.book': { $in: bookIds },
          status: { $nin: ['cancelled'] }
        });
        
        totalOrders = orders.length;
        
        // Calculate sales
        orders.forEach(order => {
          order.items.forEach(item => {
            if (bookIds.some(id => id.toString() === item.book.toString())) {
              totalSales += item.price;
            }
          });
        });
      }
      
      authorStats = {
        bookCount,
        totalSales,
        totalOrders
      };
    }
    
    // Get user's orders
    const Order = (await import('../../models/Order.js')).default;
    const orders = await Order.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(5);
    
    res.render('admin/users/detail', {
      title: user.name,
      layout: 'layouts/admin',
      user,
      authorStats,
      orders
    });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Không thể tải thông tin người dùng');
    res.redirect('/admin/users');
  }
});

// @desc    Create new user
// @route   GET /admin/users/new
// @access  Admin
router.get('/new', (req, res) => {
  res.render('admin/users/form', {
    title: 'Thêm người dùng mới',
    layout: 'layouts/admin',
    user: null
  });
});

// @desc    Create new user
// @route   POST /admin/users
// @access  Admin
router.post('/', async (req, res) => {
  try {
    const { name, email, password, role, phone, address } = req.body;
    
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      req.flash('error_msg', 'Email đã được sử dụng');
      return res.redirect('/admin/users/new');
    }
    
    // Create new user
    const user = new User({
      name,
      email,
      password,
      role,
      phone,
      address
    });
    
    await user.save();
    
    req.flash('success_msg', 'Tạo người dùng thành công');
    res.redirect('/admin/users');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Không thể tạo người dùng');
    res.redirect('/admin/users/new');
  }
});

// @desc    Edit user
// @route   GET /admin/users/:id/edit
// @access  Admin
router.get('/:id/edit', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      req.flash('error_msg', 'Không tìm thấy người dùng');
      return res.redirect('/admin/users');
    }
    
    res.render('admin/users/form', {
      title: `Chỉnh sửa: ${user.name}`,
      layout: 'layouts/admin',
      user
    });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Không thể tải thông tin người dùng');
    res.redirect('/admin/users');
  }
});

// @desc    Update user
// @route   PUT /admin/users/:id
// @access  Admin
router.put('/:id', async (req, res) => {
  try {
    const { name, email, password, role, phone, address } = req.body;
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      req.flash('error_msg', 'Không tìm thấy người dùng');
      return res.redirect('/admin/users');
    }
    
    // Check if email already exists (except for this user)
    if (email !== user.email) {
      const existingUser = await User.findOne({ email });
      
      if (existingUser) {
        req.flash('error_msg', 'Email đã được sử dụng');
        return res.redirect(`/admin/users/${user._id}/edit`);
      }
    }
    
    // Update user
    user.name = name;
    user.email = email;
    user.role = role;
    user.phone = phone;
    user.address = address;
    
    // Update password if provided
    if (password && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }
    
    await user.save();
    
    req.flash('success_msg', 'Cập nhật người dùng thành công');
    res.redirect('/admin/users');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Không thể cập nhật người dùng');
    res.redirect(`/admin/users/${req.params.id}/edit`);
  }
});

// @desc    Delete user
// @route   DELETE /admin/users/:id
// @access  Admin
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      req.flash('error_msg', 'Không tìm thấy người dùng');
      return res.redirect('/admin/users');
    }
    
    // Check if user is current user
    if (user._id.toString() === req.session.user.id) {
      req.flash('error_msg', 'Bạn không thể xóa tài khoản của chính mình');
      return res.redirect('/admin/users');
    }
    
    await user.deleteOne();
    
    req.flash('success_msg', 'Xóa người dùng thành công');
    res.redirect('/admin/users');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Không thể xóa người dùng');
    res.redirect('/admin/users');
  }
});

export default router; 