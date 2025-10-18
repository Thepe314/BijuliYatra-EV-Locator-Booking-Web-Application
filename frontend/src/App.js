import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/Auth/login';
import SignUpPage from './components/Auth/signup';
import HomePage from './components/General/HomePage.js';
import AdminDashboard from './components/Admin/Dashboard.js';
import ChargingStationsMap from './components/General/ChargingStationsMap.js';
import BookingPage from './components/Booking/BookingPage.js';
import UserProfile from './components/General/UserProfile.js';
import StationDetailsPage from './components/General/StationDetailsPage.js';
import PaymentPage from './components/General/PaymentPage.js';
import StationManagement from './components/Admin/StationManagement.js';
import UserManagement from './components/Admin/UserManage.js';
import AdminAnalytics from './components/Admin/AdminAnalytics.js';
import { UserSessionProvider } from './components/Context/UserSessionContext.js';
import ChargingOperatorSignUp from './components/Auth/ChargingOperatorSignUp.js';





function App() {
  return (
    <UserSessionProvider>
      
    <Router>
      <Routes>
        {/* Default route: redirect to login or you can choose */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/COsignup" element={<ChargingOperatorSignUp />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/map" element={<ChargingStationsMap />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/stationdetails" element={<StationDetailsPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/usermanagement" element={<UserManagement/>} />
        <Route path="/stationmangement" element={<StationManagement/>} />
        <Route path="/analytics" element={<AdminAnalytics/>} />

        {/* You can add more routes later, e.g. a home/dashboard route */}
        {/* <Route path="/home" element={<Home />} /> */}
      </Routes>
    </Router>
    </UserSessionProvider>
  );
}

export default App;
