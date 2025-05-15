import mongoose from 'mongoose';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Book from '../models/Book.js';
import slugify from 'slugify';

// Chuỗi kết nối MongoDB
const MONGO_URI = 'mongodb://localhost:27017/bookstore';

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  });

// Create more sample users
const createMoreUsers = async () => {
  try {
    console.log('Creating more sample authors...');
    
    // Create more author users
    const authors = await User.insertMany([
      {
        name: 'Nguyễn Nhật Ánh',
        email: 'nna@example.com',
        password: 'password123',
        role: 'author',
        bio: 'Tác giả nổi tiếng với nhiều tác phẩm văn học thiếu nhi và thanh niên'
      },
      {
        name: 'Trang Hạ',
        email: 'trangha@example.com',
        password: 'password123',
        role: 'author',
        bio: 'Nhà văn, nhà báo được biết đến với các tác phẩm về đời sống hiện đại'
      },
      {
        name: 'Nguyễn Ngọc Thạch',
        email: 'nguyenngocthach@example.com',
        password: 'password123',
        role: 'author',
        bio: 'Nhà văn trẻ với nhiều tác phẩm về đời sống đô thị'
      },
      {
        name: 'Nguyễn Phong Việt',
        email: 'npv@example.com',
        password: 'password123',
        role: 'author',
        bio: 'Nhà thơ, tác giả của nhiều tập thơ được giới trẻ yêu thích'
      }
    ]);
    
    console.log('More sample authors created');
    return authors;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Create more sample categories
const createMoreCategories = async () => {
  try {
    console.log('Creating more sample categories...');
    
    // Create more categories
    const newCategories = await Category.insertMany([
      {
        name: 'Văn học',
        description: 'Các tác phẩm văn học Việt Nam và nước ngoài'
      },
      {
        name: 'Sách thiếu nhi',
        description: 'Sách dành cho trẻ em và thiếu niên'
      },
      {
        name: 'Tiểu thuyết lãng mạn',
        description: 'Các tác phẩm lãng mạn, tình cảm'
      },
      {
        name: 'Sách ngoại ngữ',
        description: 'Sách học ngoại ngữ và sách bằng tiếng nước ngoài'
      },
      {
        name: 'Lịch sử - Địa lý',
        description: 'Sách về lịch sử và địa lý'
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
        name: 'Kinh tế',
        description: 'Sách về kinh tế, kinh doanh và tài chính'
      },
      {
        name: 'Sách giáo khoa',
        description: 'Sách giáo khoa các cấp'
      }
    ]);
    
    console.log('More sample categories created');
    return newCategories;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Create sample books with cover images
const createMoreBooks = async (authors, categories) => {
  try {
    console.log('Creating more sample books...');
    
    // Get existing categories and authors
    const existingCategories = await Category.find();
    const existingAuthors = await User.find({ role: 'author' });
    
    // Combine all categories and authors
    const allCategories = [...existingCategories, ...categories];
    const allAuthors = [...existingAuthors, ...authors];
    
    // Helper function to get random item from array
    const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];
    
    // Helper function to get random category by name
    const getCategoryByName = (name) => {
      return allCategories.find(cat => cat.name === name) || getRandomItem(allCategories);
    };
    
    // Helper function to get random author by name
    const getAuthorByName = (name) => {
      return allAuthors.find(author => author.name === name) || getRandomItem(allAuthors);
    };
    
    // Create more books
    const newBooks = [
      {
        title: 'Tôi Thấy Hoa Vàng Trên Cỏ Xanh',
        slug: 'toi-thay-hoa-vang-tren-co-xanh',
        author: getAuthorByName('Nguyễn Nhật Ánh')._id,
        publisher: 'NXB Trẻ',
        category: getCategoryByName('Văn học')._id,
        description: 'Tôi Thấy Hoa Vàng Trên Cỏ Xanh là tiểu thuyết của nhà văn Nguyễn Nhật Ánh, ra mắt năm 2010. Tác phẩm được tái bản nhiều lần và là một trong những tác phẩm bán chạy nhất của tác giả.',
        price: 125000,
        discount: 15,
        cover: '/images/books/default-book.png',
        pages: 378,
        publicationDate: '2018-05-12',
        stock: 45,
        isbn: '9786041852297',
        featured: true
      },
      {
        title: 'Cho Tôi Xin Một Vé Đi Tuổi Thơ',
        slug: 'cho-toi-xin-mot-ve-di-tuoi-tho',
        author: getAuthorByName('Nguyễn Nhật Ánh')._id,
        publisher: 'NXB Trẻ',
        category: getCategoryByName('Văn học')._id,
        description: 'Cho Tôi Xin Một Vé Đi Tuổi Thơ là tiểu thuyết dành cho thanh thiếu niên của nhà văn Nguyễn Nhật Ánh, đây là một trong những tác phẩm tiêu biểu và đặc sắc nhất của ông.',
        price: 80000,
        discount: 10,
        cover: '/images/books/default-book.png',
        pages: 208,
        publicationDate: '2019-08-20',
        stock: 30,
        isbn: '9786049952715',
        featured: false
      },
      {
        title: 'Dế Mèn Phiêu Lưu Ký',
        slug: 'de-men-phieu-luu-ky',
        author: getRandomItem(allAuthors)._id,
        publisher: 'NXB Kim Đồng',
        category: getCategoryByName('Sách thiếu nhi')._id,
        description: 'Dế Mèn Phiêu Lưu Ký là tác phẩm văn học thiếu nhi nổi tiếng của nhà văn Tô Hoài, kể về cuộc phiêu lưu của chú Dế Mèn dũng cảm.',
        price: 75000,
        discount: 5,
        cover: '/images/books/default-book.png',
        pages: 144,
        publicationDate: '2020-06-01',
        stock: 50,
        isbn: '9786041071117',
        featured: true
      },
      {
        title: 'Không Gia Đình',
        slug: 'khong-gia-dinh',
        author: getRandomItem(allAuthors)._id,
        publisher: 'NXB Kim Đồng',
        category: getCategoryByName('Sách thiếu nhi')._id,
        description: 'Không Gia Đình là tiểu thuyết nổi tiếng của nhà văn Pháp Hector Malot, kể về cuộc đời của cậu bé Rémi mồ côi.',
        price: 120000,
        discount: 0,
        cover: '/images/books/default-book.png',
        pages: 480,
        publicationDate: '2021-01-15',
        stock: 25,
        isbn: '9786041076652',
        featured: false
      },
      {
        title: 'Chuyện Con Mèo Dạy Hải Âu Bay',
        slug: 'chuyen-con-meo-day-hai-au-bay',
        author: getRandomItem(allAuthors)._id,
        publisher: 'NXB Hội Nhà Văn',
        category: getCategoryByName('Văn học')._id,
        description: 'Chuyện Con Mèo Dạy Hải Âu Bay là tiểu thuyết của nhà văn Luis Sepúlveda, kể về câu chuyện cảm động giữa một con mèo và chú hải âu con.',
        price: 85000,
        discount: 12,
        cover: '/images/books/default-book.png',
        pages: 144,
        publicationDate: '2019-11-20',
        stock: 35,
        isbn: '9786045879252',
        featured: true
      },
      {
        title: 'Cà Phê Cùng Tony',
        slug: 'ca-phe-cung-tony',
        author: getRandomItem(allAuthors)._id,
        publisher: 'NXB Trẻ',
        category: getCategoryByName('Tâm lý - Kỹ năng sống')._id,
        description: 'Cà Phê Cùng Tony là tác phẩm của Tony Buổi Sáng (Nguyễn Hữu Trí), chia sẻ những câu chuyện và bài học về cuộc sống, sự nghiệp và các giá trị sống tích cực.',
        price: 90000,
        discount: 10,
        cover: '/images/books/default-book.png',
        pages: 268,
        publicationDate: '2017-07-10',
        stock: 40,
        isbn: '9786049741258',
        featured: true
      },
      {
        title: 'Nguồn Cội',
        slug: 'nguon-coi',
        author: getRandomItem(allAuthors)._id,
        publisher: 'NXB Lao Động',
        category: getCategoryByName('Văn học')._id,
        description: 'Nguồn Cội (Origin) là cuốn tiểu thuyết giả tưởng của nhà văn Dan Brown, tiếp nối series về nhân vật Robert Langdon.',
        price: 150000,
        discount: 20,
        cover: '/images/books/default-book.png',
        pages: 628,
        publicationDate: '2018-09-05',
        stock: 20,
        isbn: '9786045892855',
        featured: false
      },
      {
        title: 'Sapiens: Lược Sử Loài Người',
        slug: 'sapiens-luoc-su-loai-nguoi',
        author: getRandomItem(allAuthors)._id,
        publisher: 'NXB Thế Giới',
        category: getCategoryByName('Khoa học - Công nghệ')._id,
        description: 'Sapiens: Lược Sử Loài Người của Yuval Noah Harari là một phác họa tổng quan về lịch sử loài người, từ khi xuất hiện trên Trái Đất cho đến tương lai.',
        price: 189000,
        discount: 15,
        cover: '/images/books/default-book.png',
        pages: 554,
        publicationDate: '2019-12-12',
        stock: 30,
        isbn: '9786045892879',
        featured: true
      },
      {
        title: 'Tâm Lý Học Đám Đông',
        slug: 'tam-ly-hoc-dam-dong',
        author: getRandomItem(allAuthors)._id,
        publisher: 'NXB Thế Giới',
        category: getCategoryByName('Tâm lý - Kỹ năng sống')._id,
        description: 'Tâm Lý Học Đám Đông của Gustave Le Bon là một trong những nghiên cứu đầu tiên về tâm lý học xã hội, phân tích hành vi và tâm lý của đám đông.',
        price: 95000,
        discount: 5,
        cover: '/images/books/default-book.png',
        pages: 248,
        publicationDate: '2020-03-20',
        stock: 25,
        isbn: '9786042233279',
        featured: false
      },
      {
        title: 'Giáo Trình Tiếng Anh Tổng Quát',
        slug: 'giao-trinh-tieng-anh-tong-quat',
        author: getRandomItem(allAuthors)._id,
        publisher: 'NXB Đại học Quốc gia Hà Nội',
        category: getCategoryByName('Sách ngoại ngữ')._id,
        description: 'Giáo trình tiếng Anh tổng quát với đầy đủ các kỹ năng nghe, nói, đọc, viết cho trình độ trung cấp.',
        price: 110000,
        discount: 0,
        cover: '/images/books/default-book.png',
        pages: 320,
        publicationDate: '2022-01-10',
        stock: 60,
        isbn: '9786042245782',
        featured: false
      },
      {
        title: 'Việt Nam Sử Lược',
        slug: 'viet-nam-su-luoc',
        author: getRandomItem(allAuthors)._id,
        publisher: 'NXB Văn Học',
        category: getCategoryByName('Lịch sử - Địa lý')._id,
        description: 'Việt Nam Sử Lược của Trần Trọng Kim là tác phẩm nghiên cứu lịch sử quan trọng, tổng hợp lịch sử Việt Nam từ thời dựng nước đến hiện đại.',
        price: 130000,
        discount: 10,
        cover: '/images/books/default-book.png',
        pages: 520,
        publicationDate: '2017-06-15',
        stock: 20,
        isbn: '9786040125484',
        featured: true
      },
      {
        title: 'Khởi Nghiệp Tinh Gọn',
        slug: 'khoi-nghiep-tinh-gon',
        author: getRandomItem(allAuthors)._id,
        publisher: 'NXB Trẻ',
        category: getCategoryByName('Kinh tế')._id,
        description: 'Khởi Nghiệp Tinh Gọn (The Lean Startup) của Eric Ries là cuốn sách về phương pháp khởi nghiệp mới, giúp các công ty khởi nghiệp phát triển và thành công.',
        price: 155000,
        discount: 25,
        cover: '/images/books/default-book.png',
        pages: 352,
        publicationDate: '2018-10-10',
        stock: 35,
        isbn: '9786045877142',
        featured: true
      },
      {
        title: 'Đời Ngắn Đừng Ngủ Dài',
        slug: 'doi-ngan-dung-ngu-dai',
        author: getRandomItem(allAuthors)._id,
        publisher: 'NXB Trẻ',
        category: getCategoryByName('Tâm lý - Kỹ năng sống')._id,
        description: 'Đời Ngắn Đừng Ngủ Dài của Robin Sharma là cuốn sách truyền cảm hứng về cách sống trọn vẹn và làm chủ cuộc đời.',
        price: 89000,
        discount: 10,
        cover: '/images/books/default-book.png',
        pages: 228,
        publicationDate: '2019-05-30',
        stock: 45,
        isbn: '9786045887431',
        featured: false
      },
      {
        title: 'Tiếng Việt 1 - Tập 1',
        slug: 'tieng-viet-1-tap-1',
        author: getRandomItem(allAuthors)._id,
        publisher: 'NXB Giáo Dục',
        category: getCategoryByName('Sách giáo khoa')._id,
        description: 'Sách giáo khoa Tiếng Việt lớp 1, tập 1, chương trình mới.',
        price: 36000,
        discount: 0,
        cover: '/images/books/default-book.png',
        pages: 120,
        publicationDate: '2023-05-10',
        stock: 100,
        isbn: '9786040556523',
        featured: false
      },
      {
        title: 'Hoàng Tử Bé',
        slug: 'hoang-tu-be',
        author: getRandomItem(allAuthors)._id,
        publisher: 'NXB Hội Nhà Văn',
        category: getCategoryByName('Văn học')._id,
        description: 'Hoàng Tử Bé là tiểu thuyết nổi tiếng của nhà văn Antoine de Saint-Exupéry, một câu chuyện triết lý sâu sắc về tình yêu, cuộc sống và tình bạn.',
        price: 68000,
        discount: 5,
        cover: '/images/books/default-book.png',
        pages: 96,
        publicationDate: '2020-08-12',
        stock: 40,
        isbn: '9786045893876',
        featured: true
      }
    ];
    
    // Save books to database
    for (const bookData of newBooks) {
      // Check if book already exists
      const existingBook = await Book.findOne({ title: bookData.title });
      if (existingBook) {
        console.log(`Book "${bookData.title}" already exists, skipping...`);
        continue;
      }
      
      const book = new Book(bookData);
      await book.save();
      console.log(`Created book: ${book.title}`);
    }
    
    console.log('More sample books created');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Create placeholder cover images
const createPlaceholderImages = async () => {
  try {
    console.log('Creating placeholder images folder...');
    
    // Note: In a real application, we would create the folder and files here
    // However, since we're using a placeholder path in the database,
    // we'll assume the images directory exists in the public folder
    
    console.log('Note: Please create a "books" folder in your public/images directory');
    console.log('and add appropriate book cover images named after each book');
    console.log('Example: public/images/books/books/toi-thay-hoa-vang-tren-co-xanh.jpg');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Run seed function
const seedMoreData = async () => {
  try {
    const authors = await createMoreUsers();
    const categories = await createMoreCategories();
    await createPlaceholderImages();
    await createMoreBooks(authors, categories);
    
    console.log('Additional data seeded successfully');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedMoreData();

export {
  createMoreUsers,
  createMoreCategories,
  createMoreBooks
}; 