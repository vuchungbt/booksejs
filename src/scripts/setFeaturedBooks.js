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

const setFeaturedBooks = async () => {
  try {
    // Get all books
    const books = await Book.find();
    console.log(`Found ${books.length} books`);
    
    if (books.length === 0) {
      console.error('No books found in the database.');
      process.exit(1);
    }
    
    // Reset all featured flags
    await Book.updateMany({}, { featured: false });
    console.log('Reset featured flag for all books');
    
    // Determine how many books to feature (50% of books or maximum 8)
    const numToFeature = Math.min(Math.ceil(books.length / 2), 8);
    console.log(`Setting ${numToFeature} books as featured`);
    
    // Randomly select books to feature
    const booksToFeature = [];
    const selectedIndexes = new Set();
    
    while (selectedIndexes.size < numToFeature) {
      const randomIndex = Math.floor(Math.random() * books.length);
      if (!selectedIndexes.has(randomIndex)) {
        selectedIndexes.add(randomIndex);
        booksToFeature.push(books[randomIndex]);
      }
    }
    
    // Update the selected books to be featured
    for (const book of booksToFeature) {
      book.featured = true;
      await book.save();
      console.log(`Marked as featured: "${book.title}"`);
    }
    
    console.log(`Successfully marked ${booksToFeature.length} books as featured`);
    console.log('Script completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error setting featured books:', error);
    process.exit(1);
  }
};

// Run the function
setFeaturedBooks(); 