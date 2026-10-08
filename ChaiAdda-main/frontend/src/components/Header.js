import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header style={{ 
      background: '#d0cebf',
      boxShadow: '0 4px 18px rgba(48, 89, 75, 0.14)',
      borderBottom: 'none',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div className="container">
        <nav style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          padding: '1rem 0'
        }}>
          {/* Logo */}
          <Link 
            to="/" 
            style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#294f45',
              textDecoration: 'none',
              fontSize: '1.5rem',
              fontWeight: 'bold'
            }}
          >
            <span style={{ fontSize: '1.5rem' }}>☕</span>
            ChaiAdda
          </Link>

          {/* Desktop Navigation */}
          <div style={{ 
            display: window.innerWidth >= 768 ? 'flex' : 'none',
            alignItems: 'center', 
            gap: '2rem' 
          }}>
            {user ? (
              <>
                {/* User Info */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '1rem',
                  paddingLeft: '1rem',
                  borderLeft: 'none' 
                }}>
                  {/* User Avatar & Info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ 
                        fontSize: '0.875rem', 
                        fontWeight: '500',
                        color: '#29443d',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        justifyContent: 'flex-end'
                      }}>
                        {user.first_name} {user.last_name}
                        {user.is_admin && (
                          <span style={{
                            fontSize: '0.65rem',
                            fontWeight: '700',
                            padding: '0.2rem 0.5rem',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            borderRadius: '4px',
                            letterSpacing: '0.5px'
                          }}>
                            ADMIN
                          </span>
                        )}
                      </div>
                      <div style={{ 
                        fontSize: '0.75rem',
                        color: '#526d64' 
                      }}>
                        {user.university || 'University'}
                      </div>
                    </div>
                    
                    <div style={{ 
                      width: '36px',
                      height: '36px',
                      backgroundColor: '#b96d4b',
                      color: 'white',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '600',
                      fontSize: '1rem'
                    }}>
                      {user.first_name ? user.first_name.charAt(0).toUpperCase() : 'U'}
                    </div>

                    <button 
                      onClick={logout}
                      className="btn btn-outline"
                      style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                    >
                      Logout
                    </button>
                    {(user.is_admin || user.is_superuser) && (
                      <Link to="/create-event" className="btn btn-primary" style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>
                        Create Event
                      </Link>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Link to="/login" className="btn btn-secondary">
                    Login
                  </Link>
                  <Link to="/register" className="btn btn-primary">
                    Sign Up
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            style={{ 
              display: window.innerWidth < 768 ? 'flex' : 'none',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              border: 'none',
              background: 'transparent',
              fontSize: '1rem',
              cursor: 'pointer',
              color: '#31594e'
            }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? 'Close' : 'Menu'}
          </button>
        </nav>

        {/* Mobile Menu */}
        {isMenuOpen && window.innerWidth < 768 && (
          <div style={{ 
            borderTop: 'none',
            backgroundColor: '#d0cebf',
            padding: '1rem 0'
          }}>
            {user ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {(user.is_admin || user.is_superuser) && (
                  <Link to="/create-event" className="btn btn-primary" onClick={() => setIsMenuOpen(false)}>
                    Create Event
                  </Link>
                )}
                <div style={{ 
                  paddingBottom: '0.75rem',
                  marginBottom: '0.75rem',
                  borderBottom: 'none'
                }}>
                  <div style={{ 
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    {user.first_name} {user.last_name}
                    {user.is_admin && (
                      <span style={{
                        fontSize: '0.65rem',
                        fontWeight: '700',
                        padding: '0.2rem 0.5rem',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        borderRadius: '4px',
                        letterSpacing: '0.5px'
                      }}>
                        ADMIN
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#526d64' }}>{user.university || 'University'}</div>
                </div>
                
                <button
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  style={{
                    padding: '0.75rem',
                    color: '#31594e',
                    background: 'rgba(255, 255, 255, 0.45)',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ 
                  display: 'flex', 
                  gap: '0.75rem', 
                  paddingTop: '0.75rem',
                  borderTop: 'none'
                }}>
                  <Link 
                    to="/login" 
                    className="btn btn-secondary" 
                    style={{ flex: 1, textAlign: 'center' }}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    className="btn btn-primary" 
                    style={{ flex: 1, textAlign: 'center' }}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;