const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const recipeRoutes = require('./routes/recipes');
const spoonacularRoutes = require('./routes/spoonacular');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api/recipes', recipeRoutes);
app.use('/api/spoonacular', spoonacularRoutes);

// Health check
app.get('/', (req, res) => {
  res.send('API is running');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});