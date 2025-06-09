const express = require('express');
const router = express.Router();
const { resetRecipeTable } = require('../controllers/devController');

router.get('/reset-db', resetRecipeTable);

module.exports = router;
