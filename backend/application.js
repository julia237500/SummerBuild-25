require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const { resetRecipeTable } = require('./controllers/devController');

// Import route files
const recipeRoutes = require('./routes/recipes');
const stripeRoutes = require('./routes/stripe');
const devRoutes = require('./routes/devRoutes');
const adminRoutes = require('./routes/admin');

// Middleware
app.use(cors());
app.use(express.json());

// Mount routes
app.use('/api/recipes', recipeRoutes);
app.use('/api', stripeRoutes);

app.use('/dev', devRoutes); 
app.use('/api/admin', adminRoutes);
const spoonacularRoutes = require('./routes/spoonacular');
app.use('/api/spoonacular', spoonacularRoutes);

// Map root route to reset DB
app.get('/', resetRecipeTable);

const stripeRoutes = require('./routes/Stripe');
app.use('/api/stripe', stripeRoutes);

// Start server
app.listen(5000, () => {
  console.log('Backend running on http://localhost:5000');
});


const favouritesRoutes = require('./routes/favourites');
app.use('/api/favourites', favouritesRoutes);
