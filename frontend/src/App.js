import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import Login from './login';
import DataPage from './data';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = (username, password) => {
    // For simplicity, we assume any username and password is correct
    if (username && password) {
      setIsAuthenticated(true);
    }
  };

  return (
    <Router>
      <div>
        <Routes>
          {/* Login route */}
          <Route path="/" element={<Login onLogin={handleLogin} />} />
          
          {/* Data page route (only accessible after login) */}
          <Route
            path="/data"
            element={isAuthenticated ? <DataPage /> : <Navigate to="/" />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
