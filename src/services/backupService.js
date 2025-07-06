import { exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../..');
const BACKUP_DIR = path.join(PROJECT_ROOT, 'backups');
const IS_WINDOWS = os.platform() === 'win32';

class BackupService {
  constructor() {
    this.initializeBackupDir();
  }

  async initializeBackupDir() {
    try {
      await fs.access(BACKUP_DIR);
    } catch {
      await fs.mkdir(BACKUP_DIR, { recursive: true });
      console.log('Created backup directory:', BACKUP_DIR);
    }
  }

  async createBackup(customName = '', description = '') {
    try {
      // Generate filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = customName || `backup-${timestamp}`;
      const backupPath = path.join(BACKUP_DIR, `${filename}.archive`);
      
      // Get MongoDB connection string from environment
      const mongoUri = process.env.MONGO_URI;
      if (!mongoUri) {
        throw new Error('MONGO_URI environment variable is not set');
      }
      
      // Parse MongoDB URI to get database name
      const dbName = this.extractDbName(mongoUri);
      
      // Create backup using mongodump with archive format for better compatibility
      const command = `mongodump --uri="${mongoUri}" --archive="${backupPath}"`;
      
      return new Promise((resolve, reject) => {
        exec(command, { timeout: 300000 }, async (error, stdout, stderr) => {
          if (error) {
            console.error('Backup error:', error);
            
            // Check if mongodump is available
            if (error.message.includes('mongodump') || error.message.includes('not found') || error.message.includes('not recognized')) {
              resolve({ 
                success: false, 
                message: 'MongoDB Database Tools chưa được cài đặt. Vui lòng cài đặt MongoDB Database Tools để sử dụng tính năng backup.' 
              });
              return;
            }
            
            resolve({ success: false, message: `Lỗi tạo backup: ${error.message}` });
            return;
          }
          
          try {
            // Create metadata file
            const metadata = {
              name: filename,
              description: description || 'Backup được tạo tự động',
              database: dbName,
              created: new Date().toISOString(),
              size: await this.getFileSize(backupPath),
              format: 'archive'
            };
            
            const metadataPath = path.join(BACKUP_DIR, `${filename}.metadata.json`);
            await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
            
            console.log('Backup created successfully:', filename);
            resolve({ success: true, filename: `${filename}.archive`, message: 'Backup created successfully' });
          } catch (metaError) {
            console.error('Metadata error:', metaError);
            resolve({ success: true, filename: `${filename}.archive`, message: 'Backup created but metadata failed' });
          }
        });
      });
    } catch (error) {
      console.error('Create backup error:', error);
      return { success: false, message: error.message };
    }
  }

  async restoreBackup(backupPath) {
    try {
      // Get MongoDB connection string from environment
      const mongoUri = process.env.MONGO_URI;
      if (!mongoUri) {
        throw new Error('MONGO_URI environment variable is not set');
      }
      
      const dbName = this.extractDbName(mongoUri);
      
      // Check if backup is a directory or file
      const stats = await fs.stat(backupPath);
      let restoreCommand;
      
      if (stats.isDirectory()) {
        // Directory backup from mongodump (old format)
        const dbPath = path.join(backupPath, dbName);
        restoreCommand = `mongorestore --uri="${mongoUri}" --drop "${dbPath}"`;
      } else {
        // Single file backup - check extension
        const fileExt = path.extname(backupPath).toLowerCase();
        
        if (fileExt === '.archive') {
          // Archive format (preferred)
          restoreCommand = `mongorestore --uri="${mongoUri}" --drop --archive="${backupPath}"`;
        } else if (fileExt === '.gz') {
          // Compressed archive
          restoreCommand = `mongorestore --uri="${mongoUri}" --drop --gzip --archive="${backupPath}"`;
        } else if (fileExt === '.bson') {
          // BSON file
          restoreCommand = `mongorestore --uri="${mongoUri}" --drop "${backupPath}"`;
        } else {
          return { success: false, message: 'Định dạng file backup không được hỗ trợ. Chỉ hỗ trợ .archive, .gz, .bson' };
        }
      }
      
      return new Promise((resolve, reject) => {
        console.log('Executing restore command:', restoreCommand);
        exec(restoreCommand, { timeout: 300000 }, (error, stdout, stderr) => {
          if (error) {
            console.error('Restore error:', error);
            
            // Check if mongorestore is available
            if (error.message.includes('mongorestore') || error.message.includes('not found') || error.message.includes('not recognized')) {
              resolve({ 
                success: false, 
                message: 'MongoDB Database Tools chưa được cài đặt. Vui lòng cài đặt MongoDB Database Tools để sử dụng tính năng restore.' 
              });
              return;
            }
            
            resolve({ success: false, message: `Lỗi khôi phục: ${error.message}` });
            return;
          }
          
          console.log('Database restored successfully');
          console.log('Stdout:', stdout);
          if (stderr) console.log('Stderr:', stderr);
          resolve({ success: true, message: 'Database restored successfully' });
        });
      });
    } catch (error) {
      console.error('Restore backup error:', error);
      return { success: false, message: error.message };
    }
  }

  async getBackupList() {
    try {
      await this.initializeBackupDir();
      
      const files = await fs.readdir(BACKUP_DIR);
      const backups = [];
      const processedFiles = new Set();
      
      for (const file of files) {
        const filePath = path.join(BACKUP_DIR, file);
        const stats = await fs.stat(filePath);
        
        // Skip metadata files
        if (file.endsWith('.metadata.json')) {
          continue;
        }
        
        if (stats.isDirectory()) {
          // Old format: directory backup
          const metadataPath = path.join(filePath, 'metadata.json');
          let metadata = null;
          
          try {
            const metadataContent = await fs.readFile(metadataPath, 'utf-8');
            metadata = JSON.parse(metadataContent);
          } catch {
            // No metadata file, create basic info
            metadata = {
              name: file,
              description: 'Backup cũ (directory format)',
              created: stats.mtime.toISOString(),
              size: await this.getFolderSize(filePath)
            };
          }
          
          backups.push({
            name: file,
            size: this.formatFileSize(metadata.size),
            created: this.formatDate(metadata.created),
            description: metadata.description || 'Không có mô tả',
            format: 'directory'
          });
          
          processedFiles.add(file);
        } else if (file.endsWith('.archive')) {
          // New format: archive file backup
          const baseName = file.replace('.archive', '');
          const metadataPath = path.join(BACKUP_DIR, `${baseName}.metadata.json`);
          let metadata = null;
          
          try {
            const metadataContent = await fs.readFile(metadataPath, 'utf-8');
            metadata = JSON.parse(metadataContent);
          } catch {
            // No metadata file, create basic info
            metadata = {
              name: baseName,
              description: 'Backup archive (không có metadata)',
              created: stats.mtime.toISOString(),
              size: stats.size
            };
          }
          
          backups.push({
            name: file,
            size: this.formatFileSize(metadata.size),
            created: this.formatDate(metadata.created),
            description: metadata.description || 'Không có mô tả',
            format: 'archive'
          });
          
          processedFiles.add(file);
        }
      }
      
      // Sort by creation date (newest first)
      backups.sort((a, b) => new Date(b.created) - new Date(a.created));
      
      return { success: true, backups };
    } catch (error) {
      console.error('Get backup list error:', error);
      return { success: false, message: error.message };
    }
  }

  async downloadBackup(filename) {
    try {
      const backupPath = path.join(BACKUP_DIR, filename);
      
      // Check if backup exists
      await fs.access(backupPath);
      
      // For directories, we need to create a compressed archive
      const stats = await fs.stat(backupPath);
      if (stats.isDirectory()) {
        const archivePath = path.join(BACKUP_DIR, `${filename}.tar.gz`);
        
        // Create tar.gz archive - use different commands for Windows and Linux
        let command;
        if (IS_WINDOWS) {
          // Windows: Use PowerShell Compress-Archive or 7zip if available
          command = `powershell Compress-Archive -Path "${backupPath}" -DestinationPath "${archivePath.replace('.tar.gz', '.zip')}"`;
        } else {
          // Linux/Unix: Use tar
          command = `tar -czf "${archivePath}" -C "${BACKUP_DIR}" "${filename}"`;
        }
        
        return new Promise((resolve, reject) => {
          exec(command, (error, stdout, stderr) => {
            if (error) {
              resolve({ success: false, message: `Lỗi tạo archive: ${error.message}` });
              return;
            }
            
            const finalPath = IS_WINDOWS ? archivePath.replace('.tar.gz', '.zip') : archivePath;
            resolve({ success: true, filePath: finalPath });
          });
        });
      } else {
        // For archive files, return directly
        return { success: true, filePath: backupPath };
      }
    } catch (error) {
      console.error('Download backup error:', error);
      return { success: false, message: 'File backup không tồn tại' };
    }
  }

  async deleteBackup(filename) {
    try {
      const backupPath = path.join(BACKUP_DIR, filename);
      
      // Check if backup exists
      await fs.access(backupPath);
      
      // Delete backup (directory or file)
      const stats = await fs.stat(backupPath);
      if (stats.isDirectory()) {
        await fs.rmdir(backupPath, { recursive: true });
      } else {
        await fs.unlink(backupPath);
      }
      
      // Delete associated metadata file for archive backups
      if (filename.endsWith('.archive')) {
        const baseName = filename.replace('.archive', '');
        const metadataPath = path.join(BACKUP_DIR, `${baseName}.metadata.json`);
        try {
          await fs.access(metadataPath);
          await fs.unlink(metadataPath);
        } catch {
          // Metadata doesn't exist, ignore
        }
      }
      
      // Also delete any associated compressed files
      const possibleCompressedFiles = [
        path.join(BACKUP_DIR, `${filename}.tar.gz`),
        path.join(BACKUP_DIR, `${filename}.zip`),
        path.join(BACKUP_DIR, `${filename.replace('.archive', '')}.tar.gz`),
        path.join(BACKUP_DIR, `${filename.replace('.archive', '')}.zip`)
      ];
      
      for (const compressedFile of possibleCompressedFiles) {
        try {
          await fs.access(compressedFile);
          await fs.unlink(compressedFile);
        } catch {
          // File doesn't exist, ignore
        }
      }
      
      return { success: true, message: 'Backup deleted successfully' };
    } catch (error) {
      console.error('Delete backup error:', error);
      return { success: false, message: 'Không thể xóa backup' };
    }
  }

  // Helper methods
  extractDbName(mongoUri) {
    try {
      const url = new URL(mongoUri);
      return url.pathname.substring(1) || 'test';
    } catch {
      return 'test';
    }
  }

  async getFileSize(filePath) {
    try {
      const stats = await fs.stat(filePath);
      return stats.size;
    } catch {
      return 0;
    }
  }

  async getFolderSize(dirPath) {
    try {
      const files = await fs.readdir(dirPath);
      let totalSize = 0;
      
      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stats = await fs.stat(filePath);
        
        if (stats.isDirectory()) {
          totalSize += await this.getFolderSize(filePath);
        } else {
          totalSize += stats.size;
        }
      }
      
      return totalSize;
    } catch {
      return 0;
    }
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }
}

export default new BackupService(); 