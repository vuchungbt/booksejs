import express from 'express';
import { isAdmin } from '../../middleware/auth.js';
import Book from '../../models/Book.js';
import User from '../../models/User.js';
import Order from '../../models/Order.js';
import Category from '../../models/Category.js';

const router = express.Router();

// Apply admin middleware to all routes
router.use(isAdmin);

// Dashboard
router.get('/', async (req, res) => {
  try {
    // Get counts
    const bookCount = await Book.countDocuments();
    const userCount = await User.countDocuments();
    const orderCount = await Order.countDocuments();
    const categoryCount = await Category.countDocuments();
    
    // Get recent orders
    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);
      
    // Get sales data
    const salesData = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$totalAmount' }
        }
      }
    ]);
    
    const totalSales = salesData.length > 0 ? salesData[0].totalSales : 0;
    
    res.render('admin/dashboard', {
      title: 'Quản trị',
      layout: 'layouts/admin',
      counts: {
        books: bookCount,
        users: userCount,
        orders: orderCount,
        categories: categoryCount
      },
      recentOrders,
      totalSales
    });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Không thể tải dữ liệu');
    res.render('admin/dashboard', {
      title: 'Quản trị',
      layout: 'layouts/admin',
      counts: {
        books: 0,
        users: 0,
        orders: 0,
        categories: 0
      },
      recentOrders: [],
      totalSales: 0
    });
  }
});

// Books routes
import bookRoutes from './books.js';
router.use('/books', bookRoutes);

// Categories routes
import categoryRoutes from './categories.js';
router.use('/categories', categoryRoutes);

// Users routes
import userRoutes from './users.js';
router.use('/users', userRoutes);

// Orders routes
import orderRoutes from './orders.js';
router.use('/orders', orderRoutes);

// Authors routes
import authorRoutes from './authors.js';
router.use('/authors', authorRoutes);

// Settings routes
import settingsRoutes from './settings.js';
router.use('/settings', settingsRoutes);

export default router;