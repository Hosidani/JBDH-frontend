# JBDH Web - Job Database Handler Frontend

A modern React + TypeScript web application for managing job applications, candidate evaluation, and CV analysis.

## 🚀 Features

- **Job Post Management**: Create, view, and manage job-related posts
- **Interactive Comments**: Reply and comment system with threading
- **CV Analysis Tool**: AI-powered CV to job advertisement matching
- **Professional UI**: Modern design with JBDH brand colors
- **Responsive Design**: Works on desktop and mobile devices

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Inline styles with professional color scheme
- **Backend Integration**: RESTful API communication

## 🎨 Design System

- **Primary Color**: #2563eb (Professional Blue)
- **Secondary Color**: #10b981 (Success Green)
- **Warning Color**: #f59e0b (Alert Orange)
- **Text Color**: #1f2937 (Dark Gray)

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── DataFlow/        # Post and comment components
│   ├── Features/        # Feature-specific components
│   └── Forms/           # Form components
├── pages/               # Page-level components
│   ├── Home/           # Home feature pages
│   └── PrivacyPage.tsx # Standalone pages
├── services/           # API service layer
├── types/              # TypeScript type definitions
└── App.tsx            # Main application component
```

## 🚀 Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Build for production**:
   ```bash
   npm run build
   ```

## 🔧 Backend Requirements

This frontend connects to a .NET backend API running on `http://localhost:5071`. Make sure your backend is running before starting the frontend.

## 📝 License

Private project for JBDH - Job Database Handler.

---

Built with ❤️ using React + TypeScript + Vite