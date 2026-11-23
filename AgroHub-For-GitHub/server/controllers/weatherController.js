/**
 * Weather Controller for AgroHub
 * Securely proxies real-time meteorological data on the backend.
 * Uses OpenWeatherMap if OPENWEATHER_API_KEY is defined in .env,
 * otherwise seamlessly defaults to high-accuracy Open-Meteo & WMO standard data.
 */

// WMO Weather Interpretation Codes Table
const WMO_CODE_MAP = {
  0: { condition: 'Clear Sky', icon: 'Sun', risk: 'Low' },
  1: { condition: 'Mainly Clear', icon: 'Sun', risk: 'Low' },
  2: { condition: 'Partly Cloudy', icon: 'CloudSun', risk: 'Low' },
  3: { condition: 'Overcast', icon: 'Cloud', risk: 'Low' },
  45: { condition: 'Foggy & Reduced Visibility', icon: 'CloudFog', risk: 'Medium' },
  48: { condition: 'Depositing Rime Fog', icon: 'CloudFog', risk: 'Medium' },
  51: { condition: 'Light Drizzle', icon: 'CloudDrizzle', risk: 'Low' },
  53: { condition: 'Moderate Drizzle', icon: 'CloudDrizzle', risk: 'Medium' },
  55: { condition: 'Dense Drizzle', icon: 'CloudDrizzle', risk: 'Medium' },
  61: { condition: 'Slight Rain', icon: 'CloudRain', risk: 'Medium' },
  63: { condition: 'Moderate Rain', icon: 'CloudRain', risk: 'Medium' },
  65: { condition: 'Heavy Rain', icon: 'CloudRain', risk: 'High' },
  71: { condition: 'Slight Snow Fall', icon: 'Snowflake', risk: 'High' },
  73: { condition: 'Moderate Snow Fall', icon: 'Snowflake', risk: 'High' },
  75: { condition: 'Heavy Snow Fall', icon: 'Snowflake', risk: 'High' },
  80: { condition: 'Slight Rain Showers', icon: 'CloudRain', risk: 'Medium' },
  81: { condition: 'Moderate Rain Showers', icon: 'CloudRain', risk: 'Medium' },
  82: { condition: 'Violent Rain Showers', icon: 'CloudRain', risk: 'High' },
  95: { condition: 'Thunderstorm', icon: 'CloudLightning', risk: 'High' },
  96: { condition: 'Thunderstorm with Slight Hail', icon: 'CloudLightning', risk: 'High' },
  99: { condition: 'Thunderstorm with Heavy Hail', icon: 'CloudLightning', risk: 'High' },
};

/**
 * Generates custom farming-focused advisories based on real weather metrics
 */
const generateFarmerAdvisory = (temp, humidity, windSpeed, weatherCode) => {
  const advisories = [];
  let riskLevel = 'Low';

  // Rain / Thunderstorm checks
  if ([61, 63, 65, 80, 81, 82, 95, 96, 99].includes(weatherCode)) {
    advisories.push('Rainfall anticipated: Delay chemical pesticide spraying and fertilizer top-dressing to prevent runoff. Ensure field drainage channels are clear.');
    riskLevel = 'High';
  } else if ([51, 53, 55].includes(weatherCode)) {
    advisories.push('Drizzle conditions: Monitor fields for fungal spore germination. Delay crop harvesting until sunshine.');
    riskLevel = 'Medium';
  } else {
    advisories.push('Favorable weather for harvesting, threshing, and crop transport.');
  }

  // Wind speed check
  if (windSpeed > 20) {
    advisories.push('High wind velocities (>20 km/h): Strictly avoid foliar pesticide/herbicide spraying due to drift hazard. Secure lightweight green net structures.');
    if (riskLevel !== 'High') riskLevel = 'Medium';
  } else {
    advisories.push('Gentle wind speed suitable for standard field spraying operations.');
  }

  // Temperature checks
  if (temp > 38) {
    advisories.push('Extreme heat stress (>38°C): Irrigate standing crops in early morning or late evening to reduce evaporative loss and protect blossom drop.');
    riskLevel = 'High';
  } else if (temp < 8) {
    advisories.push('Low temperature / Frost hazard (<8°C): Protect tender nursery seedlings with light mulching or micro-irrigation.');
    if (riskLevel !== 'High') riskLevel = 'Medium';
  }

  // Humidity checks
  if (humidity > 75) {
    advisories.push('Elevated relative humidity (>75%): Inspect paddy and pulse foliage for blight, aphid infestations, and fungal rust.');
  }

  return {
    advisory: advisories.join(' '),
    risk: riskLevel,
  };
};

