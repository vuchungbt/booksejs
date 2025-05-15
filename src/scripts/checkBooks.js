import mongoose from 'mongoose';
import dotenv from 'dotenv';
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

const checkBooks = async () => {
  try {
    const books = await Book.find({});
    
    console.log(`Total books in database: ${books.length}`);
    
    // Check for books without slugs
    const booksWithoutSlugs = books.filter(book => !book.slug);
    if (booksWithoutSlugs.length > 0) {
      console.log(`\nWARNING: Found ${booksWithoutSlugs.length} books without slugs:`);
      booksWithoutSlugs.forEach(book => {
        console.log(`- ${book.title} (ID: ${book._id})`);
      });
    } else {
      console.log('\nAll books have slugs.');
    }
    
    // Display sample book data
    if (books.length > 0) {
      const sampleBook = books[0];
      console.log('\nSample book data:');
      console.log({
        id: sampleBook._id,
        title: sampleBook.title,
        slug: sampleBook.slug,
        author: sampleBook.author,
        category: sampleBook.category
      });
      
      console.log('\nDetail URL would be: /books/' + sampleBook.slug);
    }
    
    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

checkBooks(); 