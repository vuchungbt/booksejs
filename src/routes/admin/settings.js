import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Settings from '../../models/Settings.js';
import { isAdmin } from '../../middleware/auth.js';

const router = express.Router();

// Get absolute paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../../..');
const PUBLIC_IMAGES_DIR = path.join(PROJECT_ROOT, 'src', 'public', 'images');

// Ensure images directory exists
if (!fs.existsSync(PUBLIC_IMAGES_DIR)) {
  fs.mkdirSync(PUBLIC_IMAGES_DIR, { recursive: true });
  console.log('Created images directory:', PUBLIC_IMAGES_DIR);
}

// Apply admin middleware to all routes
router.use(isAdmin);

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    console.log('Upload path:', PUBLIC_IMAGES_DIR);
    cb(null, PUBLIC_IMAGES_DIR);
  },
  filename: function(req, file, cb) {
    // Generate a unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    
    const filename = file.fieldname === 'logo' 
      ? 'logo-' + uniqueSuffix + ext 
      : file.fieldname === 'favicon' 
        ? 'favicon-' + uniqueSuffix + ext 
        : file.fieldname + '-' + uniqueSuffix + ext;
    
    console.log('Generated filename:', filename);
    cb(null, filename);
  }
});

// Set up file filter to accept images and backup files
const fileFilter = (req, file, cb) => {
  // For backup/restore endpoints, accept backup files
  if (req.route.path.includes('/restore')) {
    if (!file.originalname.match(/\.(archive|gz|bson)$/i)) {
      req.fileValidationError = 'Chỉ chấp nhận file backup (.archive, .gz, .bson)!';
      return cb(new Error('Chỉ chấp nhận file backup (.archive, .gz, .bson)!'), false);
    }
  } else {
    // For other endpoints, accept images only
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF|ico|ICO)$/)) {
      req.fileValidationError = 'Chỉ chấp nhận file hình ảnh!';
      return cb(new Error('Chỉ chấp nhận file hình ảnh!'), false);
    }
  }
  cb(null, true);
};

const upload = multer({ 
  storage: storage, 
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

// @desc    Get settings page
// @route   GET /admin/settings
// @access  Private/Admin
router.get('/', async (req, res) => {
  try {
    // Get or create settings
    const settings = await Settings.getSiteSettings();
    
    res.render('admin/settings/index', {
      title: 'Cài đặt hệ thống',
      layout: 'layouts/admin',
      settings
    });
  } catch (error) {
    console.error('Settings error:', error);
    req.flash('error_msg', 'Không thể tải cài đặt');
    res.redirect('/admin');
  }
});

// @desc    Update settings
// @route   POST /admin/settings
// @access  Private/Admin
router.post('/', upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'favicon', maxCount: 1 }
]), async (req, res) => {
  try {
    console.log('Processing settings update...');
    console.log('Files:', req.files);
    console.log('Form data:', req.body);
    
    const {
      siteName,
      siteDescription,
      companyName,
      footerDescription,
      address,
      phone,
      email,
      workingHours,
      copyright,
      facebook,
      twitter,
      instagram,
      youtube,
      terms,
      privacy
    } = req.body;
    
    // Get settings
    const settings = await Settings.getSiteSettings();
    
    // Update settings
    settings.siteName = siteName;
    settings.siteDescription = siteDescription;
    
    // Handle file uploads
    if (req.files) {
      console.log('Processing uploaded files...');
      
      // Handle logo upload
      if (req.files.logo && req.files.logo.length > 0) {
        const logoFile = req.files.logo[0];
        console.log('Logo file:', logoFile);
        
        // Delete old logo if it exists and is not the default
        if (settings.logoPath && settings.logoPath !== '/images/logo.png') {
          const oldLogoPath = path.join(PROJECT_ROOT, 'src', 'public', settings.logoPath);
          console.log('Trying to delete old logo:', oldLogoPath);
          
          try {
            if (fs.existsSync(oldLogoPath)) {
              fs.unlinkSync(oldLogoPath);
              console.log('Old logo deleted successfully');
            } else {
              console.log('Old logo file not found');
            }
          } catch (error) {
            console.error('Error deleting old logo:', error);
          }
        }
        
        // Set new logo path - use only the filename (without the full path)
        settings.logoPath = '/images/' + logoFile.filename;
        console.log('New logo path set to:', settings.logoPath);
      }
      
      // Handle favicon upload
      if (req.files.favicon && req.files.favicon.length > 0) {
        const faviconFile = req.files.favicon[0];
        console.log('Favicon file:', faviconFile);
        
        // Delete old favicon if it exists and is not the default
        if (settings.faviconPath && settings.faviconPath !== '/images/books/favicon.ico') {
          const oldFaviconPath = path.join(PROJECT_ROOT, 'src', 'public', settings.faviconPath);
          console.log('Trying to delete old favicon:', oldFaviconPath);
          
          try {
            if (fs.existsSync(oldFaviconPath)) {
              fs.unlinkSync(oldFaviconPath);
              console.log('Old favicon deleted successfully');
            } else {
              console.log('Old favicon file not found');
            }
          } catch (error) {
            console.error('Error deleting old favicon:', error);
          }
        }
        
        // Set new favicon path - use only the filename (without the full path)
        settings.faviconPath = '/images/' + faviconFile.filename;
        console.log('New favicon path set to:', settings.faviconPath);
      }
    }
    
    // Update footer information
    settings.footer.companyName = companyName;
    settings.footer.description = footerDescription;
    settings.footer.address = address;
    settings.footer.phone = phone;
    settings.footer.email = email;
    settings.footer.workingHours = workingHours;
    settings.footer.copyright = copyright;
    
    // Update social links
    settings.socialLinks.facebook = facebook;
    settings.socialLinks.twitter = twitter;
    settings.socialLinks.instagram = instagram;
    settings.socialLinks.youtube = youtube;
    
    // Update legal links
    settings.legalLinks.terms = terms;
    settings.legalLinks.privacy = privacy;
    
    // Update timestamp
    settings.updatedAt = Date.now();
    
    await settings.save();
    console.log('Settings updated successfully');
    
    req.flash('success_msg', 'Cài đặt đã được cập nhật');
    res.redirect('/admin/settings');
  } catch (error) {
    console.error('Settings update error:', error);
    req.flash('error_msg', 'Không thể cập nhật cài đặt: ' + error.message);
    res.redirect('/admin/settings');
  }
});

