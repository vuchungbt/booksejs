import express from 'express';
import Order from '../../models/Order.js';

const router = express.Router();

// @desc    Get all orders
// @route   GET /admin/orders
// @access  Admin
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    
    let query = {};
    
    // Filter by status
    if (req.query.status && req.query.status !== 'all') {
      query.status = req.query.status;
    }
    
    // Filter by customer
    if (req.query.search) {
      // Get user by name or email
      const User = (await import('../../models/User.js')).default;
      const users = await User.find({
        $or: [
          { name: { $regex: req.query.search, $options: 'i' } },
          { email: { $regex: req.query.search, $options: 'i' } }
        ]
      }).select('_id');
      
      if (users.length > 0) {
        const userIds = users.map(user => user._id);
        query.user = { $in: userIds };
      } else {
        query._id = null; // No results if no users match
      }
    }
    
    // Count total orders
    const total = await Order.countDocuments(query);
    
    // Get orders
    const orders = await Order.find(query)
      .populate('user', 'name email')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    res.render('admin/orders/index', {
      title: 'Quản lý đơn hàng',
      layout: 'layouts/admin',
      orders,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      status: req.query.status || 'all',
      search: req.query.search || ''
    });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Không thể tải danh sách đơn hàng');
    res.redirect('/admin');
  }
});

// @desc    Get order details
// @route   GET /admin/orders/:id
// @access  Admin
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone address')
      .populate('items.book', 'title cover');
    
    if (!order) {
      req.flash('error_msg', 'Không tìm thấy đơn hàng');
      return res.redirect('/admin/orders');
    }
    
    res.render('admin/orders/detail', {
      title: `Đơn hàng #${order._id}`,
      layout: 'layouts/admin',
      order
    });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Không thể tải thông tin đơn hàng');
    res.redirect('/admin/orders');
  }
});

// @desc    Update order status
// @route   POST /admin/orders/:id/status
// @access  Admin
router.post('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      req.flash('error_msg', 'Không tìm thấy đơn hàng');
      return res.redirect('/admin/orders');
    }
    
    // Update status
    order.status = status;
    
    // If status is delivered, set deliveredAt
    if (status === 'delivered') {
      order.deliveredAt = Date.now();
    }
    
    // If status is confirmed and payment method is BankTransfer, set isPaid to true
    if (status === 'confirmed' && order.paymentMethod === 'BankTransfer') {
      order.isPaid = true;
      order.paidAt = Date.now();
    }
    
    await order.save();
    
    req.flash('success_msg', 'Cập nhật trạng thái đơn hàng thành công');
    res.redirect(`/admin/orders/${order._id}`);
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Không thể cập nhật trạng thái đơn hàng');
    res.redirect('/admin/orders');
  }
});

// @desc    Get sales statistics
// @route   GET /admin/orders/stats/sales
// @access  Admin
router.get('/stats/sales', async (req, res) => {
  try {
    // Get period (day, month, year)
    const period = req.query.period || 'month';
    
    let dateFormat, groupBy;
    let startDate = new Date();
    
    // Set up date format and group by field based on period
    switch (period) {
      case 'day':
        dateFormat = '%Y-%m-%d';
        groupBy = { $dateToString: { format: dateFormat, date: '$createdAt' } };
        // Last 30 days
        startDate.setDate(startDate.getDate() - 30);
        break;
      case 'month':
        dateFormat = '%Y-%m';
        groupBy = { $dateToString: { format: dateFormat, date: '$createdAt' } };
        // Last 12 months
        startDate.setMonth(startDate.getMonth() - 12);
        break;
      case 'year':
        dateFormat = '%Y';
        groupBy = { $dateToString: { format: dateFormat, date: '$createdAt' } };
        // Last 5 years
        startDate.setFullYear(startDate.getFullYear() - 5);
        break;
    }
    
    // Get sales data
    const salesData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $nin: ['cancelled'] }
        }
      },
      {
        $group: {
          _id: groupBy,
          totalSales: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Get totals
    const totals = await Order.aggregate([
      {
        $match: {
          status: { $nin: ['cancelled'] }
        }
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get top selling books
    const topBooks = await Order.aggregate([
      {
        $match: {
          status: { $nin: ['cancelled'] }
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.book',
          totalQuantity: { $sum: '$items.quantity' },
          totalAmount: { $sum: '$items.price' }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 }
    ]);
    
    // Populate book details
    const Book = (await import('../../models/Book.js')).default;
    
    const topBooksWithDetails = await Promise.all(
      topBooks.map(async (item) => {
        const book = await Book.findById(item._id).select('title cover slug');
        return {
          ...item,
          book
        };
      })
    );
    
    res.render('admin/orders/stats', {
      title: 'Thống kê doanh số',
      layout: 'layouts/admin',
      salesData,
      period,
      totalSales: totals.length > 0 ? totals[0].totalSales : 0,
      totalOrders: totals.length > 0 ? totals[0].count : 0,
      topBooks: topBooksWithDetails
    });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Không thể tải dữ liệu thống kê');
    res.redirect('/admin');
  }
});

export default router; 