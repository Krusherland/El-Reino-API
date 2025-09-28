// Quick user registration for testing
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

async function createTestUser() {
  try {
    await mongoose.connect('mongodb://localhost:27017/netDB');
    console.log('✅ Connected to MongoDB');
    
    const User = mongoose.model('User', new mongoose.Schema({
      name: String,
      surname: String,
      nickname: String,
      email: String,
      password: String,
      role: String,
      image: String,
      created_at: { type: Date, default: Date.now }
    }));
    
    // Create a test user with known credentials
    const testPassword = '123456';
    const hashedPassword = await bcrypt.hash(testPassword, 10);
    
    const testUser = new User({
      name: 'Test',
      surname: 'User',
      nickname: 'testuser',
      email: 'test@test.com',
      password: hashedPassword,
      role: 'user'
    });
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: 'test@test.com' });
    if (existingUser) {
      console.log('ℹ️ Test user already exists');
    } else {
      await testUser.save();
      console.log('✅ Test user created successfully!');
    }
    
    console.log('\n📝 Login Credentials:');
    console.log('Email: test@test.com');
    console.log('Password: 123456');
    
    mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createTestUser();