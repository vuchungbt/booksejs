import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import ejsLayouts from 'express-ejs-layouts';
import session from 'express-session';
import flash from 'connect-flash';
import methodOverride from 'method-override';
import MongoStore from 'connect-mongo';
import dotenv from 'dotenv';

// Load config
dotenv.config();

// Import routes
import indexRoutes from './routes/index.js';
import authRoutes from './routes/auth.js';
import bookRoutes from './routes/books.js';
import cartRoutes from './routes/cart.js';
import orderRoutes from './routes/orders.js';
import adminRoutes from './routes/admin/index.js';
import authorRoutes from './routes/author/index.js';
import authorsRoutes from './routes/public/authors.js';
import articlesRoutes from './routes/articles.js';

// Import middleware
import { debugSession, debugLogin } from './middleware/debug.js';

// Import database connection
import connectDB from './config/db.js';

// Import Settings model
import Settings from './models/Settings.js';

// Initialize app
const app = express();
const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to database
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collection: 'sessions'
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
  })
);

// Flash messages
app.use(flash());

// Apply debug middleware
app.use(debugLogin);
app.use('/auth/*', debugSession);
app.use('/admin/*', debugSession);

// Load settings for all views
app.use(async (req, res, next) => {
  try {
    const settings = await Settings.getSiteSettings();
    res.locals.settings = settings;
  } catch (error) {
    console.error('Error loading settings:', error);
    res.locals.settings = null;
  }
  next();
});

// Global variables
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.session.user || null;
  next();
});

// Set up view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(ejsLayouts);
app.set('layout', 'layouts/main');

// Set up static files
app.use(express.static(path.join(__dirname, 'public')));
// Serve uploads directory specifically
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Routes
app.use('/', indexRoutes);
app.use('/auth', authRoutes);
app.use('/books', bookRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);
app.use('/admin', adminRoutes);
app.use('/author', authorRoutes);
app.use('/authors', authorsRoutes);
app.use('/articles', articlesRoutes);

// 404 page
app.use((req, res) => {
  res.status(404).render('error/404', {
    title: 'Không tìm thấy trang',
    layout: 'layouts/main'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error/500', {
    title: 'Lỗi máy chủ',
    layout: 'layouts/main',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server đang chạy trên cổng ${PORT}`);
});

export default app;