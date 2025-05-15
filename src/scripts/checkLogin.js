import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import bcrypt from 'bcrypt';

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  });

const checkLoginCredentials = async () => {
  try {
    // Check if admin user exists
    const admin = await User.findOne({ email: 'admin@gmail.com' });
    
    if (!admin) {
      console.error('Không tìm thấy tài khoản admin với email admin@gmail.com');
      console.log('Hãy chạy script seedUsers.js để tạo tài khoản admin mẫu');
      process.exit(1);
    }
    
    console.log('\nTìm thấy tài khoản admin:');
    console.log('- Email:', admin.email);
    console.log('- Tên:', admin.name);
    console.log('- Vai trò:', admin.role);
    console.log('- Password hash:', admin.password);
    
    // Test the password
    const password = 'admin123';
    const isPasswordValid = await admin.matchPassword(password);
    
    console.log('\nKiểm tra mật khẩu "admin123":');
    console.log('- Kết quả:', isPasswordValid ? 'Đúng ✓' : 'Sai ✗');
    
    if (!isPasswordValid) {
      console.log('\nĐặt lại mật khẩu:');
      
      // Completely recreate the password - don't use .save() which might trigger unexpected hooks
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // Update using updateOne to bypass any middleware
      const result = await User.updateOne(
        { _id: admin._id },
        { $set: { password: hashedPassword }}
      );
      
      console.log('- Đã đặt lại mật khẩu thành "admin123" sử dụng updateOne ✓');
      console.log('- Kết quả cập nhật:', result.modifiedCount ? 'Thành công' : 'Thất bại');
      
      // Fetch the admin again to verify
      const updatedAdmin = await User.findById(admin._id);
      console.log('- Password hash mới:', updatedAdmin.password);
      
      // Verify the new password
      const verifyNewPassword = await bcrypt.compare(password, updatedAdmin.password);
      console.log('- Kiểm tra trực tiếp với bcrypt:', verifyNewPassword ? 'Đúng ✓' : 'Sai ✗');
      
      // Verify with the model method
      const verifyWithMethod = await updatedAdmin.matchPassword(password);
      console.log('- Kiểm tra với model method:', verifyWithMethod ? 'Đúng ✓' : 'Sai ✗');
    }
    
    console.log('\nThông tin đăng nhập admin:');
    console.log('- Email: admin@gmail.com');
    console.log('- Mật khẩu: admin123');
    
    console.log('\nScript hoàn tất, vui lòng thử đăng nhập lại');
    process.exit(0);
  } catch (error) {
    console.error('Lỗi khi kiểm tra thông tin đăng nhập:', error);
    process.exit(1);
  }
};

// Run the function
checkLoginCredentials(); 