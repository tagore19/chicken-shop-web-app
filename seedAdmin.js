const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');

mongoose.connect('mongodb+srv://chickenshop:chickenshop@chicken-shop.z4ohcou.mongodb.net/?retryWrites=true&w=majority&appName=chicken-shop')
  .then(async () => {
    const hashedPassword = await bcrypt.hash('tagorereddy', 10);
    const admin = new Admin({
      username: 'tagorepasham@gmail.com',
      password: hashedPassword
    });
    await admin.save();
    console.log('✅ Admin created!');
    process.exit();
  })
  .catch(err => console.error('❌ Error connecting to MongoDB:', err));
