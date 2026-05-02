# Project Structure

This document outlines the organized folder structure of the Fine Edu Sphere Link application.

## 📁 Directory Structure

```
src/
├── components/          # Reusable UI components
│   ├── layout/         # Layout and wrapper components
│   │   ├── BrandThemeProvider.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── UserNotRegisteredError.jsx
│   ├── forms/          # Form-related components
│   │   ├── attendance/
│   │   ├── fees/
│   │   └── store/
│   ├── charts/         # Data visualization components
│   │   ├── results/
│   │   └── tour/
│   ├── common/         # Common/shared components
│   │   ├── about/
│   │   ├── cms/
│   │   ├── notifications/
│   │   ├── onboarding/
│   │   ├── portal/
│   │   ├── public/
│   │   └── settings/
│   ├── ui/             # Base UI components (shadcn/ui)
│   └── index.js        # Component exports
├── pages/              # Application pages/routes
│   ├── admin/          # Admin-only pages (23 pages)
│   │   ├── AdminAdmissions.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── AdminFees.jsx
│   │   └── ... (20 more admin pages)
│   ├── parent/         # Parent-specific pages (7 pages)
│   │   ├── ParentDashboard.jsx
│   │   ├── ParentFees.jsx
│   │   └── ... (5 more parent pages)
│   ├── student/        # Student-specific pages (5 pages)
│   │   ├── StudentDashboard.jsx
│   │   ├── StudentResults.jsx
│   │   └── ... (3 more student pages)
│   ├── teacher/        # Teacher-specific pages (5 pages)
│   │   ├── TeacherDashboard.jsx
│   │   ├── TeacherClasses.jsx
│   │   └── ... (3 more teacher pages)
│   ├── proprietor/     # Proprietor-specific pages (7 pages)
│   │   ├── ProprietorDashboard.jsx
│   │   ├── ProprietorFinance.jsx
│   │   └── ... (5 more proprietor pages)
│   ├── public/         # Publicly accessible pages (10 pages)
│   │   ├── Home.jsx
│   │   ├── About.jsx
│   │   ├── Contact.jsx
│   │   └── ... (7 more public pages)
│   ├── auth/           # Authentication pages (2 pages)
│   │   ├── PortalLogin.jsx
│   │   └── PendingApproval.jsx
│   └── config.js       # Page routing configuration
├── services/           # API services and data fetching
│   └── api/            # API endpoint definitions
├── lib/                # Utility libraries
│   └── utils/          # Helper functions
├── hoc/                # Higher-order components
│   └── hooks/          # Custom hooks
├── constants/          # Application constants
├── types/              # TypeScript type definitions
├── App.jsx             # Main application component
├── Layout.jsx          # Application layout wrapper
├── main.jsx            # Application entry point
└── styles/             # CSS and styling files
    ├── globals.css
    └── index.css
```

## 🎯 Organization Principles

### 1. **Role-Based Page Organization**
- Pages are organized by user roles (admin, parent, student, teacher, proprietor)
- Each role has its own dedicated folder
- Public pages are accessible to all users
- Auth pages handle authentication flows

### 2. **Component Categorization**
- **Layout**: Structural components that wrap other components
- **Forms**: Form-specific components organized by domain
- **Charts**: Data visualization and reporting components
- **Common**: Shared components used across multiple features
- **UI**: Base UI components from component libraries

### 3. **Separation of Concerns**
- **Services**: API calls and data fetching logic
- **Lib/Utils**: Pure utility functions
- **HOC/Hooks**: Reusable component logic
- **Constants**: Application-wide constants
- **Types**: TypeScript type definitions

## 📝 Import Patterns

### Pages
```javascript
// Import specific pages
import { AdminDashboard } from './pages/admin';
import { ParentDashboard } from './pages/parent';

// Import all pages from a role
import * as AdminPages from './pages/admin';
import * as ParentPages from './pages/parent';
```

### Components
```javascript
// Import specific components
import { BrandThemeProvider, ProtectedRoute } from './components/layout';
import { Button, Input } from './components/ui';

// Import from main index
import { BrandThemeProvider, Button, Input } from './components';
```

## 🔄 Migration Notes

The project has been reorganized from a flat structure to a hierarchical structure:

### Before
```
src/pages/
├── AdminDashboard.jsx
├── ParentDashboard.jsx
├── StudentDashboard.jsx
├── TeacherDashboard.jsx
├── ProprietorDashboard.jsx
├── Home.jsx
├── About.jsx
└── ... (60+ more files)
```

### After
```
src/pages/
├── admin/AdminDashboard.jsx
├── parent/ParentDashboard.jsx
├── student/StudentDashboard.jsx
├── teacher/TeacherDashboard.jsx
├── proprietor/ProprietorDashboard.jsx
├── public/Home.jsx
├── public/About.jsx
└── ... (organized in role folders)
```

## 🚀 Benefits

1. **Scalability**: Easy to add new pages for each role
2. **Maintainability**: Clear separation of concerns
3. **Developer Experience**: Intuitive file organization
4. **Code Navigation**: Quick location of relevant files
5. **Team Collaboration**: Clear ownership of role-specific features

## 📋 File Count Summary

- **Admin Pages**: 23 files
- **Parent Pages**: 7 files
- **Student Pages**: 5 files
- **Teacher Pages**: 5 files
- **Proprietor Pages**: 7 files
- **Public Pages**: 10 files
- **Auth Pages**: 2 files
- **Total Pages**: 59 files

## 🛠 Development Guidelines

1. **Follow the established folder structure** when adding new files
2. **Use index files** for clean imports
3. **Keep components focused** on single responsibilities
4. **Organize by feature/domain**, not by file type
5. **Use descriptive naming** conventions consistent with existing patterns
