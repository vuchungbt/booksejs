import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Book from '../models/Book.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  });

const checkDatabase = async () => {
  try {
    // Check users
    const users = await User.find({}).select('name email role');
    console.log('Users in the database:');
    console.table(users.map(u => ({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      role: u.role
    })));

    // Check categories
    const categories = await Category.find({});
    console.log('\nCategories in the database:');
    console.table(categories.map(c => ({
      id: c._id.toString(),
      name: c.name,
      description: c.description
    })));

    // Check books
    const books = await Book.find({})
      .select('title slug author category')
      .populate('author', 'name')
      .populate('category', 'name');

    console.log('\nBooks in the database:');
    console.table(books.map(b => ({
      id: b._id.toString(),
      title: b.title,
      slug: b.slug || 'NO SLUG',
      author: b.author ? b.author.name : 'No author',
      category: b.category ? b.category.name : 'No category'
    })));

    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

checkDatabase(); 