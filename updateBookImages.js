import Book from './src/models/Book.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

mongoose.connect(process.env.MONGO_URI);

async function updateBookImages() {
  try {
    // Lấy danh sách file hình ảnh đã upload
    const uploadsDir = './src/public/uploads/books';
    const uploadedImages = fs.readdirSync(uploadsDir)
      .filter(file => file.match(/\.(jpg|jpeg|png|webp)$/i))
      .map(file => `/uploads/books/${file}`);
    
    console.log('=== HÌNH ẢNH ĐÃ UPLOAD ===');
    console.log('Số file hình ảnh đã upload:', uploadedImages.length);
    uploadedImages.forEach((img, index) => {
      console.log(`${index + 1}. ${img}`);
    });
    
    // Lấy một số sách đầu tiên để cập nhật
    const books = await Book.find().limit(Math.min(5, uploadedImages.length));
    
    console.log('\n=== CẬP NHẬT HÌNH ẢNH CHO SÁCH ===');
    
    for (let i = 0; i < books.length && i < uploadedImages.length; i++) {
      const book = books[i];
      const imageIndex = i % uploadedImages.length;
      
      // Cập nhật cover và images
      book.cover = uploadedImages[imageIndex];
      book.images = [
        uploadedImages[imageIndex],
        uploadedImages[(imageIndex + 1) % uploadedImages.length] || uploadedImages[0],
        uploadedImages[(imageIndex + 2) % uploadedImages.length] || uploadedImages[0]
      ];
      
      await book.save();
      
      console.log(`✅ Đã cập nhật hình ảnh cho sách: ${book.title}`);
      console.log(`   Cover: ${book.cover}`);
      console.log(`   Images: ${book.images.join(', ')}`);
      console.log('---');
    }
    
    console.log('\n🎉 Hoàn thành cập nhật hình ảnh!');
    console.log('Bây giờ bạn có thể kiểm tra lại trang chi tiết sách.');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

updateBookImages(); 