import mongoose from 'mongoose';
import Book from './src/models/Book.js';

mongoose.connect('mongodb://localhost:27017/bookstore', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log('Connected to MongoDB');
  
  const oldAuthorId = '6867a799e1f60d534a38a0a0';
  const newAuthorId = '6852d73afd39383f5bb95dc1';
  
  try {
    // 1. Find books with old author ID
    const booksWithOldAuthor = await Book.find({ author: oldAuthorId });
    console.log(`\nTìm thấy ${booksWithOldAuthor.length} sách có author ID cũ:`);
    
    if (booksWithOldAuthor.length > 0) {
      booksWithOldAuthor.forEach(book => {
        console.log(`- ${book.title} (ID: ${book._id})`);
      });
      
      // 2. Update all books with old author ID to new author ID
      const updateResult = await Book.updateMany(
        { author: oldAuthorId },
        { $set: { author: newAuthorId } }
      );
      
      console.log(`\n✅ Đã cập nhật ${updateResult.modifiedCount} sách từ author ID cũ sang ID mới`);
      
      // 3. Verify the update
      const updatedBooks = await Book.find({ author: newAuthorId });
      console.log(`\nXác nhận: Hiện có ${updatedBooks.length} sách với author ID mới`);
    } else {
      console.log('Không tìm thấy sách nào có author ID cũ');
    }
    
    // 4. Check if old author ID still exists in any books
    const remainingBooks = await Book.find({ author: oldAuthorId });
    if (remainingBooks.length === 0) {
      console.log('✅ Không còn sách nào có author ID cũ');
    } else {
      console.log(`⚠️  Vẫn còn ${remainingBooks.length} sách có author ID cũ`);
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('Lỗi khi cập nhật:', error);
    process.exit(1);
  }
}).catch(err => {
  console.error('Lỗi kết nối MongoDB:', err);
  process.exit(1);
}); 