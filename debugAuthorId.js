import mongoose from 'mongoose';
import Book from './src/models/Book.js';

mongoose.connect('mongodb://localhost:27017/bookstore1', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log('Connected to MongoDB');
  
  const oldAuthorId = '6867a799e1f60d534a38a0a0';
  
  try {
    // 1. Check all books and their author field types
    const allBooks = await Book.find({}, { title: 1, author: 1 });
    console.log(`\n=== TẤT CẢ SÁCH VÀ AUTHOR ID (${allBooks.length}) ===`);
    
    allBooks.forEach(book => {
      console.log(`- ${book.title}`);
      console.log(`  Author: ${book.author} (Type: ${typeof book.author})`);
      console.log(`  Match old ID: ${book.author?.toString() === oldAuthorId}`);
      console.log('  ---');
    });
    
    // 2. Try different search methods
    console.log('\n=== THỬ CÁC CÁCH TÌM KIẾM KHÁC NHAU ===');
    
    // As ObjectId
    const booksWithObjectId = await Book.find({ author: new mongoose.Types.ObjectId(oldAuthorId) });
    console.log(`ObjectId search: ${booksWithObjectId.length} books`);
    
    // As string
    const booksWithString = await Book.find({ author: oldAuthorId });
    console.log(`String search: ${booksWithString.length} books`);
    
    // Using $in with both formats
    const booksWithBoth = await Book.find({ 
      author: { 
        $in: [oldAuthorId, new mongoose.Types.ObjectId(oldAuthorId)] 
      } 
    });
    console.log(`Both formats search: ${booksWithBoth.length} books`);
    
    // 3. Check if any books have this author (case sensitive)
    const booksWithAuthorString = await Book.find({ author: { $regex: oldAuthorId, $options: 'i' } });
    console.log(`Regex search: ${booksWithAuthorString.length} books`);
    
    // 4. Raw MongoDB query
    const db = mongoose.connection.db;
    const rawBooks = await db.collection('books').find({ author: oldAuthorId }).toArray();
    console.log(`Raw string query: ${rawBooks.length} books`);
    
    const rawBooksObjectId = await db.collection('books').find({ 
      author: new mongoose.Types.ObjectId(oldAuthorId) 
    }).toArray();
    console.log(`Raw ObjectId query: ${rawBooksObjectId.length} books`);
    
    process.exit(0);
    
  } catch (error) {
    console.error('Lỗi khi debug:', error);
    process.exit(1);
  }
}).catch(err => {
  console.error('Lỗi kết nối MongoDB:', err);
  process.exit(1);
}); 