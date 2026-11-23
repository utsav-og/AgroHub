import React, { useState, useEffect } from 'react';
import {
  CloudSun,
  Wind,
  Droplets,
  Sun,
  Search,
  AlertTriangle,
  MapPin,
  RefreshCw,
  AlertCircle,
  CloudRain,
  Cloud,
  CheckCircle2,
} from 'lucide-react';
import { getWeatherApi } from '../services/api';

function Weather() {
  const [cityInput, setCityInput] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const popularRegions = ['Ludhiana', 'Karnal', 'Meerut', 'Patiala', 'Nagpur', 'Amritsar', 'Pune', 'Indore'];

  useEffect(() => {
    fetchWeather('Ludhiana');
  }, []);

  const fetchWeather = async (cityName) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getWeatherApi(cityName);
      setWeatherData(res.data);
    } catch (err) {
      setError(
        err.response?.data?.message || `Unable to fetch weather forecast for "${cityName}". Please verify the location spelling.`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (cityInput.trim()) {
      fetchWeather(cityInput.trim());
    }
  };

  const getWeatherIcon = (condition = '') => {
    const lower = condition.toLowerCase();
    if (lower.includes('rain') || lower.includes('drizzle')) return <CloudRain size={52} color="#2563eb" />;
    if (lower.includes('overcast') || lower.includes('cloud')) return <CloudSun size={52} color="#059669" />;
    return <Sun size={52} color="#eab308" />;
  };

  return (
    <div className="marketplace-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Real-Time Agricultural Weather & Advisory</h1>
          <p>Live satellite & meteorological station data with farm operation advisories for spraying, irrigation, and harvesting.</p>
        </div>
      </div>

      {/* City Search Bar */}
      <div className="category-filter-bar" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'stretch' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
          <div className="input-wrapper" style={{ flex: 1 }}>
            <MapPin size={18} className="input-icon" />
            <input
              type="text"
              placeholder="Search weather by any city or district (e.g. Ludhiana, Karnal, Jaipur, Meerut, Nashik)..."
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
          <button type="submit" className="btn-cta-primary" style={{ padding: '0.65rem 1.25rem', fontSize: '0.9rem' }} disabled={loading}>
            Get Weather
          </button>
        </form>

        {/* Quick Location Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1b4332' }}>Quick Agricultural Zones:</span>
          {popularRegions.map((region) => (
            <button
              key={region}
              className="pill-btn"
              onClick={() => {
                setCityInput(region);
                fetchWeather(region);
              }}
              style={{ fontSize: '0.8rem', padding: '0.25rem 0.65rem' }}
            >
              {region}
            </button>
          ))}
        </div>
      </div>

      {/* Loading & Error States */}
      {loading ? (
        <div className="loading-state">
          <RefreshCw size={28} className="spin" />
          <p>Querying meteorological stations...</p>
        </div>
      ) : error ? (
        <div className="alert alert-error" style={{ margin: '2rem 0' }}>
          <AlertCircle size={22} />
          <span>{error}</span>
          <button onClick={() => fetchWeather('Ludhiana')} className="btn-retry">
            Reset to Default
          </button>
        </div>
      ) : weatherData && (
        <div className="weather-dashboard-card" style={{ marginTop: '1.5rem' }}>
          <div className="weather-main-stat">
            <div className="weather-icon-badge">
              {getWeatherIcon(weatherData.condition)}
            </div>
            <div>
              <span className="weather-temp">{weatherData.temperature}°C</span>
              <span className="weather-condition">
                {weatherData.condition} &bull; <strong>{weatherData.city}</strong>
              </span>
              <small style={{ display: 'block', color: '#64748b', fontSize: '0.75rem', marginTop: '0.2rem' }}>
                Data Source: {weatherData.source} &bull; Updated: {new Date(weatherData.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </small>
            </div>
          </div>

          <div className="weather-metrics-grid">
            <div className="weather-metric-box">
              <Droplets size={24} color="#2563eb" />
              <div>
                <span className="metric-label">Relative Humidity</span>
                <strong style={{ fontSize: '1.15rem' }}>{weatherData.humidity}%</strong>
              </div>
            </div>

            <div className="weather-metric-box">
              <Wind size={24} color="#059669" />
              <div>
                <span className="metric-label">Wind Velocity</span>
                <strong style={{ fontSize: '1.15rem' }}>{weatherData.windSpeed} km/h</strong>
              </div>
            </div>

            <div className="weather-metric-box">
              <AlertTriangle size={24} color={weatherData.risk === 'Low' ? '#16a34a' : weatherData.risk === 'Medium' ? '#d97706' : '#dc2626'} />
              <div>
                <span className="metric-label">Agricultural Risk Level</span>
                <strong style={{ fontSize: '1.15rem', color: weatherData.risk === 'Low' ? '#16a34a' : weatherData.risk === 'Medium' ? '#d97706' : '#dc2626' }}>
                  {weatherData.risk} Risk
                </strong>
              </div>
            </div>
          </div>

          {/* Farmer Advisory Banner */}
          <div className="advisory-box">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <CheckCircle2 size={18} color="#1b4332" />
              <strong>Farmer Meteorological Guidance:</strong>
            </div>
            <p style={{ lineHeight: 1.6 }}>{weatherData.advisory}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Weather;
