import mongoose from 'mongoose';
import slugify from 'slugify';

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Vui lòng nhập tên danh mục'],
    unique: true,
    trim: true
  },
  slug: String,
  description: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Generate slug from name
CategorySchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

const Category = mongoose.model('Category', CategorySchema);

export default Category;