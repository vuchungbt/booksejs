import express from 'express';
import Article from '../models/Article.js';
import Book from '../models/Book.js';

const router = express.Router();

// @desc    Get all published articles
// @route   GET /articles
// @access  Public
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = 6;
    const skip = (page - 1) * limit;
    
    let query = { status: 'published' };
    
    // Search by title
    if (req.query.search) {
      query.title = { $regex: req.query.search, $options: 'i' };
    }
    
    // Filter by tag
    if (req.query.tag) {
      query.tags = { $in: [req.query.tag] };
    }
    
    // Count total articles
    const total = await Article.countDocuments(query);
    
    // Find articles
    const articles = await Article.find(query)
      .populate('author', 'name')
      .populate('relatedBooks', 'title slug')
      .skip(skip)
      .limit(limit)
      .sort({ publishedAt: -1, createdAt: -1 });
    
    // Get featured articles
    const featuredArticles = await Article.find({ 
      status: 'published', 
      featured: true 
    })
      .populate('author', 'name')
      .limit(3)
      .sort({ publishedAt: -1 });
    
    // Get all tags for filter
    const allArticles = await Article.find({ status: 'published' }).select('tags');
    const allTags = [...new Set(allArticles.flatMap(article => article.tags))].sort();
    
    res.render('articles/index', {
      title: 'Bài viết',
      articles,
      featuredArticles: page === 1 ? featuredArticles : [],
      allTags,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      search: req.query.search || '',
      tag: req.query.tag || ''
    });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Không thể tải danh sách bài viết');
    res.redirect('/');
  }
});

// @desc    Get article details
// @route   GET /articles/:slug
// @access  Public
router.get('/:slug', async (req, res) => {
  try {
    // Find article by slug
    const article = await Article.findOne({ 
      slug: req.params.slug, 
      status: 'published' 
    })
      .populate('author', 'name avatar')
      .populate('relatedBooks', 'title slug cover price');
    
    if (!article) {
      req.flash('error_msg', 'Không tìm thấy bài viết');
      return res.redirect('/articles');
    }
    
    // Increase view count
    article.views += 1;
    await article.save();
    
    // Get related articles (same tags)
    const relatedArticles = await Article.find({
      _id: { $ne: article._id },
      status: 'published',
      tags: { $in: article.tags }
    })
      .populate('author', 'name')
      .limit(3)
      .sort({ publishedAt: -1 });
    
    // If not enough related articles, get recent ones
    if (relatedArticles.length < 3) {
      const recentArticles = await Article.find({
        _id: { $ne: article._id },
        status: 'published'
      })
        .populate('author', 'name')
        .limit(3 - relatedArticles.length)
        .sort({ publishedAt: -1 });
      
      relatedArticles.push(...recentArticles);
    }
    
    res.render('articles/detail', {
      title: article.title,
      article,
      relatedArticles,
      // SEO meta tags
      metaDescription: article.excerpt,
      ogTitle: article.title,
      ogDescription: article.excerpt,
      ogImage: article.featuredImage
    });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Không thể tải bài viết');
    res.redirect('/articles');
  }
});

export default router; 