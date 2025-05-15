import mongoose from 'mongoose';
import dotenv from 'dotenv';
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

// Sample users data
const users = [
  // Admin users
  {
    name: 'Admin Quản Trị',
    email: 'admin@gmail.com',
    password: 'admin123',
    role: 'admin',
    phone: '0987654321',
    address: 'Quận 1, TP.HCM',
    avatar: '/images/books/default-book.png'
  },
  {
    name: 'Admin Hệ Thống',
    email: 'system@gmail.com',
    password: 'admin123',
    role: 'admin',
    phone: '0909090909',
    address: 'Quận 2, TP.HCM',
    avatar: '/images/books/default-book.png'
  },
  
  // Author users
  {
    name: 'Nguyễn Nhật Ánh',
    email: 'nhatanh@gmail.com',
    password: 'author123',
    role: 'author',
    phone: '0977777777',
    address: 'Quận 3, TP.HCM',
    avatar: '/images/books/hoang-tu-be.jpg'
  },
  {
    name: 'Tô Hoài',
    email: 'tohoai@gmail.com',
    password: 'author123',
    role: 'author',
    phone: '0966666666',
    address: 'Quận Ba Đình, Hà Nội',
    avatar: '/images/books/de-men-phieu-luu-ky.jpg'
  },
  {
    name: 'Trần Văn A',
    email: 'vana@gmail.com',
    password: 'author123',
    role: 'author',
    phone: '0955555555',
    address: 'Quận 5, TP.HCM',
    avatar: '/images/books/khong-gia-dinh.jpg'
  },
  
  // Regular customers
  {
    name: 'Khách Hàng 1',
    email: 'customer1@gmail.com',
    password: 'customer123',
    role: 'customer',
    phone: '0944444444',
    address: 'Quận 7, TP.HCM'
  },
  {
    name: 'Khách Hàng 2',
    email: 'customer2@gmail.com',
    password: 'customer123',
    role: 'customer',
    phone: '0933333333',
    address: 'Quận Hoàn Kiếm, Hà Nội'
  },
  {
    name: 'Khách Hàng 3',
    email: 'customer3@gmail.com',
    password: 'customer123',
    role: 'customer',
    phone: '0922222222',
    address: 'Quận Hải Châu, Đà Nẵng'
  }
];

// Seed users to database
const seedUsers = async () => {
  try {
    // Clear existing users
    await User.deleteMany({});
    console.log('Existing users deleted');

    // Create new users
    const createdUsers = await User.insertMany(users);
    console.log(`${createdUsers.length} users created successfully`);
    
    // Log created users with roles for reference
    const admins = createdUsers.filter(user => user.role === 'admin');
    const authors = createdUsers.filter(user => user.role === 'author');
    const customers = createdUsers.filter(user => user.role === 'customer');
    
    console.log('\nAdmin Users:');
    admins.forEach(admin => {
      console.log(`- ${admin.name} (${admin.email}), ID: ${admin._id}`);
    });
    
    console.log('\nAuthor Users:');
    authors.forEach(author => {
      console.log(`- ${author.name} (${author.email}), ID: ${author._id}`);
    });
    
    console.log('\nCustomer Users:');
    customers.forEach(customer => {
      console.log(`- ${customer.name} (${customer.email})`);
    });
    
    console.log('\nAll users created with password as specified in the script');
    console.log('Script completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
};

// Run the seed function
seedUsers(); 