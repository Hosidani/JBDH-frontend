# JBDH Web Frontend

**Job Database Handler** - A modern React-based web application for managing job postings, comments, and CV analysis. Built for professional business use with a focus on clean design and user experience.

## 🚀 Project Overview

JBDH Web Frontend is a comprehensive React application that serves as the user interface for the Job Database Handler system. It provides functionality for:

- **Post Management**: Create, view, and delete job-related posts
- **Comment System**: Threaded comments and replies on posts
- **CV Analysis**: AI-powered CV to job advertisement comparison
- **Professional UI**: Business-ready design with brand consistency

## 🏗️ Architecture & Design Decisions

### Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite (chosen for fast development and modern build optimizations)
- **Styling**: Custom CSS with professional design system
- **State Management**: React hooks (useState, useEffect)
- **API Communication**: Fetch API with TypeScript interfaces
- **Backend Integration**: RESTful API (.NET backend on localhost:5071)

### Folder Structure Philosophy

```
src/
├── components/           # Reusable UI components organized by feature
│   ├── DataFlow/        # Post and comment components
│   ├── Forms/           # Form components (create post, etc.)
│   └── Features/        # Complex feature components (CV analysis)
├── pages/               # Route-level components
│   └── Home/           # Home page related components
├── services/            # API communication layer
├── types/              # TypeScript type definitions
└── App.tsx             # Main application component
```

**Design Rationale**:
- **Feature-based organization**: Components grouped by business functionality rather than technical type
- **Separation of concerns**: Clear distinction between reusable components and page-specific logic
- **Scalability**: Structure supports easy addition of new features and pages
- **Maintainability**: Related files are co-located for easier development

## 🎨 Design System

### Color Palette

The JBDH brand uses a professional color scheme designed for business applications:

```css
/* Primary Colors */
Primary Blue: #2563eb    /* Main brand color - buttons, headers, links */
Secondary Green: #10b981 /* Success states, positive actions */
Warning Orange: #f59e0b  /* Alerts, warnings, important notices */

/* Neutral Colors */
Dark Gray: #1f2937       /* Primary text, headings */
Medium Gray: #6b7280     /* Secondary text, labels */
Light Gray: #f3f4f6      /* Backgrounds, borders */
White: #ffffff           /* Cards, content backgrounds */

/* Background */
Gradient: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)
```

**Color Usage Guidelines**:
- **Primary Blue**: Headers, primary buttons, links, focus states
- **Secondary Green**: Success messages, positive confirmations
- **Warning Orange**: Alerts, character counters, important notices
- **Neutral Grays**: Text hierarchy and UI structure

### Typography

- **Font Family**: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto'
- **Heading Weights**: 600-700 for strong hierarchy
- **Body Weight**: 400-500 for readability
- **Line Height**: 1.6 for comfortable reading

### Card System

Professional card-based layout with:
- **Rounded corners**: 12px border-radius for modern feel
- **Subtle shadows**: Layered box-shadows for depth
- **Hover effects**: Gentle lift animation on interaction
- **Consistent spacing**: Standardized padding and margins

## 🔧 Development Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- .NET backend running on localhost:5071

### Installation

```bash
# Clone the repository
git clone [repository-url]
cd JBDH-frontend/myapp-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 🔌 API Integration

### Backend Communication

The application communicates with a .NET backend API using:

- **Base URL**: `http://localhost:5071/api`
- **Authentication**: Credential-based with `credentials: 'include'`
- **Content Type**: `application/json`
- **Error Handling**: Comprehensive error catching and user feedback

### API Endpoints

```typescript
GET  /api/home              # Fetch all posts
POST /api/dataflow          # Create new post
DELETE /api/dataflow/{id}   # Delete post
POST /api/dataflow/{id}/comments  # Add comment
POST /api/dataflow/{id}/reports   # Report post
POST /api/cv-comparison     # CV analysis
```

### Type Safety

All API responses are typed using TypeScript interfaces:

```typescript
interface DataFlowViewModel {
  id: number;
  content: string;
  ownerName: string;
  createdAt: string;
  comments: CommentViewModel[];
  reportsCount: number;
}
```

## 🧪 Testing Strategy

### Current Testing Setup
- TypeScript compilation ensures type safety
- ESLint for code quality and consistency
- Vite's built-in HMR for fast development iteration

### Recommended Future Testing
- Jest + React Testing Library for unit tests
- Cypress for end-to-end testing
- Storybook for component documentation

## 🚀 Deployment Considerations

### Production Build
```bash
npm run build
```
Generates optimized static files in `dist/` directory.

### Environment Configuration
- API base URL should be configurable for different environments
- Consider using environment variables for backend URLs

### Performance Optimizations
- Vite provides automatic code splitting
- React components are optimized for re-rendering
- Images and assets are optimized during build

## 🔒 Security Considerations

- **CORS**: Configured for localhost development
- **Credentials**: Secure cookie-based authentication
- **Input Validation**: Form validation on frontend and backend
- **XSS Protection**: React's built-in XSS protection

## 📈 Future Roadmap

### Phase 1: Core Features ✅
- [x] Post creation and management
- [x] Comment system
- [x] CV analysis tool
- [x] Professional UI design

### Phase 2: Enhancements
- [ ] User authentication and profiles
- [ ] Advanced search and filtering
- [ ] Real-time notifications
- [ ] Mobile responsiveness optimization

### Phase 3: Advanced Features
- [ ] Advanced CV parsing
- [ ] Job matching algorithms
- [ ] Analytics dashboard
- [ ] Multi-language support

## 🤝 Contributing

### Code Style Guidelines
- Use TypeScript for all new components
- Follow the established folder structure
- Maintain consistent naming conventions
- Use the established color system
- Write self-documenting code with clear variable names

### Component Development
1. Create components in appropriate feature folders
2. Export from index files for clean imports
3. Use TypeScript interfaces for all props
4. Follow the card-based design system
5. Implement proper error handling

## 📞 Support

For technical questions or support:
- Review the component documentation in `/src/components`
- Check the TypeScript interfaces in `/src/types`
- Verify API integration in `/src/services`

---
 
**Built with ❤️ for professional job management**
