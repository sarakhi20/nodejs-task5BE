const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const authRoutes = require('./routes/auth'); // Import the auth routes

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Enable CORS
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb+srv://KARTHIKEYAN:Karthikeyan.872002@cluster0.81oxm.mongodb.net/urlshortener', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to the URL Shortener API');
});

// Use the authentication routes
app.use('/api/auth', authRoutes);

// Example route for creating short URL
app.post('/api/shorturl', (req, res) => {
  // Logic to create short URL
  res.send('Short URL created');
});

// Example route for getting all short URLs
app.get('/api/urls', (req, res) => {
  // Example logic to get all short URLs
  // Replace this with actual logic to fetch URLs from the database
  res.json({ urls: ['example.com/short1', 'example.com/short2'] });
});

// Serve static assets if in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});