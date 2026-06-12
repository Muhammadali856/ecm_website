// src/pages/LoginPage.js
import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function LoginPage({ setUser }) {
  // State to toggle between Login and Sign Up
  const [isSignUp, setIsSignUp] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleStandardAuth = (e) => {
    e.preventDefault();
    setError('');

    const url = isSignUp
      ? 'http://127.0.0.1:8000/api/register/'
      : 'http://127.0.0.1:8000/api/standard-login/';
    const payload = isSignUp
      ? { first_name: name, email, password }
      : { email, password };

    axios.post(url, payload)
      .then(response => {
        localStorage.setItem('token', response.data.access);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setUser(response.data.user);

        if (response.data.user.is_staff) {
          navigate('/owner');
        } else {
          navigate('/');
        }
      })
      .catch(err => {
        console.error("Auth failed", err);
        setError(err.response?.data?.error || "Authentication failed. Please try again.");
      });
  };

  const handleGoogleSuccess = (credentialResponse) => {
    axios.post('http://127.0.0.1:8000/api/google-login/', {
      token: credentialResponse.credential
    })
    .then(response => {
      localStorage.setItem('token', response.data.access);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setUser(response.data.user);

      if (response.data.user.is_staff) {
        navigate('/owner');
      } else {
        navigate('/');
      }
    })
    .catch(error => {
      console.error("Google auth failed", error);
      setError('Failed to log in with Google on the server.');
    });
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="auth-card__header">
          <h2 className="auth-card__title">
            {isSignUp ? "Create an Account" : "Welcome Back"}
          </h2>
          <p className="auth-card__subtitle">
            {isSignUp
              ? "Sign up to access your cart and orders."
              : "Log in to access your cart and orders."}
          </p>
        </div>

        {/* Standard Login / Sign Up Form */}
        <form onSubmit={handleStandardAuth} className="auth-form">

          {/* Only shown during Sign Up */}
          {isSignUp && (
            <div className="form-group">
              <label className="form-label">First Name:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="form-input"
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="form-input"
            />
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="btn-primary btn-full-width">
            {isSignUp ? "Sign Up" : "Log In"}
          </button>
        </form>

        {/* Toggle between Login and Sign Up */}
        <button
          onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
          className="auth-toggle-btn"
        >
          {isSignUp
            ? "Already have an account? Log in."
            : "Don't have an account? Sign up."}
        </button>

        <div className="auth-divider">
          <span className="auth-divider__line" />
          <span className="auth-divider__label">or continue with</span>
          <span className="auth-divider__line" />
        </div>

        <div className="auth-google-row">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => { setError('Google Login popup failed to open'); }}
          />
        </div>

      </div>
    </div>
  );
}

export default LoginPage;