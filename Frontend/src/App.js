import logo from './logo.svg';
import './App.css';

import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';


// import other page components
import Home from './components/Guest/home';
import Login from './components/Auth/login';
import Signup from './components/Auth/signup';

function App() {
  return (
    <Router>
      <Routes>
        {/* default route: when URL is “/”, show Home */}
        <Route path="/" element={<Home/>} />

        {/* route for /home */}
        <Route path="/home" element={<Home />} />

        {/* other routes */}
        <Route path ="/login" element={<Login/>} />
        <Route path ="/signup" element={<Signup/>} />
      

        {/* catch-all: redirect unknown paths to /home or / */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
