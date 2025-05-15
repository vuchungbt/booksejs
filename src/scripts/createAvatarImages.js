import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const imagesDir = path.join(__dirname, '../public/images');
const avatarsDir = path.join(imagesDir, 'avatars');

// Create avatars directory if it doesn't exist
const createAvatarsDirectory = () => {
  if (!fs.existsSync(avatarsDir)) {
    fs.mkdirSync(avatarsDir, { recursive: true });
    console.log('Created avatars directory');
  } else {
    console.log('Avatars directory already exists');
  }
};

// Set up default avatars to create
const avatarsToCreate = [
  'default-avatar.png',
  'admin-avatar.png',
  'author-1.png',
  'author-2.png',
  'author-3.png'
];

// Check if we have a source image to use
const createDefaultAvatars = () => {
  try {
    createAvatarsDirectory();
    
    // Check if we can use default-book.png as a source
    const sourceImagePath = path.join(imagesDir, 'default-book.png');
    
    if (!fs.existsSync(sourceImagePath)) {
      console.error('Source image default-book.png not found! Creating empty avatars instead.');
      
      // Create empty placeholder files for avatars (1x1 transparent PNG equivalent in base64)
      const emptyImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
      const emptyImageBuffer = Buffer.from(emptyImageBase64, 'base64');
      
      // Create all required avatars
      for (const avatarName of avatarsToCreate) {
        const avatarPath = path.join(avatarsDir, avatarName);
        
        // Skip if avatar already exists
        if (fs.existsSync(avatarPath)) {
          console.log(`${avatarName} already exists.`);
          continue;
        }
        
        // Create empty avatar file
        fs.writeFileSync(avatarPath, emptyImageBuffer);
        console.log(`Created ${avatarName}`);
      }
    } else {
      // Use existing default-book.png as source for avatars
      const sourceImage = fs.readFileSync(sourceImagePath);
      
      // Create all required avatars
      for (const avatarName of avatarsToCreate) {
        const avatarPath = path.join(avatarsDir, avatarName);
        
        // Skip if avatar already exists
        if (fs.existsSync(avatarPath)) {
          console.log(`${avatarName} already exists.`);
          continue;
        }
        
        // Copy source image to create avatar
        fs.writeFileSync(avatarPath, sourceImage);
        console.log(`Created ${avatarName}`);
      }
    }
    
    console.log('Avatar creation completed successfully');
  } catch (error) {
    console.error('Error creating avatars:', error);
    process.exit(1);
  }
};

// Run the function
createDefaultAvatars(); 