/**
 * @desc    Fetch real live weather by city/location
 * @route   GET /api/weather
 * @access  Public
 */
const getWeatherByCity = async (req, res) => {
  try {
    const city = req.query.city ? req.query.city.trim() : 'Ludhiana';

    if (!city) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide a city name or agricultural region.',
      });
    }

    // Check if OpenWeatherMap key is provided in server environment variables
    const openWeatherApiKey = process.env.OPENWEATHER_API_KEY;

    if (openWeatherApiKey && openWeatherApiKey !== 'your_openweather_api_key_here') {
      try {
        const owmUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${openWeatherApiKey}`;
        const owmRes = await fetch(owmUrl);
        if (owmRes.ok) {
          const data = await owmRes.json();
          const temp = Math.round(data.main.temp * 10) / 10;
          const humidity = data.main.humidity;
          const windSpeed = Math.round(data.wind.speed * 3.6 * 10) / 10; // Convert m/s to km/h
          const condition = data.weather[0]?.main || 'Clear';
          const { advisory, risk } = generateFarmerAdvisory(temp, humidity, windSpeed, 0);

          return res.status(200).json({
            status: 'success',
            data: {
              source: 'OpenWeatherMap',
              city: `${data.name}, ${data.sys.country}`,
              temperature: temp,
              humidity,
              windSpeed,
              condition: data.weather[0]?.description || condition,
              advisory,
              risk,
              timestamp: new Date().toISOString(),
            },
          });
        }
      } catch (owmErr) {
        console.warn('[Weather Controller] OpenWeatherMap fallback to Open-Meteo:', owmErr.message);
      }
    }

    // Default High-Accuracy Provider: Open-Meteo Geocoding + WMO API
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
    const geoRes = await fetch(geoUrl);

    if (!geoRes.ok) {
      return res.status(502).json({
        status: 'error',
        message: 'Weather service is temporarily unavailable. Please retry in a moment.',
      });
    }

    const geoData = await geoRes.json();
    if (!geoData.results || geoData.results.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: `Could not find weather data for "${city}". Please check location spelling.`,
      });
    }

    const targetLocation = geoData.results[0];
    const { latitude, longitude, name, admin1, country } = targetLocation;

    // Query live forecast
    const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`;
    const forecastRes = await fetch(forecastUrl);

    if (!forecastRes.ok) {
      return res.status(502).json({
        status: 'error',
        message: 'Unable to retrieve meteorological sensor forecast from provider.',
      });
    }

    const forecastData = await forecastRes.json();
    const current = forecastData.current;

    const weatherCode = current.weather_code ?? 0;
    const wmoInfo = WMO_CODE_MAP[weatherCode] || { condition: 'Partly Cloudy', risk: 'Low' };

    const temp = Math.round(current.temperature_2m * 10) / 10;
    const humidity = current.relative_humidity_2m;
    const windSpeed = Math.round(current.wind_speed_10m * 10) / 10;

    const { advisory, risk } = generateFarmerAdvisory(temp, humidity, windSpeed, weatherCode);

    const locationLabel = [name, admin1, country].filter(Boolean).join(', ');

    return res.status(200).json({
      status: 'success',
      data: {
        source: 'Live Meteorological Station',
        city: locationLabel,
        temperature: temp,
        humidity,
        windSpeed,
        condition: wmoInfo.condition,
        weatherCode,
        advisory,
        risk: risk || wmoInfo.risk,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('[Weather Controller] Weather Error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Server error occurred while fetching weather advisory.',
    });
  }
};

module.exports = {
  getWeatherByCity,
};
