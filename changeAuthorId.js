import mongoose from 'mongoose';
import User from './src/models/User.js';
import Book from './src/models/Book.js';

mongoose.connect('mongodb://localhost:27017/bookstore1', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log('Connected to MongoDB');
  
  const oldAuthorId = '686a295ed8987de86954c1ff';
  const newAuthorId = '68678de5c0de8d2f43bcffd4';
  
  try {
    // 1. Find the author to be changed
    const oldAuthor = await User.findById(oldAuthorId);
    if (!oldAuthor) {
      console.log('❌ Không tìm thấy author với ID cũ');
      process.exit(1);
    }
    
    console.log(`✅ Tìm thấy author: ${oldAuthor.name} (${oldAuthor.email})`);
    
    // 2. Check if new ID already exists
    const existingAuthor = await User.findById(newAuthorId);
    if (existingAuthor) {
      console.log(`⚠️  Author với ID mới đã tồn tại: ${existingAuthor.name} (${existingAuthor.email})`);
      console.log('🔄 Sẽ merge 2 authors: chỉ cập nhật references và xóa author cũ');
      
      // Skip creating new author, go directly to updating books
    } else {
      // 3. Save original data before changing
      const originalEmail = oldAuthor.email;
      const authorData = oldAuthor.toObject();
      delete authorData._id; // Remove old _id
      
      // 4. Temporarily change old author's email to avoid duplicate key error
      const tempEmail = `temp_${Date.now()}_${originalEmail}`;
      await User.findByIdAndUpdate(oldAuthorId, { email: tempEmail });
      console.log(`🔄 Tạm thời đổi email cũ thành: ${tempEmail}`);
      
      // 5. Create new author document with new ID and original email
      const newAuthor = new User({
        _id: new mongoose.Types.ObjectId(newAuthorId),
        ...authorData,
        email: originalEmail // Keep original email
      });
      
      // 6. Save new author
      await newAuthor.save();
      console.log(`✅ Đã tạo author mới với ID: ${newAuthorId}`);
    }
    
    // 7. Update all books that reference the old author
    const updateResult = await Book.updateMany(
      { author: oldAuthorId },
      { $set: { author: newAuthorId } }
    );
    console.log(`✅ Đã cập nhật ${updateResult.modifiedCount} sách sang author ID mới`);
    
    // 8. Delete old author
    await User.findByIdAndDelete(oldAuthorId);
    console.log(`✅ Đã xóa author cũ với ID: ${oldAuthorId}`);
    
    console.log('🎉 HOÀN THÀNH! Đã thay đổi ID author thành công');
    
    // 9. Verify the change
    console.log('\n=== KIỂM TRA KẾT QUẢ ===');
    const verifyAuthor = await User.findById(newAuthorId);
    console.log(`Author mới: ${verifyAuthor ? verifyAuthor.name : 'KHÔNG TÌM THẤY'}`);
    
    const verifyOldAuthor = await User.findById(oldAuthorId);
    console.log(`Author cũ: ${verifyOldAuthor ? 'VẪN TỒN TẠI' : 'ĐÃ XÓA'}`);
    
    const booksWithNewAuthor = await Book.find({ author: newAuthorId });
    console.log(`Số sách với author ID mới: ${booksWithNewAuthor.length}`);
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
}).catch(err => {
  console.error('❌ Lỗi kết nối MongoDB:', err);
  process.exit(1);
}); 