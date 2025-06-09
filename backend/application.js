require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const { resetRecipeTable } = require('./controllers/devController');

// Import route files
const recipeRoutes = require('./routes/recipes');
const devRoutes = require('./routes/devRoutes');
const adminRoutes = require('./routes/admin');

// Middleware
app.use(cors());
app.use(express.json());

// Mount routes
app.use('/api/recipes', recipeRoutes);
app.use('/dev', devRoutes); 
app.use('/api/admin', adminRoutes);

// Map root route to reset DB
app.get('/', resetRecipeTable);

// Start server
app.listen(5000, () => {
  console.log('Backend running on http://localhost:5000');
});
