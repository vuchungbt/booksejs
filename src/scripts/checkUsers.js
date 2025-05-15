import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  });

const checkUsers = async () => {
  try {
    const users = await User.find({}).select('name email role');
    console.log('Users in the database:');
    console.table(users.map(u => ({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      role: u.role
    })));
    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

checkUsers(); 