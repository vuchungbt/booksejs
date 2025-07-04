import mongoose from 'mongoose';
import User from './src/models/User.js';

mongoose.connect('mongodb://localhost:27017/bookstore', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log('Connected to MongoDB');
  
  try {
    // Query all authors
    const authors = await User.find(
      { role: 'author' },
      { _id: 1, name: 1, email: 1 }
    ).sort({ name: 1 });
    
    console.log(`\n=== TẤT CẢ TÁC GIẢ (${authors.length}) ===`);
    console.log('ID'.padEnd(26) + ' | ' + 'TÊN'.padEnd(30) + ' | ' + 'EMAIL');
    console.log('-'.repeat(80));
    
    if (authors.length > 0) {
      authors.forEach(author => {
        console.log(`${author._id.toString().padEnd(26)} | ${author.name.padEnd(30)} | ${author.email || 'N/A'}`);
      });
    } else {
      console.log('Không tìm thấy tác giả nào trong database');
    }
    
    // Also check if there are any books without valid author references
    const { default: Book } = await import('./src/models/Book.js');
    const allBooks = await Book.find({}, { title: 1, author: 1 }).populate('author', 'name');
    
    console.log(`\n=== KIỂM TRA SÁCH KHÔNG CÓ TÁC GIẢ ===`);
    const booksWithoutAuthor = allBooks.filter(book => !book.author);
    
    if (booksWithoutAuthor.length > 0) {
      console.log(`⚠️  Có ${booksWithoutAuthor.length} sách không có tác giả:`);
      booksWithoutAuthor.forEach(book => {
        console.log(`- ${book.title} (ID: ${book._id})`);
      });
    } else {
      console.log('✅ Tất cả sách đều có tác giả hợp lệ');
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('Lỗi khi query authors:', error);
    process.exit(1);
  }
}).catch(err => {
  console.error('Lỗi kết nối MongoDB:', err);
  process.exit(1);
}); 