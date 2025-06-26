import mongoose from 'mongoose';
import slugify from 'slugify';

const ArticleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Vui lòng nhập tiêu đề bài viết'],
    trim: true,
    maxlength: [200, 'Tiêu đề không quá 200 ký tự']
  },
  slug: String,
  excerpt: {
    type: String,
    required: [true, 'Vui lòng nhập tóm tắt bài viết'],
    maxlength: [500, 'Tóm tắt không quá 500 ký tự']
  },
  content: {
    type: String,
    required: [true, 'Vui lòng nhập nội dung bài viết']
  },
  featuredImage: {
    type: String,
    default: '/images/articles/default-article.jpg'
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  relatedBooks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book'
  }],
  tags: {
    type: [String],
    default: []
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  featured: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  publishedAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Generate slug from title
ArticleSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  
  // Set publishedAt when status changes to published
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  // Update updatedAt
  this.updatedAt = new Date();
  
  next();
});

// Index for better performance
ArticleSchema.index({ status: 1, publishedAt: -1 });
ArticleSchema.index({ slug: 1 });
ArticleSchema.index({ author: 1 });

const Article = mongoose.model('Article', ArticleSchema);

export default Article; 