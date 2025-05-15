// Kiểm tra người dùng đã đăng nhập chưa
export const isLoggedIn = (req, res, next) => {
  if (!req.session.user) {
    req.flash('error_msg', 'Vui lòng đăng nhập để tiếp tục');
    return res.redirect('/auth/login');
  }
  next();
};

// Kiểm tra người dùng chưa đăng nhập
export const isLoggedOut = (req, res, next) => {
  if (req.session.user) {
    return res.redirect('/');
  }
  next();
};

// Kiểm tra người dùng có quyền admin
export const isAdmin = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    req.flash('error_msg', 'Bạn không có quyền truy cập trang này');
    return res.redirect('/');
  }
  next();
};

// Kiểm tra người dùng có quyền tác giả
export const isAuthor = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== 'author') {
    req.flash('error_msg', 'Bạn không có quyền truy cập trang này');
    return res.redirect('/');
  }
  next();
};

// Kiểm tra người dùng có quyền admin hoặc tác giả
export const isAdminOrAuthor = (req, res, next) => {
  if (!req.session.user || (req.session.user.role !== 'admin' && req.session.user.role !== 'author')) {
    req.flash('error_msg', 'Bạn không có quyền truy cập trang này');
    return res.redirect('/');
  }
  next();
};