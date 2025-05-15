import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Book from '../models/Book.js';
import User from '../models/User.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  });

const fixBookAuthors = async () => {
  try {
    // Get all authors
    const authors = await User.find({ role: 'author' });
    
    if (authors.length === 0) {
      console.error('No authors found in the database. Please run the seedUsers.js script first.');
      process.exit(1);
    }
    
    console.log(`Found ${authors.length} authors`);
    
    // Get all books
    const books = await Book.find();
    console.log(`Found ${books.length} books`);
    
    let updatedCount = 0;
    
    // Update books with null authors
    for (const book of books) {
      // Check if author is null/undefined or not a valid ObjectId
      if (!book.author || !(mongoose.Types.ObjectId.isValid(book.author))) {
        // Assign a random author from our authors list
        const randomAuthor = authors[Math.floor(Math.random() * authors.length)];
        book.author = randomAuthor._id;
        
        // Save the updated book
        await book.save();
        updatedCount++;
        console.log(`Updated author for book: "${book.title}" → ${randomAuthor.name}`);
      } else {
        // Verify if the author exists
        const authorExists = await User.findById(book.author);
        if (!authorExists) {
          // Author ID is valid but doesn't exist, assign a new author
          const randomAuthor = authors[Math.floor(Math.random() * authors.length)];
          book.author = randomAuthor._id;
          await book.save();
          updatedCount++;
          console.log(`Fixed invalid author reference for book: "${book.title}" → ${randomAuthor.name}`);
        }
      }
    }
    
    if (updatedCount === 0) {
      console.log('All books already have valid author references. No updates needed.');
    } else {
      console.log(`Updated author references for ${updatedCount} books.`);
    }
    
    console.log('Script completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing book authors:', error);
    process.exit(1);
  }
};

// Run the function
fixBookAuthors(); 