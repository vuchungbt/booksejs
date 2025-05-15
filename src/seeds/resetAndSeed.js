import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Book from '../models/Book.js';
import { createMoreBooks } from './seedBooks.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  });

const resetAndSeed = async () => {
  try {
    // Delete all existing books
    console.log('Deleting existing books...');
    await Book.deleteMany({});
    console.log('All existing books deleted');

    // Get existing authors and categories
    const authors = await User.find({ role: 'author' });
    const categories = await Category.find();

    if (authors.length === 0) {
      console.error('No authors found in the database. Please create authors first.');
      process.exit(1);
    }

    if (categories.length === 0) {
      console.error('No categories found in the database. Please create categories first.');
      process.exit(1);
    }

    // Create new books
    console.log('Creating new books...');
    await createMoreBooks(authors, categories);
    console.log('New books created successfully');

    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

resetAndSeed(); 