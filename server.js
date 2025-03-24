const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb+srv://v01d:puiQNMy3fUkvJra7@test-db.dxurd.mongodb.net/?retryWrites=true&w=majority&appName=test-db', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error(err));

// Define User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  upi_id: { type: String, unique: true },
  balance: { type: Number}
});

// Create User Model
const User = mongoose.model('User', userSchema);

// Define Transaction Schema
const transactionSchema = new mongoose.Schema({
  sender_upi_id: { type: String, required: true },
  receiver_upi_id: { type: String, required: true },
  amount: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
});

// Create Transaction Model
const Transaction = mongoose.model('Transaction', transactionSchema);

// Function to generate a unique UPI ID
const generateUIP = () => {
  const randomId = crypto.randomBytes(4).toString('hex'); // Generates a random 8-character ID
  return `${randomId}@fastpay`;
};

// Signup Route
app.post('/api/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).send({ message: 'User already exists' });
    }

    // Generate UPI ID
    const upi_id = generateUIP();
    const balance = 1000;

    // Create new user
    user = new User({ name, email, password, upi_id, balance });
    await user.save();
    res.status(201).send({ message: 'User registered successfully!', upi_id });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Server error' });
  }
});

// Fetch User Details Route
app.get('/api/user/:upi_id', async (req, res) => {
  try {
    const { upi_id } = req.params;
    const user = await User.findOne({ upi_id });
    
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    res.status(200).send(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).send({ message: 'Server error' });
  }
});

// Login Route
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(400).send({ message: 'Invalid credentials' });
    }

    res.status(200).send({ message: 'Login successful!', upi_id: user.upi_id, balance: user.balance });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Server error' });
  }
});

// Transaction Route
// Transaction Route
app.post('/api/transaction', async (req, res) => {
    try {
      const { sender_upi_id, receiver_upi_id, amount } = req.body;
  
      // Validate amount
      if (amount <= 0) {
        return res.status(400).send({ message: 'Invalid amount' });
      }
  
      // Find sender and receiver
      const sender = await User.findOne({ upi_id: sender_upi_id });
      const receiver = await User.findOne({ upi_id: receiver_upi_id });
  
      if (!sender) {
        return res.status(404).send({ message: 'Sender not found' });
      }
      if (!receiver) {
        return res.status(404).send({ message: 'Receiver not found' });
      }
  
      // Check if sender has enough balance
      if (sender.balance < amount) {
        return res.status(400).send({ message: 'Insufficient balance' });
      }
  
      // Perform transaction
      sender.balance -= amount;
      receiver.balance += amount;
  
      // Log before saving
      console.log('Updating sender balance:', sender);
      console.log('Updating receiver balance:', receiver);
  
      // Save updated users
      await sender.save();
      await receiver.save();
  
      // Log after saving
      console.log('Sender balance after save:', sender);
      console.log('Receiver balance after save:', receiver);
  
      // Save transaction record
      const transaction = new Transaction({ sender_upi_id, receiver_upi_id, amount });
      await transaction.save();
  
      res.status(200).send({ message: 'Transaction successful!' });
    } catch (error) {
      console.error('Transaction error:', error);
      res.status(500).send({ message: 'Server error' });
    }
  });
  

// Get Transactions Route
app.get('/api/transactions/:upi_id', async (req, res) => {
  try {
    const { upi_id } = req.params;

    // Find transactions for the given UPI ID
    const transactions = await Transaction.find({
      $or: [{ sender_upi_id: upi_id }, { receiver_upi_id: upi_id }]
    }).sort({ timestamp: -1 });

    res.status(200).send(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Server error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));