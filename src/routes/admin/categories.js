import express from 'express';
import Category from '../../models/Category.js';

const router = express.Router();

// @desc    Get all categories
// @route   GET /admin/categories
// @access  Private/Admin
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    
    res.render('admin/categories/index', {
      title: 'Quản lý danh mục',
      layout: 'layouts/admin',
      categories
    });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Không thể tải danh sách danh mục');
    res.redirect('/admin');
  }
});

// @desc    Show add category form
// @route   GET /admin/categories/add
// @access  Private/Admin
router.get('/add', (req, res) => {
  res.render('admin/categories/add', {
    title: 'Thêm danh mục mới',
    layout: 'layouts/admin'
  });
});

// @desc    Add new category
// @route   POST /admin/categories
// @access  Private/Admin
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;
    
    // Check if category exists
    const categoryExists = await Category.findOne({ name });
    if (categoryExists) {
      req.flash('error_msg', 'Danh mục này đã tồn tại');
      return res.redirect('/admin/categories/add');
    }
    
    // Create category
    await Category.create({
      name,
      description
    });
    
    req.flash('success_msg', 'Thêm danh mục thành công');
    res.redirect('/admin/categories');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Không thể thêm danh mục');
    res.redirect('/admin/categories/add');
  }
});

// @desc    Show edit category form
// @route   GET /admin/categories/edit/:id
// @access  Private/Admin
router.get('/edit/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      req.flash('error_msg', 'Không tìm thấy danh mục');
      return res.redirect('/admin/categories');
    }
    
    res.render('admin/categories/edit', {
      title: 'Chỉnh sửa danh mục',
      layout: 'layouts/admin',
      category
    });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Không thể tải thông tin danh mục');
    res.redirect('/admin/categories');
  }
});

// @desc    Update category
// @route   PUT /admin/categories/:id
// @access  Private/Admin
router.put('/:id', async (req, res) => {
  try {
    const { name, description } = req.body;
    
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      req.flash('error_msg', 'Không tìm thấy danh mục');
      return res.redirect('/admin/categories');
    }
    
    // Check if new name already exists
    if (name !== category.name) {
      const categoryExists = await Category.findOne({ name });
      if (categoryExists) {
        req.flash('error_msg', 'Danh mục này đã tồn tại');
        return res.redirect(`/admin/categories/edit/${req.params.id}`);
      }
    }
    
    // Update category
    category.name = name;
    category.description = description;
    await category.save();
    
    req.flash('success_msg', 'Cập nhật danh mục thành công');
    res.redirect('/admin/categories');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Không thể cập nhật danh mục');
    res.redirect(`/admin/categories/edit/${req.params.id}`);
  }
});

// @desc    Delete category
// @route   DELETE /admin/categories/:id
// @access  Private/Admin
router.delete('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      req.flash('error_msg', 'Không tìm thấy danh mục');
      return res.redirect('/admin/categories');
    }
    
    // Check if category has books
    const Book = (await import('../../models/Book.js')).default;
    const hasBooks = await Book.exists({ category: req.params.id });
    
    if (hasBooks) {
      req.flash('error_msg', 'Không thể xóa danh mục đang có sách');
      return res.redirect('/admin/categories');
    }
    
    await category.remove();
    
    req.flash('success_msg', 'Xóa danh mục thành công');
    res.redirect('/admin/categories');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Không thể xóa danh mục');
    res.redirect('/admin/categories');
  }
});

export default router;