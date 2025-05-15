import Order from '../models/Order.js';
import Book from '../models/Book.js';

// @desc    Get checkout page
// @route   GET /orders/checkout
// @access  Private
export const getCheckout = (req, res) => {
  const cart = req.session.cart;
  
  if (!cart || cart.items.length === 0) {
    req.flash('error_msg', 'Giỏ hàng của bạn đang trống');
    return res.redirect('/cart');
  }
  
  res.render('orders/checkout', {
    title: 'Thanh toán',
    cart
  });
};

// @desc    Create order
// @route   POST /orders
// @access  Private
export const createOrder = async (req, res) => {
  try {
    const cart = req.session.cart;
    
    if (!cart || cart.items.length === 0) {
      req.flash('error_msg', 'Giỏ hàng của bạn đang trống');
      return res.redirect('/cart');
    }
    
    const { fullName, address, city, phone, paymentMethod } = req.body;
    
    // Create order items
    const orderItems = cart.items.map(item => {
      return {
        book: item.book._id,
        quantity: item.quantity,
        price: item.book.price
      };
    });
    
    // Create order
    const order = await Order.create({
      user: req.session.user.id,
      items: orderItems,
      shippingAddress: {
        fullName,
        address,
        city,
        phone
      },
      paymentMethod,
      totalAmount: cart.totalPrice
    });
    
    // Update stock
    for (const item of cart.items) {
      const book = await Book.findById(item.book._id);
      book.stock -= item.quantity;
      await book.save();
    }
    
    // Clear cart
    req.session.cart = {
      items: [],
      totalQty: 0,
      totalPrice: 0
    };
    
    req.flash('success_msg', 'Đặt hàng thành công');
    res.redirect(`/orders/${order._id}`);
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Không thể tạo đơn hàng');
    res.redirect('/cart');
  }
};

// @desc    Get order details
// @route   GET /orders/:id
// @access  Private
export const getOrderDetails = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('items.book', 'title cover slug');
    
    if (!order) {
      req.flash('error_msg', 'Không tìm thấy đơn hàng');
      return res.redirect('/profile/orders');
    }
    
    // Check if user is owner of order
    if (order.user._id.toString() !== req.session.user.id && req.session.user.role !== 'admin') {
      req.flash('error_msg', 'Bạn không có quyền xem đơn hàng này');
      return res.redirect('/profile/orders');
    }
    
    res.render('orders/detail', {
      title: `Đơn hàng #${order._id}`,
      order
    });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Không thể tải thông tin đơn hàng');
    res.redirect('/profile/orders');
  }
};

// @desc    Get user orders
// @route   GET /profile/orders
// @access  Private
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.session.user.id })
      .sort({ createdAt: -1 });
    
    res.render('profile/orders', {
      title: 'Đơn hàng của tôi',
      orders
    });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Không thể tải danh sách đơn hàng');
    res.redirect('/profile');
  }
};