// @desc    Get cart page
// @route   GET /cart
// @access  Private
export const getCart = (req, res) => {
  res.render('cart/index', {
    title: 'Giỏ hàng',
    cart: req.session.cart || { items: [], totalQty: 0, totalPrice: 0, discount: 0 }
  });
};

// @desc    Add item to cart
// @route   POST /cart/add/:id
// @access  Private
export const addToCart = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    
    // Import Book model here to avoid circular dependency
    const Book = (await import('../models/Book.js')).default;
    
    const book = await Book.findById(id);
    
    if (!book) {
      req.flash('error_msg', 'Không tìm thấy sách');
      return res.redirect('/books');
    }
    
    // Initialize cart
    if (!req.session.cart) {
      req.session.cart = {
        items: [],
        totalQty: 0,
        totalPrice: 0,
        discount: 0,
        voucher: null
      };
    }
    
    const cart = req.session.cart;
    
    // Check if item already in cart
    const itemIndex = cart.items.findIndex(item => item.book._id.toString() === id);
    
    if (itemIndex > -1) {
      // Item exists, update quantity
      cart.items[itemIndex].quantity += parseInt(quantity);
      cart.totalQty += parseInt(quantity);
      cart.totalPrice += book.price * (1 - book.discount/100) * parseInt(quantity);
    } else {
      // Add new item
      cart.items.push({
        book: {
          _id: book._id,
          title: book.title,
          price: book.price,
          discount: book.discount,
          cover: book.cover,
          slug: book.slug
        },
        quantity: parseInt(quantity),
        price: book.price * (1 - book.discount/100) * parseInt(quantity)
      });
      
      cart.totalQty += parseInt(quantity);
      cart.totalPrice += book.price * (1 - book.discount/100) * parseInt(quantity);
    }
    
    // Recalculate total after voucher if exists
    if (cart.voucher) {
      applyVoucherToCart(cart);
    }
    
    req.flash('success_msg', 'Đã thêm sách vào giỏ hàng');
    res.redirect('/cart');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Không thể thêm vào giỏ hàng');
    res.redirect('/books');
  }
};

// @desc    Remove item from cart
// @route   GET /cart/remove/:id
// @access  Private
export const removeFromCart = (req, res) => {
  const { id } = req.params;
  const cart = req.session.cart;
  
  if (!cart) {
    return res.redirect('/cart');
  }
  
  const itemIndex = cart.items.findIndex(item => item.book._id.toString() === id);
  
  if (itemIndex > -1) {
    const item = cart.items[itemIndex];
    cart.totalQty -= item.quantity;
    cart.totalPrice -= item.price;
    cart.items.splice(itemIndex, 1);
    
    // Recalculate total after voucher if exists
    if (cart.voucher) {
      applyVoucherToCart(cart);
    }
  }
  
  req.flash('success_msg', 'Đã xóa sách khỏi giỏ hàng');
  res.redirect('/cart');
};

// @desc    Update cart quantity
// @route   POST /cart/update/:id
// @access  Private
export const updateCart = (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;
  const cart = req.session.cart;
  
  if (!cart) {
    return res.redirect('/cart');
  }
  
  const itemIndex = cart.items.findIndex(item => item.book._id.toString() === id);
  
  if (itemIndex > -1) {
    const item = cart.items[itemIndex];
    const diff = parseInt(quantity) - item.quantity;
    
    // Update quantity
    item.quantity = parseInt(quantity);
    const discountedPrice = item.book.price * (1 - item.book.discount/100);
    item.price = discountedPrice * parseInt(quantity);
    
    // Update cart totals
    cart.totalQty += diff;
    cart.totalPrice += diff * discountedPrice;
    
    // Recalculate total after voucher if exists
    if (cart.voucher) {
      applyVoucherToCart(cart);
    }
  }
  
  res.redirect('/cart');
};

// @desc    Clear cart
// @route   GET /cart/clear
// @access  Private
export const clearCart = (req, res) => {
  req.session.cart = {
    items: [],
    totalQty: 0,
    totalPrice: 0,
    discount: 0,
    voucher: null
  };
  
  req.flash('success_msg', 'Đã xóa giỏ hàng');
  res.redirect('/cart');
};

// @desc    Apply voucher
// @route   POST /cart/voucher
// @access  Private
export const applyVoucher = async (req, res) => {
  const { code } = req.body;
  const cart = req.session.cart;
  
  if (!cart || cart.items.length === 0) {
    req.flash('error_msg', 'Giỏ hàng trống');
    return res.redirect('/cart');
  }
  
  try {
    // Mã voucher hợp lệ (có thể lấy từ database)
    const vouchers = [
      { code: 'WELCOME10', discount: 10, minAmount: 0, type: 'percent', maxDiscount: 100000 },
      { code: 'SAVE20', discount: 20, minAmount: 500000, type: 'percent', maxDiscount: 200000 },
      { code: 'FREESHIP', discount: 30000, minAmount: 300000, type: 'fixed', maxDiscount: 30000 }
    ];
    
    // Tìm voucher
    const voucher = vouchers.find(v => v.code === code);
    
    if (!voucher) {
      req.flash('error_msg', 'Mã giảm giá không hợp lệ');
      return res.redirect('/cart');
    }
    
    // Kiểm tra điều kiện áp dụng
    if (cart.totalPrice < voucher.minAmount) {
      req.flash('error_msg', `Giá trị đơn hàng tối thiểu để áp dụng mã này là ${voucher.minAmount.toLocaleString('vi-VN')}đ`);
      return res.redirect('/cart');
    }
    
    // Lưu thông tin voucher vào giỏ hàng
    cart.voucher = voucher;
    
    // Áp dụng giảm giá
    applyVoucherToCart(cart);
    
    req.flash('success_msg', 'Đã áp dụng mã giảm giá');
    res.redirect('/cart');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Không thể áp dụng mã giảm giá');
    res.redirect('/cart');
  }
};

// @desc    Remove voucher
// @route   GET /cart/voucher/remove
// @access  Private
export const removeVoucher = (req, res) => {
  const cart = req.session.cart;
  
  if (!cart) {
    return res.redirect('/cart');
  }
  
  // Reset voucher and discount
  if (cart.voucher) {
    cart.totalPrice += cart.discount;
    cart.discount = 0;
    cart.voucher = null;
    
    req.flash('success_msg', 'Đã xóa mã giảm giá');
  }
  
  res.redirect('/cart');
};

// Helper function to apply voucher discount to cart
const applyVoucherToCart = (cart) => {
  // Reset discount first
  cart.totalPrice += cart.discount;
  cart.discount = 0;
  
  const voucher = cart.voucher;
  
  if (!voucher) return;
  
  // Calculate discount amount
  let discountAmount = 0;
  
  if (voucher.type === 'percent') {
    discountAmount = (cart.totalPrice * voucher.discount) / 100;
    // Cap discount if it exceeds max discount
    if (discountAmount > voucher.maxDiscount) {
      discountAmount = voucher.maxDiscount;
    }
  } else {
    // Fixed amount discount
    discountAmount = voucher.discount;
  }
  
  // Apply discount
  cart.discount = discountAmount;
  cart.totalPrice -= discountAmount;
};