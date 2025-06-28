// Load .env only for local development
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const app = express();

// Allow requests only from my deployed frontend and localhost for dev
const allowedOrigins = [
  'https://recipe-organizer-production-7491.up.railway.app', // My actual deployed frontend URL
  'http://localhost:4200',                    // Allow local Angular dev server
  'http://192.168.1.239:4200',
  'http://192.168.1.239:5000'
];

app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "default-src 'self'; style-src 'self' https://fonts.googleapis.com 'unsafe-inline'; font-src https://fonts.gstatic.com;");
  next();
});

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));


const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = mongoose.model('User', {
  email: { type: String, unique: true },
  password: String
});


app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});


app.post('/api/register', async (req, res) => {
  console.log('Register request body:', req.body);  // Step 1a: Log input for debugging

  try {
    const { email, password } = req.body;

    // Step 1b: Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Step 1c: Hash the password safely
    const hashedPassword = await bcrypt.hash(password, 10);

    // Step 1d: Create new user and save to DB
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();

    // Step 1e: Send success message back
    res.status(201).json({ message: 'User registered successfully' });

  } catch (err) {
    console.error('Registration error:', err);

    // Step 1f: Handle duplicate email error gracefully
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Step 1g: Handle other server errors
    res.status(500).json({ message: 'Server error' });
  }
});



app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Create JWT token (use a secret string, store it safely in .env)
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});



function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) return res.status(401).json({ message: 'No token provided' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
}

// Define Recipe model
const Recipe = mongoose.model('Recipe', {
  userId: String, // new field to store owner user ID
  title: String,
  ingredients: String,
  instructions: String,
  imageUrl: String
});

// API routes
app.get('/api/recipes', authenticateToken, async (req, res) => {
  const recipes = await Recipe.find({ userId: req.user.userId });
  res.json(recipes);
});

app.post('/api/recipes', authenticateToken, async (req, res) => {
  const newRecipe = new Recipe({ ...req.body, userId: req.user.userId });
  await newRecipe.save();
  res.json(newRecipe);
});

app.delete('/api/recipes/:id', authenticateToken, async (req, res) => {
  const deletedRecipe = await Recipe.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
  if (!deletedRecipe) {
    return res.status(404).json({ message: 'Recipe not found or not authorized' });
  }
  res.json({ message: 'Recipe deleted' });
});

app.put('/api/recipes/:id', authenticateToken, async (req, res) => {
  try {
    const updatedRecipe = await Recipe.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      req.body,
      { new: true }
    );
    if (!updatedRecipe) {
      return res.status(404).json({ message: 'Recipe not found or not authorized' });
    }
    res.json(updatedRecipe);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// OPTIONAL: Serve frontend build from backend (only if combining frontend + backend)
// Uncomment if serving frontend files from backend in production:

// app.use(express.static(path.join(__dirname, '../frontend/dist/frontend')));

// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, '../frontend/dist/frontend/index.html'));
// });

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));