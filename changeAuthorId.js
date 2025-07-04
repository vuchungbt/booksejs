import mongoose from 'mongoose';
import User from './src/models/User.js';
import Book from './src/models/Book.js';

mongoose.connect('mongodb://localhost:27017/bookstore1', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log('Connected to MongoDB');
  
  const oldAuthorId = '6867a799e1f60d534a38a0a0';
  const newAuthorId = '6852d73afd39383f5bb95dc1';
  
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
      console.log(`⚠️  Author với ID mới đã tồn tại: ${existingAuthor.name}`);
      console.log('Bạn có muốn merge 2 authors này không? (Y/N)');
      // For safety, we'll exit here
      console.log('Script dừng để tránh ghi đè. Hãy kiểm tra và chạy lại nếu chắc chắn.');
      process.exit(1);
    }
    
    // 3. Create new author document with new ID
    const authorData = oldAuthor.toObject();
    delete authorData._id; // Remove old _id
    
    const newAuthor = new User({
      _id: new mongoose.Types.ObjectId(newAuthorId),
      ...authorData
    });
    
    // 4. Save new author (no transaction needed for standalone MongoDB)
    await newAuthor.save();
    console.log(`✅ Đã tạo author mới với ID: ${newAuthorId}`);
    
    // 5. Update all books that reference the old author
    const updateResult = await Book.updateMany(
      { author: oldAuthorId },
      { $set: { author: newAuthorId } }
    );
    console.log(`✅ Đã cập nhật ${updateResult.modifiedCount} sách sang author ID mới`);
    
    // 6. Delete old author
    await User.findByIdAndDelete(oldAuthorId);
    console.log(`✅ Đã xóa author cũ với ID: ${oldAuthorId}`);
    
    console.log('🎉 HOÀN THÀNH! Đã thay đổi ID author thành công');
    
    // 7. Verify the change
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