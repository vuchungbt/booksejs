import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Vui lòng nhập tên của bạn']
  },
  email: {
    type: String,
    required: [true, 'Vui lòng nhập email'],
    unique: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Vui lòng nhập email hợp lệ']
  },
  password: {
    type: String,
    required: [true, 'Vui lòng nhập mật khẩu'],
    minlength: [6, 'Mật khẩu phải có ít nhất 6 ký tự']
  },
  role: {
    type: String,
    enum: ['customer', 'author', 'admin'],
    default: 'customer'
  },
  phone: {
    type: String
  },
  address: {
    type: String
  },
  avatar: {
    type: String,
    default: '/images/books/default-book.png'
  },
  // Thông tin tác giả
  bio: {
    type: String,
    default: ''
  },
  expertise: {
    type: [String],
    default: []
  },
  education: {
    type: String,
    default: ''
  },
  socialLinks: {
    facebook: String,
    twitter: String,
    instagram: String,
    website: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    // Generate a salt
    const salt = await bcrypt.genSalt(10);
    
    // Hash the password along with our new salt
    this.password = await bcrypt.hash(this.password, salt);
    
    // Continue
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password for login
UserSchema.methods.matchPassword = async function(enteredPassword) {
  try {
    console.log('Comparing passwords:');
    console.log('- Entered password:', enteredPassword);
    console.log('- Stored hashed password:', this.password);
    
    const isMatch = await bcrypt.compare(enteredPassword, this.password);
    console.log('- Match result:', isMatch ? 'Success ✓' : 'Failed ✗');
    
    return isMatch;
  } catch (error) {
    console.error('Error comparing passwords:', error);
    return false;
  }
};

const User = mongoose.model('User', UserSchema);

export default User;