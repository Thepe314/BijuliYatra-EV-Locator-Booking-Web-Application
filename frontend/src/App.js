import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import LoginPage from "./components/Auth/login";
import SignUpPage from "./components/Auth/signup";
import HomePage from "./components/User/StationFinderPage.js";
import AdminDashboard from "./components/Admin/Dashboard.js";
import ChargingStationsMap from "./components/General/ChargingStationsMap.js";
import BookingPage from "./components/Booking/BookingPage.js";
import UserProfile from "./components/General/UserProfile.js";
import StationDetailsPage from "./components/General/StationDetailsPage.js";
import PaymentPage from "./components/General/PaymentPage.js";
import StationManagement from "./components/Admin/StationManagement.js";
import UserManagement from "./components/Admin/UserManage.js";
import AdminAnalytics from "./components/Admin/AdminAnalytics.js";
import { UserSessionProvider } from "./components/Context/UserSessionContext.js";
import ChargingOperatorSignUp from "./components/Auth/ChargingOperatorSignUp.js";
import EVUserDashboard from "./components/User/UserDashboard.js";
import OperatorDashboard from "./components/ChargeOperators/OperatorDashboard.js";
import AddStationPage from "./components/ChargeOperators/AddStation.js";
import EditUserPage from "./components/Admin/EditUsers.js";
import AddStationAdmin from "./components/Admin/AddStationAdmin.js";
import StationFinderPage from "./components/User/StationFinderPage.js";
import BookingManagement from "./components/Admin/BookingManagement.js";
import EditStationPage from "./components/Admin/EditStationPage.js";

function App() {
  return (
    <UserSessionProvider>
      <Router>
        {/* Global notifications */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          draggable
          theme="colored"
        />

        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />

          <Route path="/signup/operator" element={<ChargingOperatorSignUp />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/map" element={<ChargingStationsMap />} />
          <Route path="/book/station/:stationId" element={<BookingPage />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/stationdetails" element={<StationDetailsPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/admin/usermanagement" element={<UserManagement />} />
          <Route path="/admin/stationmanagement" element={<StationManagement />} />
          <Route path="/admin/bookingmanagement" element={<BookingManagement />} />
          <Route path="/analytics" element={<AdminAnalytics />} />

          {/* Admin */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/editUser/:userId" element={<EditUserPage />} />
          <Route path="/admin/editStation/:id" element={<EditStationPage />} />
          <Route path="/admin/addstation" element={<AddStationAdmin />} />

          {/* Operator */}
          <Route path="/operator/dashboard" element={<OperatorDashboard />} />
          <Route path="/operator/addstation" element={<AddStationPage />} />

          {/* EV owner */}
          <Route path="/ev-owner/dashboard" element={<EVUserDashboard />} />
          <Route path="/signup/ev-owner" element={<SignUpPage />} />
          <Route path="/ev-owner/station" element={<StationFinderPage />} />
        </Routes>
      </Router>
    </UserSessionProvider>
  );
}

export default App;
