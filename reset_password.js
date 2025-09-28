// Reset password for existing user
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

async function resetPassword() {
  try {
    await mongoose.connect('mongodb://localhost:27017/netDB');

    
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
    
    // Reset password for kru@gmail.com
    const newPassword = '123456';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    const result = await User.updateOne(
      { email: 'kru@gmail.com' },
      { password: hashedPassword }
    );
    
    if (result.modifiedCount > 0) {
      console.log('✅ Password reset successfully!');
      console.log('\n📝 Updated Login Credentials:');
      console.log('Email: kru@gmail.com');
    } else {
      console.log('❌ User not found or password not updated');
    }
    
    mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

resetPassword();