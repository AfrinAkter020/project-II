import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer style={{ 
      background: '#d0cebf',
      borderTop: 'none',
      marginTop: 'auto'
    }}>
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold mb-4" style={{ color: '#386b60' }}>
              ☕ ChaiAdda
            </h3>
            <p className="text-gray-600">
              Your ChaiAdda account.
            </p>
          </div>

          {/* Account Links */}
          <div>
            <h4 className="font-semibold mb-4">Account</h4>
            <ul style={{ listStyle: 'none' }}>
              <li style={{ marginBottom: '0.5rem' }}>
                <Link to="/" className="text-gray-600" style={{ textDecoration: 'none' }}>
                  Account
                </Link>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <Link to="/login" className="text-gray-600" style={{ textDecoration: 'none' }}>
                  Login
                </Link>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <Link to="/register" className="text-gray-600" style={{ textDecoration: 'none' }}>
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <p className="text-gray-600 text-sm">
              Have questions or suggestions?<br />
              Reach out to us at <strong>support@campusadda.com</strong>
            </p>
          </div>
        </div>

        <div style={{ 
          borderTop: 'none', 
          marginTop: '2rem', 
          paddingTop: '1.5rem',
          textAlign: 'center'
        }}>
          <p className="text-sm text-gray-600">
            © 2026 ChaiAdda. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;