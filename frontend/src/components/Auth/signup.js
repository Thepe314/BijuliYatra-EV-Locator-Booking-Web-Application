 import React, { useState } from 'react';
 
 const Signup = () => {
     const[formData,seFormData]= useState({
            fullname:"",
            email:"",
            password:"",
            phoneNumber:"",
            address:"",
            role:"user",
            vehicleBrand:"",
            vehicleModel:"",
            vechicleRegistrationNumber:"",
            chargingType:"",
            status:"Active"
        });

    const [errors, setErrors] = useState({
            fullname:"",
            email:"",
            password:"",
            phoneNumber:"",
            address:"",
            role:"user",
            vehicleBrand:"",
            vehicleModel:"",
            vechicleRegistrationNumber:"",
            chargingType:"",
            status:"Active"
  });
    
        const submiSignup = () =>{
    
             e.preventDefault();

    // Mark all fields as touched to show validation errors
    const allTouched = {};
    Object.keys(formData).forEach((key) => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    if (validateForm()) {
      setIsSubmitting(true);
      setApiError("");

      try {
        // Prepare data for API (excluding confirmPassword)
        const userData = {
        fullname: formData.firstName + " " + formData.lastName,
        email: formData.email,
        phoneNumber: formData.mobile,
        password: formData.password,
        role: "attendee",
        status:"Active"
        };

        // Call the signup API
        // const response = await authService.signup(userData);

        console.log("Signup successful:", response);

        // Success animation before alert/navigation
        // await new Promise((resolve) => setTimeout(resolve, 300));

        // Show success message and redirect to login
        alert("Signup successful! Please login to continue.");
        navigate("/login");
      } catch (error) {
        console.error("Signup failed:", error);

        // Handle specific error responses
        if (error.response) {
          if (error.response.status === 409) {
            setApiError("An account with this email already exists.");
          } else if (error.response.data && error.response.data.message) {
            setApiError(error.response.data.message);
          } else {
            setApiError("Signup failed. Please try again later.");
          }
        } else {
          setApiError(
            "Unable to connect to the server. Please try again later."
          );
        }
      } finally {
        setIsSubmitting(false);
      }
    }
        };
   return (
     <div>
       <h1>Welcome to the Signup Page</h1>
       <form onSubmit={submiSignup}>
        <div class="mb-3">
            <label for="fullname" class="form-label">Full Name:</label>
            <input
                type="text"
                name=""
                id=""
                class="form-control"
                placeholder=""
                aria-describedby="helpId"
            />
             <label for="fullname" class="form-label">Email:</label>
            <input
                type="email"
                name=""
                id=""
                class="form-control"
                placeholder=""
                aria-describedby="helpId"
            />
             <label for="fullname" class="form-label">Password:</label>
            <input
                type="password"
                name=""
                id=""
                class="form-control"
                placeholder=""
                aria-describedby="helpId"
            />

             <label for="fullname" class="form-label">Phone Number:</label>
            <input
                type="text"
                name=""
                id=""
                class="form-control"
                placeholder=""
                aria-describedby="helpId"
            />

             <label for="fullname" class="form-label">Address:</label>
            <input
                type="text"
                name=""
                id=""
                class="form-control"
                placeholder=""
                aria-describedby="helpId"
            />
        </div>
      
      <button style={{}}>Signup</button>


       </form>
       
     </div>
   );
 };
 
 export default Signup;
 