import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/Auth/login';
import SignUpPage from './components/Auth/signup';
import HomePage from './components/General/home';

function App() {
  return (
    <Router>
      <Routes>
        {/* Default route: redirect to login or you can choose */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/home" element={<HomePage />} />

        {/* You can add more routes later, e.g. a home/dashboard route */}
        {/* <Route path="/home" element={<Home />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
