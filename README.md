#  Exam Study Planner

> A comprehensive full-stack study planner application designed specifically for  exam preparation including UPSC, SSC, Banking, Railways, and other competitive exams.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue.svg)](https://www.typescriptlang.org/)

## 🎯 Overview

The  Exam Study Planner is a modern, feature-rich application that helps students systematically prepare for competitive  exams. It combines intelligent study planning, progress tracking, resource management, and collaborative features in one comprehensive platform.

### 🌟 Key Features

- **📚 Study Management** - Books, daily goals, monthly plans, and study sessions
- **📊 Progress Analytics** - Advanced insights and performance metrics
- **🗞️ Current Affairs** - Newspaper analysis and UPSC resources
- **👥 Study Groups** - Collaborative learning communities
- **🔐 Secure & Scalable** - JWT authentication, modern tech stack

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (local or cloud)
- npm/yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/6686510/exam-prep.git
cd -exam-planner

# Install dependencies
npm run install-all

# Configure environment
cp .env.sample .env
# Edit .env with your settings

# Start development servers
npm run dev
```

Visit `http://localhost:5173` to access the application.

## 📖 Documentation

Comprehensive documentation is available in the `/docs` directory:

- **[📘 Complete Documentation](docs/README.md)** - Full feature overview and architecture
- **[🛠️ Setup Guide](docs/SETUP.md)** - Detailed installation and configuration
- **[📡 API Documentation](docs/API.md)** - Complete API reference
- **[🤝 Contributing Guide](docs/CONTRIBUTING.md)** - How to contribute to the project

## 🏗️ Technology Stack

### Backend
- **Node.js** + **Express.js** - Server framework
- **MongoDB** + **Mongoose** - Database and ODM
- **JWT** - Authentication
- **Helmet** + **CORS** - Security

### Frontend
- **React 18** + **TypeScript** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** + **shadcn/ui** - Styling
- **Redux Toolkit** - State management
- **React Query** - Data fetching

## 🎯 Features Overview

### Study Management
- **Book Tracker** - Manage reading materials with progress tracking
- **Daily Goals** - Create and track daily study tasks
- **Monthly Plans** - Set and monitor monthly targets
- **Study Sessions** - Time tracking with effectiveness ratings

### Analytics & Progress
- **Dashboard** - Visual insights into study patterns
- **Progress Metrics** - Completion rates and streaks
- **Performance Analytics** - Study effectiveness tracking

### Resources & Updates
- **Syllabus Tracker** - Comprehensive coverage monitoring
- **Newspaper Analysis** - Structured current affairs tracking
- **UPSC Resources** - Curated study materials

### Collaboration
- **Study Groups** - Create and join study communities
- **Group Permissions** - Role-based access control
- **Shared Resources** - Collaborative learning

## 🚢 Deployment

### Development
```bash
npm run dev  # Start both frontend and backend
```

### Production
```bash
npm run build    # Build frontend
npm start        # Start production server
```

### Docker (Optional)
```bash
docker-compose up -d
```

## 🧪 API  Testing 

The API is available at `http://localhost:5000/api` with the following main endpoints:

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/books` - Get user books
- `GET /api/goals/daily` - Get daily goals
- `GET /api/health` - Health check

See [API Documentation](docs/API.md) for complete endpoint details.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](docs/CONTRIBUTING.md) for details on:

- Setting up the development environment
- Code style and conventions
- Pull request process
- Reporting bugs and requesting features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Lucide](https://lucide.dev/) for icons
- [TanStack Query](https://tanstack.com/query) for data management
- All contributors and the open-source community

## 📞 Support

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/6686510/exam-prep/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/6686510/exam-prep/discussions)
- 📧 **Email**: support@examplanner.com

---

<div align="center">
  <strong>Made with ❤️ for exam aspirants across India</strong>
</div>
