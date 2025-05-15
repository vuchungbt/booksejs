import mongoose from 'mongoose';
import slugify from 'slugify';
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

const fixSlugs = async () => {
  try {
    // Find all books
    const books = await Book.find({});
    console.log(`Found ${books.length} books`);
    
    let updatedCount = 0;
    
    // Update books without slugs or with incorrect slugs
    for (const book of books) {
      const correctSlug = slugify(book.title, { lower: true });
      
      // If slug is missing or different from what it should be
      if (!book.slug || book.slug !== correctSlug) {
        book.slug = correctSlug;
        await book.save();
        updatedCount++;
        console.log(`Updated slug for: ${book.title} -> ${book.slug}`);
      }
    }
    
    console.log(`Fixed slugs for ${updatedCount} books`);
    console.log('Script completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing slugs:', error);
    process.exit(1);
  }
};

// Run the function
fixSlugs(); 