// Backup/Restore Routes
// @desc    Create database backup
// @route   POST /admin/settings/backup
// @access  Private/Admin
router.post('/backup', async (req, res) => {
  try {
    const { name, description } = req.body;
    const backupService = await import('../../services/backupService.js');
    
    const result = await backupService.default.createBackup(name, description);
    
    if (result.success) {
      res.json({ success: true, message: 'Backup created successfully', filename: result.filename });
    } else {
      res.status(500).json({ success: false, message: result.message });
    }
  } catch (error) {
    console.error('Backup error:', error);
    res.status(500).json({ success: false, message: 'Lỗi tạo backup: ' + error.message });
  }
});

// @desc    Restore database from backup
// @route   POST /admin/settings/restore
// @access  Private/Admin
router.post('/restore', upload.single('backupFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn file backup' });
    }
    
    // Check file extension
    const allowedExtensions = ['.archive', '.gz', '.bson'];
    const fileExt = path.extname(req.file.originalname).toLowerCase();
    
    if (!allowedExtensions.includes(fileExt)) {
      // Clean up uploaded file
      try {
        await fs.unlink(req.file.path);
      } catch {}
      
      return res.status(400).json({ 
        success: false, 
        message: 'Định dạng file không hỗ trợ. Chỉ chấp nhận file .archive, .gz, .bson' 
      });
    }
    
    const backupService = await import('../../services/backupService.js');
    const result = await backupService.default.restoreBackup(req.file.path);
    
    // Clean up uploaded file after processing
    try {
      await fs.unlink(req.file.path);
    } catch (cleanupError) {
      console.error('Error cleaning up uploaded file:', cleanupError);
    }
    
    if (result.success) {
      res.json({ success: true, message: 'Database restored successfully' });
    } else {
      res.status(500).json({ success: false, message: result.message });
    }
  } catch (error) {
    console.error('Restore error:', error);
    res.status(500).json({ success: false, message: 'Lỗi khôi phục: ' + error.message });
  }
});

// @desc    Get list of backup files
// @route   GET /admin/settings/backups
// @access  Private/Admin
router.get('/backups', async (req, res) => {
  try {
    const backupService = await import('../../services/backupService.js');
    const result = await backupService.default.getBackupList();
    
    if (result.success) {
      res.json({ success: true, backups: result.backups });
    } else {
      res.status(500).json({ success: false, message: result.message });
    }
  } catch (error) {
    console.error('Get backups error:', error);
    res.status(500).json({ success: false, message: 'Lỗi lấy danh sách backup: ' + error.message });
  }
});

// @desc    Download backup file
// @route   GET /admin/settings/download-backup/:filename
// @access  Private/Admin
router.get('/download-backup/:filename', async (req, res) => {
  try {
    const backupService = await import('../../services/backupService.js');
    const result = await backupService.default.downloadBackup(req.params.filename);
    
    if (result.success) {
      res.download(result.filePath, req.params.filename);
    } else {
      res.status(404).json({ success: false, message: result.message });
    }
  } catch (error) {
    console.error('Download backup error:', error);
    res.status(500).json({ success: false, message: 'Lỗi tải file backup: ' + error.message });
  }
});

// @desc    Delete backup file
// @route   DELETE /admin/settings/delete-backup/:filename
// @access  Private/Admin
router.delete('/delete-backup/:filename', async (req, res) => {
  try {
    const backupService = await import('../../services/backupService.js');
    const result = await backupService.default.deleteBackup(req.params.filename);
    
    if (result.success) {
      res.json({ success: true, message: 'Backup deleted successfully' });
    } else {
      res.status(500).json({ success: false, message: result.message });
    }
  } catch (error) {
    console.error('Delete backup error:', error);
    res.status(500).json({ success: false, message: 'Lỗi xóa backup: ' + error.message });
  }
});

export default router; 