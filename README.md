
# BijuliYatra
This project is a Ev charging Locator and Booking Web Application

#Setting up a project
Make separate folders for frontend and backend

#For frontend
-cd frontend first
-then "npx create-react-app my-app"
-then npm start

#For backend
-Xamp installed and mysql turned on
-import the backend folder to any IDE with the dependencies needed
-Create a security config file to allow access between backend and frontend (CORS Origin)
-Application properities should have the jdbc drivers.
-Integrate jwt config into backend

=======
About
BijuliYatra is a full-stack EV charging station locator and booking platform for Nepal. Locate nearby stations, reserve slots, and pay securely with local gateways (eSewa, Khalti, Stripe).

🚀 Features
🔍 Real-time EV station locator (Google Maps)

📱 Station booking & reservation system

💳 Multi-payment (Stripe + eSewa + Khalti)

📧 OTP verification & email notifications

🛡️ JWT authentication

📊 Admin dashboard

☁️ Dockerized (AWS-ready)

🛠 Tech Stack
text
FRONTEND:     React 18 + Tailwind CSS + nginx SPA
BACKEND:      Java 17 + Spring Boot 3 + Spring Security (JWT)
PAYMENTS:     Node.js 20 + Express (Stripe/eSewa/Khalti proxy)
DATABASE:     MySQL 8
INFRA:        Docker Compose + AWS
EMAIL:        Mailtrap + Gmail SMTP

