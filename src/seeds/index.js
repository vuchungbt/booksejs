import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Book from '../models/Book.js';

// Load config
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  });

// Create sample users
const createUsers = async () => {
  try {
    // Clear existing users
    await User.deleteMany();
    
    // Create admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin'
    });
    
    // Create author user
    const authorUser = await User.create({
      name: 'Author User',
      email: 'author@example.com',
      password: 'password123',
      role: 'author'
    });
    
    // Create regular user
    const regularUser = await User.create({
      name: 'Regular User',
      email: 'user@example.com',
      password: 'password123',
      role: 'customer'
    });
    
    console.log('Sample users created');
    return { adminUser, authorUser, regularUser };
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Create sample categories
const createCategories = async () => {
  try {
    // Clear existing categories
    await Category.deleteMany();
    
    // Create categories
    const categories = await Category.insertMany([
      {
        name: 'Văn học',
        description: 'Sách văn học trong và ngoài nước'
      },
      {
        name: 'Kinh tế',
        description: 'Sách về kinh tế, kinh doanh, quản lý'
      },
      {
        name: 'Tâm lý - Kỹ năng sống',
        description: 'Sách về tâm lý học và kỹ năng sống'
      },
      {
        name: 'Khoa học - Công nghệ',
        description: 'Sách về khoa học và công nghệ'
      },
      {
        name: 'Sách giáo khoa',
        description: 'Sách giáo khoa các cấp'
      }
    ]);
    
    console.log('Sample categories created');
    return categories;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Create sample books
const createBooks = async (categories, authorUser) => {
  try {
    // Clear existing books
    await Book.deleteMany();
    
    // Create books
    const books = await Book.insertMany([
      {
        title: 'Đắc Nhân Tâm',
        author: authorUser._id,
        publisher: 'NXB Tổng hợp TP.HCM',
        category: categories[2]._id,
        description: 'Đắc nhân tâm là quyển sách nổi tiếng nhất, bán chạy nhất và có tầm ảnh hưởng nhất của mọi thời đại. Tác phẩm đã được chuyển ngữ sang hầu hết các thứ tiếng trên thế giới và có mặt ở hàng trăm quốc gia.',
        price: 90000,
        discount: 10,
        pages: 320,
        publicationDate: '2022-01-01',
        stock: 50,
        isbn: '9786041066854',
        featured: true
      },
      {
        title: 'Nhà Giả Kim',
        author: authorUser._id,
        publisher: 'NXB Hội Nhà Văn',
        category: categories[0]._id,
        description: 'Nhà giả kim là cuốn sách được xuất bản năm 1988 của nhà văn Paulo Coelho, kể về chàng trai chăn cừu Santiago đi tìm kho báu trong một giấc mơ.',
        price: 85000,
        discount: 5,
        pages: 227,
        publicationDate: '2020-05-15',
        stock: 30,
        isbn: '9786049945533',
        featured: true
      },
      {
        title: 'Tuổi Trẻ Đáng Giá Bao Nhiêu',
        author: authorUser._id,
        publisher: 'NXB Hội Nhà Văn',
        category: categories[2]._id,
        description: 'Tuổi trẻ đáng giá bao nhiêu là tác phẩm đầu tay của tác giả Rosie Nguyễn, người đã truyền cảm hứng cho hàng ngàn bạn trẻ.',
        price: 95000,
        discount: 0,
        pages: 285,
        publicationDate: '2021-02-20',
        stock: 25,
        isbn: '9786045877029',
        featured: false
      },
      {
        title: 'Cây Cam Ngọt Của Tôi',
        author: authorUser._id,
        publisher: 'NXB Hội Nhà Văn',
        category: categories[0]._id,
        description: 'Cây Cam Ngọt Của Tôi là cuốn tiểu thuyết bán tự truyện của nhà văn Brazil José Mauro de Vasconcelos.',
        price: 110000,
        discount: 15,
        pages: 244,
        publicationDate: '2022-03-10',
        stock: 40,
        isbn: '9786045890493',
        featured: true
      },
      {
        title: 'Sách Giáo Khoa Toán Lớp 12',
        author: authorUser._id,
        publisher: 'NXB Giáo Dục',
        category: categories[4]._id,
        description: 'Sách giáo khoa Toán lớp 12, chương trình THPT mới.',
        price: 32000,
        discount: 0,
        pages: 210,
        publicationDate: '2023-01-05',
        stock: 100,
        isbn: '9786040550712',
        featured: false
      },
      {
        title: 'Nghĩ Giàu Làm Giàu',
        author: authorUser._id,
        publisher: 'NXB Tổng hợp TP.HCM',
        category: categories[1]._id,
        description: 'Nghĩ giàu làm giàu là một quyển sách tự lực bản thân kinh điển của Napoleon Hill, được xuất bản lần đầu năm 1937.',
        price: 125000,
        discount: 20,
        pages: 355,
        publicationDate: '2021-07-12',
        stock: 35,
        isbn: '9786045834268',
        featured: true
      },
      {
        title: 'Vũ Trụ Trong Vỏ Hạt Dẻ',
        author: authorUser._id,
        publisher: 'NXB Trẻ',
        category: categories[3]._id,
        description: 'Vũ trụ trong vỏ hạt dẻ là cuốn sách khoa học phổ thông của nhà vật lý lý thuyết Stephen Hawking.',
        price: 140000,
        discount: 10,
        pages: 280,
        publicationDate: '2022-05-18',
        stock: 20,
        isbn: '9786041094567',
        featured: false
      },
      {
        title: 'Lược Sử Thời Gian',
        author: authorUser._id,
        publisher: 'NXB Trẻ',
        category: categories[3]._id,
        description: 'Lược sử thời gian là quyển sách bán chạy viết bởi nhà vật lý lý thuyết Stephen Hawking.',
        price: 115000,
        discount: 5,
        pages: 302,
        publicationDate: '2020-11-30',
        stock: 15,
        isbn: '9786041096578',
        featured: true
      }
    ]);
    
    console.log('Sample books created');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Run seed function
const seedData = async () => {
  try {
    const users = await createUsers();
    const categories = await createCategories();
    await createBooks(categories, users.authorUser);
    
    console.log('Data seeded successfully');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedData();