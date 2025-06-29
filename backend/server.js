// Load .env only for local development
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const multer = require('multer');
const fs = require('fs');
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
  res.setHeader("Content-Security-Policy", "default-src 'self'; style-src 'self' https://fonts.googleapis.com 'unsafe-inline'; font-src https://fonts.gstatic.com; img-src 'self' https://res.cloudinary.com data:;");
  next();
});

// Increase body size limit
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Serve static uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));


//const storage = multer.diskStorage({
//destination: (req, file, cb) => {
//cb(null, 'uploads/');
//},
//filename: (req, file, cb) => {
//const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
//const ext = path.extname(file.originalname);
//cb(null, file.fieldname + '-' + uniqueSuffix + ext);
//}
//});


const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary with my env vars
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Setup Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'recipes',
    allowed_formats: ['jpg', 'png', 'webp']
  },
});


const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});


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
  imagePath: String
});

// API routes
app.get('/api/recipes', authenticateToken, async (req, res) => {
  const recipes = await Recipe.find({ userId: req.user.userId });
  res.json(recipes);
});

app.post('/api/recipes', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { title, ingredients, instructions } = req.body;
    const imagePath = req.file?.path || '';

    const newRecipe = new Recipe({
      userId: req.user.userId,
      title,
      ingredients,
      instructions,
      imagePath
    });

    await newRecipe.save();
    res.json(newRecipe);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to upload recipe' });
  }

  console.log('Uploaded file info:', req.file);
  console.log('Final imagePath:', imagePath);
  console.log('Cloudinary URL saved to DB:', imagePath);
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