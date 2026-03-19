HRMS Lite is a full-stack web application designed to simplify employee management and attendance tracking. It provides a clean interface for managing employee records, marking attendance, and viewing real-time insights through a dashboard.

🚀 Overview

This project helps organizations:

Manage employee data efficiently

Track daily attendance

View real-time workforce statistics

It’s built with modern web technologies and follows a clean, scalable structure.

🛠️ Tech Stack

Frontend

React 18 + TypeScript

Vite (fast build tool)

Tailwind CSS (modern UI styling)

Backend

Node.js

Express.js

Database

MongoDB Atlas (cloud-based) or local MongoDB

📂 Project Structure

The project is divided into two main parts:

Backend

Handles APIs, database, and business logic:

Employee and attendance models

REST APIs for CRUD operations

Dashboard analytics

Frontend

Handles UI and user interactions:

Dashboard view

Employee management pages

Attendance tracking interface

⚙️ How to Run the Project
1. Database Setup (MongoDB Atlas)

Create a free cluster on MongoDB Atlas

Create a database user

Allow network access

Copy your connection string

2. Backend Setup
cd backend
npm install
npm run dev

Make sure to configure your .env file with your MongoDB connection string.

3. Frontend Setup
cd frontend
npm install
npm run dev

Open:
👉 http://localhost:5173

🔌 API Highlights

GET /api/employees → Fetch all employees

POST /api/employees → Add a new employee

DELETE /api/employees/:id → Remove employee

POST /api/attendance → Mark attendance

GET /api/dashboard → Get summary stats

✨ Key Features

Employee Management
Add, view, search, and delete employees

Attendance Tracking
Mark employees as Present or Absent daily

Dashboard Insights
View total employees, attendance stats, and department distribution

Date Filtering
Analyze attendance over a custom date range

Modern UI
Clean, responsive dark-themed interface

Cloud Database
Uses MongoDB Atlas for easy deployment and scalability

💡 What I Learned

Building a full-stack application from scratch

Designing RESTful APIs using Express.js

Managing state and API calls in React

Working with MongoDB and cloud databases

Structuring scalable projects

