import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const imagesDir = path.join(__dirname, '../public/images/books');

// Check if all default images exist
const imagesToCreate = [
  'default-book.png',
  'default-book-1.png',
  'default-book-2.png',
  'default-book-3.png'
];

const createDefaultImages = () => {
  try {
    // Source image path
    const sourceImagePath = path.join(imagesDir, 'default-book.png');
    
    // Check if source image exists
    if (!fs.existsSync(sourceImagePath)) {
      console.error('Source image default-book.png not found!');
      process.exit(1);
    }
    
    // Read the source image
    const sourceImage = fs.readFileSync(sourceImagePath);
    
    // Create missing default images
    let createdCount = 0;
    
    for (const imageName of imagesToCreate) {
      const imagePath = path.join(imagesDir, imageName);
      
      // Skip if image already exists
      if (fs.existsSync(imagePath)) {
        console.log(`${imageName} already exists.`);
        continue;
      }
      
      // Copy the source image to create the new image
      fs.writeFileSync(imagePath, sourceImage);
      console.log(`Created ${imageName}`);
      createdCount++;
    }
    
    console.log(`Created ${createdCount} default book images`);
    console.log('Script completed successfully');
  } catch (error) {
    console.error('Error creating default images:', error);
    process.exit(1);
  }
};

// Run the function
createDefaultImages(); 