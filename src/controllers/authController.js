import User from '../models/User.js';

// @desc    Register a user
// @route   POST /auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email, password, password2 } = req.body;
    let errors = [];

    // Check required fields
    if (!name || !email || !password || !password2) {
      errors.push({ msg: 'Vui lòng điền đầy đủ thông tin' });
    }

    // Check passwords match
    if (password !== password2) {
      errors.push({ msg: 'Mật khẩu không khớp' });
    }

    // Check password length
    if (password.length < 6) {
      errors.push({ msg: 'Mật khẩu phải có ít nhất 6 ký tự' });
    }

    if (errors.length > 0) {
      return res.render('auth/register', {
        title: 'Đăng ký',
        errors,
        name,
        email
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      errors.push({ msg: 'Email đã tồn tại' });
      return res.render('auth/register', {
        title: 'Đăng ký',
        errors,
        name,
        email
      });
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password
    });

    if (user) {
      req.flash('success_msg', 'Đăng ký thành công, vui lòng đăng nhập');
      res.redirect('/auth/login');
    }
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Đã xảy ra lỗi khi đăng ký');
    res.redirect('/auth/register');
  }
};

// @desc    Login user
// @route   POST /auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check for user
    const user = await User.findOne({ email });
    if (!user) {
      req.flash('error_msg', 'Email hoặc mật khẩu không đúng');
      return res.render('auth/login', {
        title: 'Đăng nhập',
        email
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      req.flash('error_msg', 'Email hoặc mật khẩu không đúng');
      return res.render('auth/login', {
        title: 'Đăng nhập',
        email
      });
    }

    // Create session
    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    // Redirect based on role
    if (user.role === 'admin') {
      res.redirect('/admin');
    } else if (user.role === 'author') {
      res.redirect('/author');
    } else {
      res.redirect('/');
    }
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Đã xảy ra lỗi khi đăng nhập');
    res.redirect('/auth/login');
  }
};

// @desc    Logout user
// @route   GET /auth/logout
// @access  Private
export const logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
};

// @desc    Get login page
// @route   GET /auth/login
// @access  Public
export const getLoginPage = (req, res) => {
  res.render('auth/login', {
    title: 'Đăng nhập'
  });
};

// @desc    Get register page
// @route   GET /auth/register
// @access  Public
export const getRegisterPage = (req, res) => {
  res.render('auth/register', {
    title: 'Đăng ký'
  });
};