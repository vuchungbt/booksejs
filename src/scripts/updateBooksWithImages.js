import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Book from '../models/Book.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  });

const updateBooksWithImages = async () => {
  try {
    // Find all books
    const books = await Book.find({});
    console.log(`Found ${books.length} books`);
    
    let updatedCount = 0;
    
    // Default images to use
    const defaultImages = [
      '/images/books/default-book.png',
      '/images/books/default-book-1.png',
      '/images/books/default-book-2.png',
      '/images/books/default-book-3.png'
    ];
    
    // Update books with missing images array
    for (const book of books) {
      // Check if images array is empty or missing
      if (!book.images || book.images.length === 0) {
        // Add all default images to the book
        book.images = [...defaultImages];
        
        // Save the updated book
        await book.save();
        updatedCount++;
        console.log(`Updated images for book: ${book.title}`);
      }
    }
    
    console.log(`Updated ${updatedCount} books with multiple images`);
    console.log('Script completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error updating books with images:', error);
    process.exit(1);
  }
};

// Run the function
updateBooksWithImages(); 