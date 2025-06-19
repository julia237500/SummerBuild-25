require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const { resetRecipeTable } = require('./controllers/devController');

// Import route files
const recipeRoutes = require('./routes/recipes');

// Middleware
app.use(cors());
app.use(express.json());

// Mount routes
app.use('/api/recipes', recipeRoutes);

app.listen(5000, () => {
  console.log('Backend running on http://localhost:5000');
});


const favouritesRoutes = require('./routes/favourites');
app.use('/api/favourites', favouritesRoutes);
