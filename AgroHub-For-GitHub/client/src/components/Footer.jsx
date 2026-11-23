import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sprout, Phone, Mail, MapPin, Heart } from 'lucide-react';

function Footer() {
  const navigate = useNavigate();

  const handleSectionScroll = (e, sectionId) => {
    e.preventDefault();
    if (window.location.pathname === '/') {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        window.history.pushState(null, '', `/#${sectionId}`);
      }
    } else {
      navigate(`/#${sectionId}`);
    }
  };

  return (
    <footer className="footer-main">
      <div className="footer-content">
        {/* Column 1: Brand & About */}
        <div className="footer-col brand-col">
          <div className="footer-brand">
            <img src="/logo.png" alt="AgroHub Logo" className="footer-logo-img" />
            <h2>AgroHub</h2>
          </div>
          <p className="footer-description">
            A unified digital agriculture platform designed to empower local farmers, modernize crop trading, simplify machinery rental, and provide verified agricultural labor.
          </p>
          <div className="project-badge">
            Smart Digital Agriculture Platform
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div className="footer-col">
          <h3>Services</h3>
          <ul className="footer-links">
            <li><Link to="/marketplace">Crop Marketplace</Link></li>
            <li><Link to="/machinery">Machinery Rental</Link></li>
            <li><Link to="/workers">Agricultural Workers</Link></li>
            <li><Link to="/weather">Weather Advisory</Link></li>
            <li><Link to="/expenses">Expense Tracker</Link></li>
            <li><Link to="/inventory">Farm Inventory</Link></li>
            <li><Link to="/reports">Financial Reports</Link></li>
          </ul>
        </div>

        {/* Column 3: Platform & Portal */}
        <div className="footer-col">
          <h3>Account</h3>
          <ul className="footer-links">
            <li><Link to="/login">Farmer / Buyer Login</Link></li>
            <li><Link to="/register">Create an Account</Link></li>
            <li>
              <a href="/#about-section" onClick={(e) => handleSectionScroll(e, 'about-section')}>
                About the Platform
              </a>
            </li>
            <li>
              <a href="/#services-section" onClick={(e) => handleSectionScroll(e, 'services-section')}>
                How It Works
              </a>
            </li>
          </ul>
        </div>

        {/* Column 4: Contact & Support */}
        <div className="footer-col">
          <h3>Contact & Support</h3>
          <ul className="footer-contact-list">
            <li>
              <MapPin size={16} />
              <span>National Agricultural Operations Center</span>
            </li>
            <li>
              <Mail size={16} />
              <span>support@agrohub.com</span>
            </li>
            <li>
              <Phone size={16} />
              <span>+91 98765 43210</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} AgroHub Platform. All rights reserved. Empowering farmers and agricultural communities.</p>
        <p className="footer-subtext">Built with React, Express, and MongoDB</p>
      </div>
    </footer>
  );
}

export default Footer;
