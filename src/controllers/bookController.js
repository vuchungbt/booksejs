import Book from '../models/Book.js';
import Category from '../models/Category.js';
import slugify from 'slugify';

// @desc    Get all books
// @route   GET /books
// @access  Public
export const getAllBooks = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = 12;
    const skip = (page - 1) * limit;

    let query = {};
    
    // Search by title
    if (req.query.search) {
      query.title = { $regex: req.query.search, $options: 'i' };
    }
    
    // Filter by category
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    // Filter by author
    if (req.query.author) {
      query.author = req.query.author;
    }
    
    // Filter by price range
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      
      if (req.query.minPrice) {
        query.price.$gte = parseInt(req.query.minPrice);
      }
      
      if (req.query.maxPrice) {
        query.price.$lte = parseInt(req.query.maxPrice);
      }
    }

    // Count total books
    const total = await Book.countDocuments(query);
    
    // Set sorting options
    let sortOptions = { createdAt: -1 }; // Default: newest first
    
    if (req.query.sort) {
      switch(req.query.sort) {
        case 'price-asc':
          sortOptions = { price: 1 };
          break;
        case 'price-desc':
          sortOptions = { price: -1 };
          break;
        case 'name-asc':
          sortOptions = { title: 1 };
          break;
        case 'name-desc':
          sortOptions = { title: -1 };
          break;
        case 'rating-desc':
          sortOptions = { avgRating: -1 };
          break;
      }
    }
    
    // Find books
    const books = await Book.find(query)
      .populate('category', 'name')
      .populate('author', 'name')
      .skip(skip)
      .limit(limit)
      .sort(sortOptions);
    
    // Get all categories for filter
    const categories = await Category.find();
    
    // Get all authors for filter
    const User = (await import('../models/User.js')).default;
    const authors = await User.find({ role: 'author' }).select('name');

    res.render('books/index', {
      title: 'Danh sách sách',
      books,
      categories,
      authors,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      search: req.query.search || '',
      category: req.query.category || '',
      author: req.query.author || '',
      minPrice: req.query.minPrice || '',
      maxPrice: req.query.maxPrice || '',
      sort: req.query.sort || '',
    });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Không thể tải danh sách sách');
    res.redirect('/');
  }
};

// @desc    Get book details
// @route   GET /books/:slug
// @access  Public
export const getBookDetails = async (req, res) => {
  try {
    console.log(`Fetching book with slug: ${req.params.slug}`);
    
    // Try to find by slug first
    let book = await Book.findOne({ slug: req.params.slug })
      .populate('category', 'name slug')
      .populate('author', 'name')
      .populate('ratings.user', 'name avatar');
    
    // If not found by slug, try to find by ID
    if (!book) {
      book = await Book.findById(req.params.slug)
        .populate('category', 'name slug')
        .populate('author', 'name')
        .populate('ratings.user', 'name avatar');
    }
    
    if (!book) {
      console.log(`No book found with slug/id: ${req.params.slug}`);
      req.flash('error_msg', 'Không tìm thấy sách');
      return res.redirect('/books');
    }

    // If book doesn't have slug, generate one (but don't save to avoid triggering pre-save hooks)
    if (!book.slug) {
      book.slug = slugify(book.title, { lower: true });
    }

    console.log(`Found book: ${book.title} (${book._id})`);

    // Get related books
    let relatedBooks = [];
    
    if (book.category) {
      relatedBooks = await Book.find({
      category: book.category._id,
      _id: { $ne: book._id }
    })
      .populate('category', 'name')
        .populate('author', 'name')
        .limit(4);
    } else {
      // If the book has no category, get some random books
      relatedBooks = await Book.find({
        _id: { $ne: book._id }
      })
        .populate('category', 'name')
        .populate('author', 'name')
      .limit(4);
    }

    // Create absolute URL for canonical and social sharing
    const protocol = req.protocol;
    const host = req.get('host');
    const baseUrl = `${protocol}://${host}`;
    const canonicalUrl = `${baseUrl}/books/${book.slug}`;
    
    // Prepare SEO description (truncate if too long)
    const truncatedDescription = book.description.length > 160 
      ? book.description.substring(0, 157) + '...' 
      : book.description;
    
    // Main image for social sharing
    const mainImage = book.images && book.images.length > 0 
      ? `${baseUrl}${book.images[0]}` 
      : `${baseUrl}${book.cover}`;
    
    // Price with discount for SEO
    const finalPrice = book.discount > 0 
      ? Math.round(book.price * (1 - book.discount/100)) 
      : book.price;
    
    // Additional structured data for books (JSON-LD)
    const structuredData = `
      <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "Book",
        "name": "${book.title.replace(/"/g, '\\"')}",
        "author": {
          "@type": "Person",
          "name": "${book.author ? book.author.name.replace(/"/g, '\\"') : 'Unknown'}"
        },
        "isbn": "${book.isbn}",
        "numberOfPages": ${book.pages},
        "publisher": "${book.publisher.replace(/"/g, '\\"')}",
        "datePublished": "${new Date(book.publicationDate).toISOString().split('T')[0]}",
        "description": "${book.description.replace(/"/g, '\\"').substring(0, 500)}",
        "image": "${mainImage}",
        "offers": {
          "@type": "Offer",
          "price": ${finalPrice},
          "priceCurrency": "VND",
          "availability": "${book.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'}"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": ${book.avgRating || 0},
          "reviewCount": ${book.numReviews || 0}
        }
      }
      </script>
    `;

    res.render('books/detail', {
      title: book.title,
      book,
      relatedBooks,
      // SEO meta tags
      metaDescription: truncatedDescription,
      canonicalUrl: canonicalUrl,
      ogTitle: `${book.title} - ${book.author ? book.author.name : 'Không xác định'}`,
      ogDescription: truncatedDescription,
      ogImage: mainImage,
      ogType: 'product',
      twitterTitle: book.title,
      twitterDescription: truncatedDescription,
      twitterImage: mainImage,
      additionalMeta: structuredData
    });
  } catch (error) {
    console.error('Error in getBookDetails:', error);
    req.flash('error_msg', 'Không thể tải thông tin sách');
    res.redirect('/books');
  }
};

// @desc    Add review to book
// @route   POST /books/:id/reviews
// @access  Private
export const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const book = await Book.findById(req.params.id);

    if (!book) {
      req.flash('error_msg', 'Không tìm thấy sách');
      return res.redirect('/books');
    }

    // Check if user already reviewed
    const alreadyReviewed = book.ratings.find(
      r => r.user.toString() === req.session.user.id
    );

    if (alreadyReviewed) {
      req.flash('error_msg', 'Bạn đã đánh giá sách này rồi');
      return res.redirect(`/books/${book.slug}`);
    }

    // Add review
    const review = {
      user: req.session.user.id,
      rating: Number(rating),
      comment
    };

    book.ratings.push(review);
    
    // Calculate average rating
    book.calculateAvgRating();
    
    req.flash('success_msg', 'Đánh giá đã được thêm');
    res.redirect(`/books/${book.slug}`);
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Không thể thêm đánh giá');
    res.redirect(`/books/${req.params.slug}`);
  }
};