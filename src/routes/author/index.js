import express from 'express';
import { isAuthor } from '../../middleware/auth.js';
import Book from '../../models/Book.js';
import Order from '../../models/Order.js';
import User from '../../models/User.js';

const router = express.Router();

// Apply author middleware to all routes
router.use(isAuthor);

// Dashboard
router.get('/', async (req, res) => {
  try {
    // Get counts
    const bookCount = await Book.countDocuments({ author: req.session.user.id });
    
    // Get book sales
    const books = await Book.find({ author: req.session.user.id });
    const bookIds = books.map(book => book._id);
    
    // Get orders with author's books
    const ordersWithAuthorBooks = await Order.aggregate([
      {
        $match: {
          'items.book': { $in: bookIds }
        }
      },
      {
        $unwind: '$items'
      },
      {
        $match: {
          'items.book': { $in: bookIds }
        }
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          totalItems: { $sum: '$items.quantity' }
        }
      }
    ]);
    
    const totalSales = ordersWithAuthorBooks.length > 0 ? ordersWithAuthorBooks[0].totalSales : 0;
    const totalItems = ordersWithAuthorBooks.length > 0 ? ordersWithAuthorBooks[0].totalItems : 0;
    
    // Get popular books
    const popularBooks = await Book.find({ author: req.session.user.id })
      .sort({ numReviews: -1, avgRating: -1 })
      .limit(5);
    
    res.render('author/dashboard', {
      title: 'Bảng điều khiển tác giả',
      layout: 'layouts/author',
      counts: {
        books: bookCount,
        sales: totalSales,
        items: totalItems
      },
      popularBooks
    });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Không thể tải dữ liệu');
    res.render('author/dashboard', {
      title: 'Bảng điều khiển tác giả',
      layout: 'layouts/author',
      counts: {
        books: 0,
        sales: 0,
        items: 0
      },
      popularBooks: []
    });
  }
});

// Books routes
import bookRoutes from './books.js';
router.use('/books', bookRoutes);

// Profile Management
router.get('/profile', async (req, res) => {
  try {
    // Get current author info
    const author = await User.findById(req.session.user.id);
    
    res.render('author/profile', {
      title: 'Hồ sơ tác giả',
      layout: 'layouts/author',
      author
    });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Không thể tải thông tin cá nhân');
    res.redirect('/author');
  }
});

// Update Profile
router.post('/profile', async (req, res) => {
  try {
    const { name, phone, address, bio, education, facebook, twitter, instagram, website } = req.body;
    const expertise = req.body.expertise ? req.body.expertise.split(',').map(skill => skill.trim()) : [];
    
    // Update author profile
    const author = await User.findById(req.session.user.id);
    author.name = name;
    author.phone = phone || '';
    author.address = address || '';
    author.bio = bio || '';
    author.education = education || '';
    author.expertise = expertise;
    author.socialLinks = {
      facebook: facebook || '',
      twitter: twitter || '',
      instagram: instagram || '',
      website: website || ''
    };
    
    await author.save();
    
    // Update session user data
    req.session.user = {
      id: author._id,
      name: author.name,
      email: author.email,
      role: author.role,
      avatar: author.avatar
    };
    
    req.flash('success_msg', 'Hồ sơ đã được cập nhật thành công');
    res.redirect('/author/profile');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Không thể cập nhật hồ sơ');
    res.redirect('/author/profile');
  }
});

export default router;