const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();

const recipeRoutes = require('./routes/recipes');

app.use(cors());
app.use(express.json());

app.use('/api/recipes', recipeRoutes);

app.listen(5000, () => {
  console.log('Backend running on http://localhost:5000');
});