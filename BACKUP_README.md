# Hướng dẫn sử dụng tính năng Backup/Restore Database

## Tổng quan
Tính năng backup/restore database cho phép bạn tạo bản sao lưu và khôi phục cơ sở dữ liệu MongoDB một cách dễ dàng thông qua giao diện web admin.

## Yêu cầu hệ thống
Để sử dụng tính năng này, bạn cần cài đặt **MongoDB Database Tools** trên hệ thống.

### Cài đặt MongoDB Database Tools

#### Windows
1. Tải MongoDB Database Tools từ: https://www.mongodb.com/try/download/database-tools
2. Chọn phiên bản Windows và tải về
3. Giải nén và thêm đường dẫn vào PATH environment variable
4. Hoặc sử dụng chocolatey: `choco install mongodb-database-tools`

#### macOS
```bash
# Sử dụng Homebrew
brew install mongodb/brew/mongodb-database-tools
```

#### Linux (Ubuntu/Debian)
```bash
# Thêm MongoDB repository
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Cài đặt tools
sudo apt-get update
sudo apt-get install -y mongodb-database-tools
```

#### Linux (CentOS/RHEL)
```bash
# Tạo repository file
sudo tee /etc/yum.repos.d/mongodb-org-7.0.repo << EOF
[mongodb-org-7.0]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/redhat/8/mongodb-org/7.0/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://www.mongodb.org/static/pgp/server-7.0.asc
EOF

# Cài đặt tools
sudo yum install -y mongodb-database-tools
```

### Kiểm tra cài đặt
Sau khi cài đặt, kiểm tra bằng cách chạy:
```bash
mongodump --version
mongorestore --version
```

## Cách sử dụng

### Truy cập tính năng
1. Đăng nhập vào admin panel
2. Vào **Cài đặt hệ thống** → tab **Backup/Restore**

### Tạo backup
1. Nhập tên file backup (tùy chọn) - nếu để trống sẽ tự động tạo tên theo thời gian
2. Nhập mô tả (tùy chọn)
3. Nhấn **Tạo backup**
4. Chờ quá trình hoàn thành

### Khôi phục database
1. Chọn file backup từ máy tính (hỗ trợ .gz, .archive, .bson)
2. Tích vào checkbox xác nhận
3. Nhấn **Khôi phục database**
4. **Lưu ý:** Việc khôi phục sẽ ghi đè lên dữ liệu hiện tại

### Quản lý backup
- **Xem danh sách:** Tất cả backup sẽ hiển thị trong bảng
- **Tải về:** Nhấn nút "Tải về" để download backup
- **Xóa:** Nhấn nút "Xóa" để xóa backup (không thể hoàn tác)

## Cấu trúc file backup
- Backup được lưu trong thư mục `/backups` tại root project
- **Format mới (khuyến nghị):** Archive format
  - File `.archive` chứa toàn bộ database
  - File `.metadata.json` chứa thông tin backup
  - File nén `.tar.gz` hoặc `.zip` (khi tải về, tùy theo OS)
- **Format cũ:** Directory format
  - Thư mục chứa data từ mongodump
  - File `metadata.json` trong thư mục backup
  - File nén `.tar.gz` (Linux) hoặc `.zip` (Windows) khi tải về

## Troubleshooting

### Lỗi "MongoDB Database Tools chưa được cài đặt"
- Cài đặt MongoDB Database Tools theo hướng dẫn ở trên
- Đảm bảo `mongodump` và `mongorestore` có trong PATH

### Lỗi timeout
- Backup/restore lớn có thể mất thời gian (timeout 5 phút)
- Kiểm tra kết nối database
- Kiểm tra dung lượng ổ cứng

### Lỗi quyền truy cập
- Đảm bảo ứng dụng có quyền ghi vào thư mục `backups`
- Kiểm tra quyền truy cập MongoDB database

### Lỗi format file
- Chỉ hỗ trợ file từ mongodump (.archive, .gz, .bson)
- Không hỗ trợ backup từ các tool khác
- **Khuyến nghị:** Sử dụng format `.archive` cho tương thích tốt nhất

### Sự khác biệt giữa Windows và Linux
- **Windows:** Sử dụng PowerShell Compress-Archive cho file nén (.zip)
- **Linux/Ubuntu:** Sử dụng tar cho file nén (.tar.gz)
- **Backup format:** Đều sử dụng mongodump archive format (.archive) - tương thích 100%
- **Restore:** Hoạt động giống nhau trên cả hai hệ điều hành

## Bảo mật
- Chỉ admin mới có thể truy cập tính năng này
- File backup chứa toàn bộ dữ liệu, cần bảo mật cẩn thận
- Nên lưu backup ở nơi an toàn, tách biệt với server

## Khuyến nghị
- Tạo backup định kỳ (hàng ngày/tuần)
- **Sử dụng format Archive (.archive) thay vì Directory** - nhanh hơn và tương thích tốt hơn
- Kiểm tra tính toàn vẹn của backup thường xuyên
- Lưu backup ở nhiều nơi khác nhau
- Xóa backup cũ để tiết kiệm dung lượng
- Test restore trên môi trường development trước khi restore production
- **Lưu ý OS:** Backup tạo trên Windows có thể restore trên Linux và ngược lại nhờ format archive 