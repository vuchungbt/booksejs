import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Article from '../models/Article.js';
import User from '../models/User.js';
import Book from '../models/Book.js';

// Load config
dotenv.config();

// Connect to database
mongoose.connect(process.env.MONGO_URI);

const createSampleArticles = async () => {
  try {
    console.log('🚀 Bắt đầu tạo bài viết mẫu...');

    // Find admin user to be the author
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('❌ Không tìm thấy admin user. Vui lòng tạo admin trước.');
      return;
    }

    // Get some random books for related books
    const books = await Book.find().limit(5);

    const sampleArticles = [
      {
        title: 'Top 10 cuốn sách hay nhất năm 2024',
        slug: 'top-10-cuon-sach-hay-nhat-nam-2024',
        excerpt: 'Khám phá những cuốn sách được yêu thích nhất trong năm 2024, từ tiểu thuyết đến sách khoa học và phát triển bản thân.',
        content: `
          <h2>Giới thiệu</h2>
          <p>Năm 2024 đã mang đến cho chúng ta rất nhiều tác phẩm văn học xuất sắc. Trong bài viết này, tôi sẽ giới thiệu với các bạn <strong>10 cuốn sách hay nhất</strong> được độc giả yêu thích trong năm qua.</p>
          
          <h3>1. Tiểu thuyết hay nhất</h3>
          <p>Các tác phẩm tiểu thuyết năm nay đã mang đến những câu chuyện sâu sắc và cảm động. Từ những chuyện tình lãng mạn đến những câu chuyện phiêu lưu kịch tính.</p>
          
          <blockquote>
            "Sách là cánh cửa mở ra thế giới tri thức vô tận" - Một câu nói rất ý nghĩa về giá trị của việc đọc sách.
          </blockquote>
          
          <h3>2. Sách khoa học và công nghệ</h3>
          <ul>
            <li>Trí tuệ nhân tạo và tương lai loài người</li>
            <li>Khoa học về hạnh phúc</li>
            <li>Vật lý lượng tử cho người mới bắt đầu</li>
          </ul>
          
          <h3>3. Sách phát triển bản thân</h3>
          <p>Những cuốn sách giúp chúng ta phát triển kỹ năng và tư duy tích cực.</p>
          
          <p><em>Hãy cùng khám phá những cuốn sách tuyệt vời này và làm giàu thêm kiến thức của bản thân nhé!</em></p>
        `,
        featuredImage: '/images/articles/default-article.jpg',
        author: adminUser._id,
        tags: ['review', 'sách hay', 'top 10', '2024'],
        status: 'published',
        featured: true,
        relatedBooks: books.slice(0, 3).map(book => book._id),
        views: Math.floor(Math.random() * 1000) + 100,
        publishedAt: new Date()
      },
      {
        title: 'Cách đọc sách hiệu quả và ghi nhớ lâu',
        slug: 'cach-doc-sach-hieu-qua-va-ghi-nho-lau',
        excerpt: 'Chia sẻ những phương pháp đọc sách hiệu quả, giúp bạn tiếp thu kiến thức tốt hơn và ghi nhớ lâu hơn.',
        content: `
          <h2>Tại sao cần có phương pháp đọc sách?</h2>
          <p>Đọc sách không chỉ là việc đọc từng từ, từng câu. Để thực sự hiệu quả, bạn cần có <strong>phương pháp và kỹ thuật</strong> phù hợp.</p>
          
          <h3>5 bước đọc sách hiệu quả</h3>
          <ol>
            <li><strong>Đọc lướt</strong> - Tìm hiểu cấu trúc và nội dung chính</li>
            <li><strong>Đặt câu hỏi</strong> - Tự hỏi những gì bạn muốn tìm hiểu</li>
            <li><strong>Đọc kỹ</strong> - Tập trung vào những phần quan trọng</li>
            <li><strong>Ghi chú</strong> - Viết lại những điểm chính bằng từ của mình</li>
            <li><strong>Ôn tập</strong> - Định kỳ xem lại những gì đã học</li>
          </ol>
          
          <h3>Kỹ thuật ghi nhớ</h3>
          <p>Sử dụng <em>mindmap</em>, thẻ ghi nhớ và phương pháp liên kết để ghi nhớ lâu hơn.</p>
          
          <blockquote>
            "Đọc không có suy nghĩ là vô ích, suy nghĩ không có đọc là nguy hiểm" - Confucius
          </blockquote>
        `,
        featuredImage: '/images/articles/default-article.jpg',
        author: adminUser._id,
        tags: ['học tập', 'phương pháp', 'kỹ năng', 'đọc sách'],
        status: 'published',
        featured: false,
        relatedBooks: books.slice(1, 3).map(book => book._id),
        views: Math.floor(Math.random() * 500) + 50,
        publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
      },
      {
        title: 'Tác giả nổi tiếng và những tác phẩm kinh điển',
        slug: 'tac-gia-noi-tieng-va-nhung-tac-pham-kinh-dien',
        excerpt: 'Khám phá những tác giả nổi tiếng thế giới và những tác phẩm kinh điển đã để lại dấu ấn sâu đậm trong lòng độc giả.',
        content: `
          <h2>Những tác giả vĩ đại</h2>
          <p>Văn học thế giới đã có rất nhiều tác giả tài năng, để lại những tác phẩm <strong>bất hủ</strong> qua thời gian.</p>
          
          <h3>William Shakespeare</h3>
          <p>Được mệnh danh là "Bard of Avon", Shakespeare đã tạo ra những tác phẩm kinh điển như:</p>
          <ul>
            <li>Romeo và Juliet</li>
            <li>Hamlet</li>
            <li>Macbeth</li>
            <li>Othello</li>
          </ul>
          
          <h3>Leo Tolstoy</h3>
          <p>Tác giả người Nga với những tác phẩm đồ sộ và sâu sắc về con người và xã hội.</p>
          
          <h3>Gabriel García Márquez</h3>
          <p>Người đoạt giải Nobel văn học với phong cách <em>chủ nghĩa hiện thực thần kỳ</em>.</p>
          
          <blockquote>
            "Văn học là cách tốt nhất để hiểu về con người và thế giới xung quanh chúng ta."
          </blockquote>
          
          <h3>Tại sao nên đọc kinh điển?</h3>
          <p>Những tác phẩm kinh điển không chỉ có giá trị văn học cao mà còn mang đến những bài học sâu sắc về cuộc sống.</p>
        `,
        featuredImage: '/images/articles/default-article.jpg',
        author: adminUser._id,
        tags: ['tác giả', 'kinh điển', 'văn học', 'lịch sử'],
        status: 'published',
        featured: false,
        relatedBooks: books.slice(2, 4).map(book => book._id),
        views: Math.floor(Math.random() * 300) + 30,
        publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) // 14 days ago
      },
      {
        title: 'Xu hướng xuất bản sách điện tử trong thời đại số',
        slug: 'xu-huong-xuat-ban-sach-dien-tu-trong-thoi-dai-so',
        excerpt: 'Phân tích xu hướng phát triển của sách điện tử và tác động của công nghệ đến ngành xuất bản trong thời đại số.',
        content: `
          <h2>Sách điện tử - Tương lai của ngành xuất bản</h2>
          <p>Với sự phát triển của công nghệ, <strong>sách điện tử (e-book)</strong> đang trở thành xu hướng mới trong ngành xuất bản.</p>
          
          <h3>Ưu điểm của sách điện tử</h3>
          <ul>
            <li>Tiết kiệm không gian lưu trữ</li>
            <li>Dễ dàng tìm kiếm và đánh dấu</li>
            <li>Giá thành thấp hơn</li>
            <li>Thân thiện với môi trường</li>
            <li>Có thể đọc trên nhiều thiết bị</li>
          </ul>
          
          <h3>Thách thức</h3>
          <p>Tuy nhiên, sách điện tử cũng gặp phải một số thách thức:</p>
          <ol>
            <li>Vấn đề bảo vệ bản quyền</li>
            <li>Trải nghiệm đọc khác biệt</li>
            <li>Phụ thuộc vào thiết bị công nghệ</li>
          </ol>
          
          <blockquote>
            "Công nghệ không thay thế sách, mà làm cho sách trở nên dễ tiếp cận hơn."
          </blockquote>
          
          <h3>Tương lai của ngành xuất bản</h3>
          <p>Ngành xuất bản đang chuyển đổi số mạnh mẽ với các nền tảng đọc sách trực tuyến và ứng dụng di động.</p>
        `,
        featuredImage: '/images/articles/default-article.jpg',
        author: adminUser._id,
        tags: ['công nghệ', 'xuất bản', 'sách điện tử', 'xu hướng'],
        status: 'published',
        featured: true,
        relatedBooks: books.slice(0, 2).map(book => book._id),
        views: Math.floor(Math.random() * 800) + 200,
        publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      },
      {
        title: 'Cách xây dựng thói quen đọc sách hàng ngày',
        slug: 'cach-xay-dung-thoi-quen-doc-sach-hang-ngay',
        excerpt: 'Hướng dẫn chi tiết cách tạo và duy trì thói quen đọc sách hàng ngày, giúp bạn phát triển tri thức một cách bền vững.',
        content: `
          <h2>Tại sao cần có thói quen đọc sách?</h2>
          <p>Đọc sách thường xuyên không chỉ giúp mở rộng kiến thức mà còn <strong>cải thiện tư duy</strong> và khả năng ngôn ngữ.</p>
          
          <h3>Cách bắt đầu</h3>
          <p>Để xây dựng thói quen đọc sách hiệu quả:</p>
          
          <h4>1. Đặt mục tiêu cụ thể</h4>
          <ul>
            <li>Bắt đầu với 15-20 phút mỗi ngày</li>
            <li>Đặt mục tiêu số trang hoặc số cuốn sách</li>
            <li>Ghi lại tiến độ để theo dõi</li>
          </ul>
          
          <h4>2. Chọn thời gian phù hợp</h4>
          <p>Tìm thời điểm mà bạn tập trung tốt nhất trong ngày:</p>
          <ul>
            <li>Sáng sớm trước khi bắt đầu công việc</li>
            <li>Giờ nghỉ trưa</li>
            <li>Tối trước khi đi ngủ</li>
          </ul>
          
          <h4>3. Tạo không gian đọc</h4>
          <p>Chuẩn bị một <em>góc đọc sách riêng</em> với ánh sáng tốt và không bị quấy rầy.</p>
          
          <blockquote>
            "Thói quen đọc sách tốt sẽ mở ra vô số cơ hội học hỏi và phát triển."
          </blockquote>
          
          <h3>Mẹo duy trì thói quen</h3>
          <ol>
            <li>Luôn mang theo sách</li>
            <li>Sử dụng ứng dụng ghi nhớ</li>
            <li>Tham gia câu lạc bộ sách</li>
            <li>Chia sẻ với bạn bè</li>
          </ol>
        `,
        featuredImage: '/images/articles/default-article.jpg',
        author: adminUser._id,
        tags: ['thói quen', 'phát triển bản thân', 'đọc sách', 'lifestyle'],
        status: 'published',
        featured: false,
        relatedBooks: books.slice(3, 5).map(book => book._id),
        views: Math.floor(Math.random() * 600) + 100,
        publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
      }
    ];

    // Clear existing articles
    await Article.deleteMany({});
    console.log('🗑️  Đã xóa các bài viết cũ');

    // Insert sample articles
    const articles = await Article.insertMany(sampleArticles);
    console.log(`✅ Đã tạo ${articles.length} bài viết mẫu`);

    // Display created articles
    articles.forEach(article => {
      console.log(`📝 ${article.title} - /articles/${article.slug}`);
    });

    console.log('🎉 Hoàn thành tạo bài viết mẫu!');
    console.log('💡 Bây giờ bạn có thể truy cập http://localhost:3000/articles để xem danh sách bài viết');

  } catch (error) {
    console.error('❌ Lỗi khi tạo bài viết mẫu:', error);
  } finally {
    mongoose.connection.close();
  }
};

createSampleArticles(); 