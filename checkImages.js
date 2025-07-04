import Book from './src/models/Book.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGO_URI);

async function checkUploadedImages() {
  try {
    // Tìm sách có hình ảnh đã upload (không phải default)
    const booksWithRealImages = await Book.find({
      $or: [
        { 'cover': { $regex: '^/uploads/' } },
        { 'images': { $elemMatch: { $regex: '^/uploads/' } } }
      ]
    });
    
    console.log('=== SỐ SÁCH CÓ HÌNH ẢNH THẬT ===');
    console.log('Tổng số sách có hình ảnh upload:', booksWithRealImages.length);
    
    if (booksWithRealImages.length > 0) {
      console.log('\nDanh sách các sách có hình ảnh thật:');
      for (const book of booksWithRealImages) {
        console.log('- ' + book.title);
        console.log('  Cover:', book.cover);
        console.log('  Images:', book.images);
        console.log('---');
      }
    } else {
      console.log('\n❌ Không có sách nào có hình ảnh thật được upload!');
      console.log('Tất cả sách đều đang sử dụng hình ảnh mặc định.');
    }
    
    // Kiểm tra thêm - tìm sách có hình ảnh khác default
    const booksWithNonDefaultImages = await Book.find({
      $or: [
        { 'cover': { $not: { $regex: '^/images/books/default-book' } } },
        { 'images': { $elemMatch: { $not: { $regex: '^/images/books/default-book' } } } }
      ]
    });
    
    console.log('\n=== SÁCH CÓ HÌNH ẢNH KHÁC DEFAULT ===');
    console.log('Số sách có hình ảnh khác default:', booksWithNonDefaultImages.length);
    
    if (booksWithNonDefaultImages.length > 0) {
      for (const book of booksWithNonDefaultImages) {
        console.log('- ' + book.title);
        console.log('  Cover:', book.cover);
        console.log('  Images:', book.images);
        console.log('---');
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkUploadedImages(); 