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
  'http://localhost:4200'                    // Allow local Angular dev server
];

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

// Define Recipe model
const Recipe = mongoose.model('Recipe', {
  title: String,
  ingredients: String,
  instructions: String,
  imageUrl: String
});

// API routes
app.get('/api/recipes', async (req, res) => {
  const recipes = await Recipe.find();
  res.json(recipes);
});

app.post('/api/recipes', async (req, res) => {
  const newRecipe = new Recipe(req.body);
  await newRecipe.save();
  res.json(newRecipe);
});

app.delete('/api/recipes/:id', async (req, res) => {
  await Recipe.findByIdAndDelete(req.params.id);
  res.json({ message: 'Recipe deleted' });
});

app.put('/api/recipes/:id', async (req, res) => {
  try {
    const updatedRecipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedRecipe) {
      return res.status(404).json({ message: 'Recipe not found' });
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