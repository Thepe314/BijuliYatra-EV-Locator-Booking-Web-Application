// src/components/Guest/HomePage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate()
  const handlelogin=(e)=>
  {
    e.preventDefault()
    navigate("/login")
    
  }

    const handleSignup=(e)=>
  {
    e.preventDefault()
    navigate("/signup")
    
  }


  return (
    <div>
      <h1>Welcome to the Home Page</h1>

      <button onClick={handlelogin}>login</button>
      <button onClick={handleSignup}>Signup</button>
    </div>

    

  );
};

export default Home;
