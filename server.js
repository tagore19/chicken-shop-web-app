const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Models
const Order = require('./models/Order'); // or './orders.js' if named so
const Admin = require('./models/Admin');
const User = require('./models/User');

mongoose.connect(
  'mongodb+srv://chickenshop:chickenshop@chicken-shop.z4ohcou.mongodb.net/?retryWrites=true&w=majority&appName=chicken-shop'
)
.then(() => console.log('✅ Connected to MongoDB Atlas'))
.catch(err => console.error('❌ MongoDB connection error:', err));

app.get('/', (req, res) => {
  res.send('🐔 Chicken Shop API is running!');
});

// POST /order — place a new order
app.post('/order', async (req, res) => {
  try {
    const { itemName, price, customerName, phoneNumber } = req.body;
    if (!itemName || !price || !customerName || !phoneNumber) {
      return res.status(400).json({ message: '❌ Missing order details' });
    }
    const order = new Order({ itemName, price, customerName, phoneNumber });
    await order.save();
    res.json({ message: '✅ Order saved', order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '❌ Error placing order' });
  }
});

// GET /orders — get all orders newest first
app.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '❌ Error getting orders' });
  }
});

// DELETE /orders/:id — delete order by ID
app.delete('/orders/:id', async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: '✅ Order deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '❌ Error deleting order' });
  }
});

// POST /orders/:id/toggle — toggle delivered & update deliveredAt
app.post('/orders/:id/toggle', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: '❌ Order not found' });
    }
    order.delivered = !order.delivered;
    if (order.delivered) {
      order.deliveredAt = new Date();
    } else {
      order.deliveredAt = null;
    }
    await order.save();
    res.json({ message: '✅ Order status toggled', order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '❌ Error toggling order' });
  }
});

// POST /admin/login — admin login returns JWT token
app.post('/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(401).json({ message: '❌ Invalid credentials' });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ message: '❌ Invalid credentials' });

    const token = jwt.sign({ id: admin._id }, 'secretkey', { expiresIn: '8h' }); // use env var in prod
    res.json({ message: '✅ Admin logged in', token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '❌ Error logging in' });
  }
});

// POST /register — user registration
app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const exists = await User.findOne({ username });
    if (exists) return res.status(400).json({ message: '❌ User already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashed });
    await user.save();
    res.json({ message: '✅ User registered' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '❌ Error registering user' });
  }
});

// POST /login — user login
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ message: '❌ Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: '❌ Invalid credentials' });

    res.json({ message: '✅ User logged in' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '❌ Error logging in' });
  }
});

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
