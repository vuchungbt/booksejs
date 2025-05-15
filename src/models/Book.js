import mongoose from 'mongoose';
import slugify from 'slugify';

const BookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Vui lòng nhập tên sách'],
    unique: true,
    trim: true,
    maxlength: [100, 'Tên sách không quá 100 ký tự']
  },
  slug: String,
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  publisher: {
    type: String,
    required: [true, 'Vui lòng nhập tên nhà xuất bản']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  description: {
    type: String,
    required: [true, 'Vui lòng nhập mô tả sách']
  },
  price: {
    type: Number,
    required: [true, 'Vui lòng nhập giá sách']
  },
  discount: {
    type: Number,
    default: 0
  },
  cover: {
    type: String,
    default: '/images/books/default-book.png'
  },
  images: {
    type: [String],
    default: []
  },
  pages: {
    type: Number,
    required: [true, 'Vui lòng nhập số trang']
  },
  publicationDate: {
    type: Date,
    required: [true, 'Vui lòng nhập ngày xuất bản']
  },
  stock: {
    type: Number,
    required: [true, 'Vui lòng nhập số lượng tồn kho'],
    default: 0
  },
  isbn: {
    type: String,
    required: [true, 'Vui lòng nhập ISBN']
  },
  featured: {
    type: Boolean,
    default: false
  },
  ratings: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comment: String,
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  avgRating: {
    type: Number,
    default: 0
  },
  numReviews: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Generate slug from title
BookSchema.pre('save', function(next) {
  this.slug = slugify(this.title, { lower: true });
  next();
});

// Add default images when there are none
BookSchema.pre('save', function(next) {
  // If images array is empty, set default images
  if (!this.images || this.images.length === 0) {
    this.images = [
      '/images/books/default-book.png',
      '/images/books/default-book-1.png',
      '/images/books/default-book-2.png',
      '/images/books/default-book-3.png'
    ];
  }
  next();
});

// Calculate average rating
BookSchema.methods.calculateAvgRating = function() {
  if (this.ratings.length === 0) {
    this.avgRating = 0;
    this.numReviews = 0;
  } else {
    this.avgRating = this.ratings.reduce((acc, item) => item.rating + acc, 0) / this.ratings.length;
    this.numReviews = this.ratings.length;
  }
  
  this.save();
};

const Book = mongoose.model('Book', BookSchema);

export default Book;