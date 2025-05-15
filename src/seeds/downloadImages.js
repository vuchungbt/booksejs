import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

// Đường dẫn thư mục hiện tại
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Đường dẫn thư mục lưu ảnh
const imagesDir = path.join(__dirname, '../public/images/books/books');

// Tạo thư mục nếu chưa tồn tại
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
  console.log(`Created directory: ${imagesDir}`);
}

// URL ảnh mặc định nếu URL chính không hoạt động
const DEFAULT_IMAGE_URL = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500';

// Danh sách URL ảnh bìa sách (sử dụng Unsplash)
const bookCovers = [
  {
    filename: 'toi-thay-hoa-vang-tren-co-xanh.jpg',
    url: 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=500'
  },
  {
    filename: 'cho-toi-xin-mot-ve-di-tuoi-tho.jpg',
    url: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=500'
  },
  {
    filename: 'de-men-phieu-luu-ky.jpg',
    url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500'
  },
  {
    filename: 'khong-gia-dinh.jpg',
    url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500'
  },
  {
    filename: 'chuyen-con-meo-day-hai-au-bay.jpg',
    url: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500'
  },
  {
    filename: 'ca-phe-cung-tony.jpg',
    url: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=500'
  },
  {
    filename: 'nguon-coi.jpg',
    url: 'https://images.unsplash.com/photo-1497375638960-ca368c7231e4?w=500'
  },
  {
    filename: 'sapiens.jpg',
    url: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=500'
  },
  {
    filename: 'tam-ly-hoc-dam-dong.jpg',
    url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500'
  },
  {
    filename: 'giao-trinh-tieng-anh.jpg',
    url: 'https://images.unsplash.com/photo-1490633874781-1c63cc424610?w=500'
  },
  {
    filename: 'viet-nam-su-luoc.jpg',
    url: 'https://images.unsplash.com/photo-1506880135364-e28660dc35cb?w=500'
  },
  {
    filename: 'khoi-nghiep-tinh-gon.jpg',
    url: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=500'
  },
  {
    filename: 'doi-ngan-dung-ngu-dai.jpg',
    url: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=500'
  },
  {
    filename: 'tieng-viet-1.jpg',
    url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=500'
  },
  {
    filename: 'hoang-tu-be.jpg',
    url: 'https://images.unsplash.com/photo-1535398089889-dd807df1dfaa?w=500'
  }
];

// Hàm tải ảnh từ URL và lưu vào file
const downloadImage = (url, filename) => {
  return new Promise((resolve, reject) => {
    const filepath = path.join(imagesDir, filename);
    
    // Kiểm tra xem file đã tồn tại chưa
    if (fs.existsSync(filepath)) {
      console.log(`File ${filename} already exists, skipping...`);
      return resolve();
    }
    
    // Tải ảnh
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        console.log(`Failed to download ${url}: ${response.statusCode}, trying default image...`);
        // Thử lại với ảnh mặc định
        if (url !== DEFAULT_IMAGE_URL) {
          return downloadImage(DEFAULT_IMAGE_URL, filename)
            .then(resolve)
            .catch(() => {
              console.log('Could not download default image, creating placeholder...');
              return createPlaceholderImage(filename).then(resolve).catch(reject);
            });
        } else {
          console.log('Could not download default image, creating placeholder...');
          return createPlaceholderImage(filename).then(resolve).catch(reject);
        }
      }
      
      const fileStream = fs.createWriteStream(filepath);
      response.pipe(fileStream);
      
      fileStream.on('finish', () => {
        fileStream.close();
        console.log(`Downloaded: ${filename}`);
        resolve();
      });
      
      fileStream.on('error', (err) => {
        fs.unlink(filepath, () => {}); // Xóa file nếu có lỗi
        reject(err);
      });
    }).on('error', (err) => {
      console.log(`Error downloading ${url}: ${err.message}, trying default image...`);
      // Thử lại với ảnh mặc định
      if (url !== DEFAULT_IMAGE_URL) {
        return downloadImage(DEFAULT_IMAGE_URL, filename)
          .then(resolve)
          .catch(() => {
            console.log('Could not download default image, creating placeholder...');
            return createPlaceholderImage(filename).then(resolve).catch(reject);
          });
      } else {
        console.log('Could not download default image, creating placeholder...');
        return createPlaceholderImage(filename).then(resolve).catch(reject);
      }
    });
  });
};

// Tạo ảnh placeholder đơn giản
const createPlaceholderImage = (filename) => {
  return new Promise((resolve, reject) => {
    const filepath = path.join(imagesDir, filename);
    
    // Base64 encoded small transparent PNG image
    const emptyImageBase64 = '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';
    
    // Giải mã Base64 thành buffer
    const imageBuffer = Buffer.from(emptyImageBase64, 'base64');
    
    // Ghi buffer vào file
    fs.writeFile(filepath, imageBuffer, (err) => {
      if (err) {
        reject(err);
      } else {
        console.log(`Created placeholder image for: ${filename}`);
        resolve();
      }
    });
  });
};

// Tải tất cả ảnh
const downloadAllImages = async () => {
  try {
    console.log(`Downloading ${bookCovers.length} book covers...`);
    
    for (const cover of bookCovers) {
      try {
        await downloadImage(cover.url, cover.filename);
      } catch (error) {
        console.error(`Error processing ${cover.filename}: ${error.message}`);
        console.log('Creating placeholder image...');
        await createPlaceholderImage(cover.filename).catch(err => {
          console.error(`Failed to create placeholder for ${cover.filename}: ${err.message}`);
        });
      }
    }
    
    console.log('All images downloaded or created successfully!');
  } catch (error) {
    console.error(`Error in download process: ${error.message}`);
  }
};

// Chạy script
downloadAllImages(); 