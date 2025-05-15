import mongoose from 'mongoose';
import Book from '../models/Book.js';
import Category from '../models/Category.js';
import User from '../models/User.js';

console.log('Bắt đầu tạo dữ liệu sách mẫu...');

// Kết nối MongoDB
mongoose.connect('mongodb://localhost:27017/bookstore')
  .then(() => {
    console.log('Đã kết nối MongoDB thành công');
    createSampleData();
  })
  .catch(err => {
    console.error('Lỗi kết nối MongoDB:', err.message);
    process.exit(1);
  });

// Tạo dữ liệu mẫu
async function createSampleData() {
  try {
    // Tìm người dùng có role là author
    const authors = await User.find({ role: 'author' });
    if (authors.length === 0) {
      console.log('Không tìm thấy tác giả nào, hãy tạo người dùng có role là author trước');
      process.exit(1);
    }

    // Tìm danh mục
    const categories = await Category.find({});
    if (categories.length === 0) {
      console.log('Không tìm thấy danh mục nào, hãy tạo danh mục trước');
      process.exit(1);
    }

    console.log(`Tìm thấy ${authors.length} tác giả và ${categories.length} danh mục`);

    // Danh sách sách mẫu
    const sampleBooks = [
      {
        title: 'Đắc Nhân Tâm',
        publisher: 'NXB Tổng hợp TP.HCM',
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
        publisher: 'NXB Hội Nhà Văn',
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
        publisher: 'NXB Hội Nhà Văn',
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
        publisher: 'NXB Hội Nhà Văn',
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
        title: 'Tôi Thấy Hoa Vàng Trên Cỏ Xanh',
        publisher: 'NXB Trẻ',
        description: 'Tôi Thấy Hoa Vàng Trên Cỏ Xanh là tiểu thuyết của nhà văn Nguyễn Nhật Ánh, ra mắt năm 2010. Tác phẩm được tái bản nhiều lần và là một trong những tác phẩm bán chạy nhất của tác giả.',
        price: 125000,
        discount: 15,
        pages: 378,
        publicationDate: '2018-05-12',
        stock: 45,
        isbn: '9786041852297',
        featured: true
      },
      {
        title: 'Cho Tôi Xin Một Vé Đi Tuổi Thơ',
        publisher: 'NXB Trẻ',
        description: 'Cho Tôi Xin Một Vé Đi Tuổi Thơ là tiểu thuyết dành cho thanh thiếu niên của nhà văn Nguyễn Nhật Ánh, đây là một trong những tác phẩm tiêu biểu và đặc sắc nhất của ông.',
        price: 80000,
        discount: 10,
        pages: 208,
        publicationDate: '2019-08-20',
        stock: 30,
        isbn: '9786049952715',
        featured: false
      },
      {
        title: 'Dế Mèn Phiêu Lưu Ký',
        publisher: 'NXB Kim Đồng',
        description: 'Dế Mèn Phiêu Lưu Ký là tác phẩm văn học thiếu nhi nổi tiếng của nhà văn Tô Hoài, kể về cuộc phiêu lưu của chú Dế Mèn dũng cảm.',
        price: 75000,
        discount: 5,
        pages: 144,
        publicationDate: '2020-06-01',
        stock: 50,
        isbn: '9786041071117',
        featured: true
      },
      {
        title: 'Không Gia Đình',
        publisher: 'NXB Kim Đồng',
        description: 'Không Gia Đình là tiểu thuyết nổi tiếng của nhà văn Pháp Hector Malot, kể về cuộc đời của cậu bé Rémi mồ côi.',
        price: 120000,
        discount: 0,
        pages: 480,
        publicationDate: '2021-01-15',
        stock: 25,
        isbn: '9786041076652',
        featured: false
      }
    ];

    // Xóa tất cả sách hiện có (nếu cần)
    // Uncomment dòng dưới đây nếu muốn xóa sách cũ
    // await Book.deleteMany({});

    // Lưu từng cuốn sách
    console.log('Bắt đầu tạo sách mẫu...');
    for (const bookData of sampleBooks) {
      // Kiểm tra xem sách đã tồn tại chưa
      const existingBook = await Book.findOne({ title: bookData.title });
      if (existingBook) {
        console.log(`Sách "${bookData.title}" đã tồn tại, bỏ qua...`);
        continue;
      }

      // Chọn ngẫu nhiên tác giả và danh mục
      const randomAuthor = authors[Math.floor(Math.random() * authors.length)];
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];

      // Tạo sách mới
      const newBook = new Book({
        ...bookData,
        author: randomAuthor._id,
        category: randomCategory._id,
        cover: '/images/books/default-book.png' // Đường dẫn ảnh mặc định
      });

      // Lưu sách
      await newBook.save();
      console.log(`Đã tạo sách: ${newBook.title}`);
    }

    console.log('Hoàn thành việc tạo sách mẫu!');
    process.exit(0);
  } catch (error) {
    console.error('Lỗi:', error.message);
    process.exit(1);
  }
} 