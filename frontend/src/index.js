import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';
import App from './App';
import { GoogleOAuthProvider } from '@react-oauth/google';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* You will replace this fake ID with a real one from Google later */}
    <GoogleOAuthProvider clientId="906031648073-l5nsoumi9devha6r1uuqffv5oihnn05s.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);