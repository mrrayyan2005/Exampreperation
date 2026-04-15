Exampreperation

A modern full-stack study planner and productivity platform designed to help users organize learning, track progress, and stay consistent — all in one powerful monorepo.








🎯 Overview

Exampreperation is a scalable, feature-rich study management platform built using a monorepo architecture, combining frontend and backend into a unified codebase.

It is designed for any type of learning or exam preparation, helping users to:

Plan studies effectively
Track goals and progress
Analyze performance
Build consistency with structured workflows
🚀 Key Features
📅 Study & Goal Management
Daily goals tracking
Monthly planning system
Structured study sessions
Streak and consistency tracking
📊 Analytics & Insights
Progress dashboards
Performance analysis
Study efficiency tracking
Visual insights
📚 Learning Management
Book/resource tracking
Syllabus tracker
Topic-wise progress monitoring
⚡ Productivity System
Session-based tracking
Focus ratings
Habit-building system
🎨 UI/UX
Clean and modern design
Fully responsive
Optimized for long usage
🏗️ Monorepo Architecture
Exampreperation/
├── client/        # React + TypeScript frontend
├── server/        # Node.js + Express backend
├── shared/        # Shared utilities & types
├── docs/          # Documentation
🏗️ Tech Stack
Backend
Node.js
Express.js
MongoDB + Mongoose
JWT Authentication
Helmet + CORS
Frontend
React 18 + TypeScript
Vite
Tailwind CSS + shadcn/ui
Redux Toolkit
React Query
⚙️ Getting Started
Prerequisites
Node.js 18+
MongoDB
npm / yarn
Installation
git clone https://github.com/mrrayyan2005/exampreperation.git
cd Exampreperation

npm run install-all

cp .env.sample .env
# Configure environment variables

npm run dev

Visit: http://localhost:5173

🧪 API Overview

Base URL: http://localhost:5000/api

POST /auth/register → Register
POST /auth/login → Login
GET /goals → Goals
GET /progress → Analytics
GET /syllabus → Syllabus tracking
🚢 Deployment
npm run build
npm start
