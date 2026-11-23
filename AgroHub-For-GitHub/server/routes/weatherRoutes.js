const express = require('express');
const router = express.Router();
const { getWeatherByCity } = require('../controllers/weatherController');

// Route: GET /api/weather?city=<CityName>
router.get('/', getWeatherByCity);

module.exports = router;
