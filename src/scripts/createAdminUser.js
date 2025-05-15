import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  });

const createAdminUser = async () => {
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email: 'admin@example.com' });
    
    if (existingUser) {
      console.log('User admin@example.com already exists.');
      // Update password if you want to reset it
      existingUser.password = 'password123';
      await existingUser.save();
      console.log('Password has been reset.');
    } else {
      // Create new admin user
      const newAdmin = await User.create({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
        role: 'admin',
        phone: '0987654321',
        address: 'Admin Address'
      });
      
      console.log('New admin user created:');
      console.log(`- Name: ${newAdmin.name}`);
      console.log(`- Email: ${newAdmin.email}`);
      console.log(`- Role: ${newAdmin.role}`);
      console.log(`- ID: ${newAdmin._id}`);
    }
    
    console.log('\nYou can now log in with:');
    console.log('Email: admin@example.com');
    console.log('Password: password123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

// Run the function
createAdminUser(); 