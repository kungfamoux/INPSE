# International Nursery and Primary School Enugu

A comprehensive school management system designed for Nigerian schools, featuring role-based portals for administrators, teachers, parents, and accountants.

## 🏫 Project Overview

International Nursery and Primary School Enugu (INPSE) is a modern web-based school management system that streamlines administrative tasks, enhances communication between stakeholders, and provides real-time insights into school operations.

## 🎯 Key Features

### 🌐 Landing Website
- School information and facilities showcase
- Online admission applications
- Fee structure information
- Contact and inquiry forms

### 👨‍👩‍👧‍👦 Parent Portal
- Child progress tracking
- Online fee payments (Paystack/Flutterwave)
- Attendance monitoring
- Communication with teachers
- Academic results viewing

### 🎓 Admin Dashboard
- Student management
- Staff administration
- Academic records management
- Fee structure setup
- Financial reporting
- Communication tools

### 👨‍🏫 Teacher Portal
- Class management
- Attendance marking
- Score uploads
- Homework assignments
- Parent messaging

### 💰 Accountant Portal
- Payment processing
- Receipt generation
- Debt tracking
- Expense management
- Financial reporting

## 🏗️ Architecture

### Frontend (React + Vercel)
- **Technology**: React 18, Vite, Tailwind CSS
- **UI Components**: Shadcn/ui, Radix UI, Lucide Icons
- **State Management**: TanStack Query, React Context
- **Deployment**: Vercel Pro ($20/month)

### Backend (Node.js + Render)
- **Technology**: Express.js, Node.js
- **Security**: Helmet.js, CORS, Rate Limiting
- **API**: RESTful endpoints
- **Deployment**: Render ($7/month)

### Database (Supabase)
- **Technology**: PostgreSQL
- **Features**: Real-time API, Authentication, File Storage
- **Deployment**: Supabase Pro ($5-15/month)

## 📁 Project Structure

```
fine-edu-sphere-link/
├── frontend/                    # React application
│   ├── src/
│   │   ├── pages/               # Role-based pages
│   │   │   ├── website/         # Public website
│   │   │   ├── parent/          # Parent portal
│   │   │   ├── admin/           # Admin dashboard
│   │   │   ├── teacher/         # Teacher portal
│   │   │   └── accountant/      # Accountant portal
│   │   ├── components/          # UI components
│   │   └── services/            # API services
│   ├── package.json
│   └── vite.config.js
├── backend/                     # Node.js API server
│   ├── server.js                # Express server
│   ├── package.json
│   └── README.md
└── README.md                    # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- Supabase account
- Vercel account (for frontend deployment)
- Render account (for backend deployment)

### Installation

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

#### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure your environment variables
npm run dev
```

### Environment Variables

#### Backend (.env)
```
PORT=3001
NODE_ENV=development
SUPABASE_URL=your-supabase-project-url
SUPABASE_SERVICE_KEY=your-supabase-service-key
JWT_SECRET=your-jwt-secret-key
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - User login

### Students
- `GET /api/students` - Get all students
- `POST /api/students` - Create student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student

### Classes
- `GET /api/classes` - Get all classes

### Staff
- `GET /api/staff` - Get all staff

### Fee Invoices
- `GET /api/fee-invoices` - Get all fee invoices

## 🎨 UI Components

The frontend uses Shadcn/ui components with:
- Modern, accessible design
- Tailwind CSS styling
- Dark mode support
- Responsive layouts

## 📱 User Roles & Permissions

### School Admin / Proprietor
- Full system access
- User management
- System configuration
- Financial oversight

### Teachers
- Class management
- Attendance marking
- Score uploads
- Homework assignments

### Parents
- Child progress viewing
- Fee payments
- Communication access
- Results access

### Accountants
- Payment processing
- Financial reporting
- Expense management
- Receipt generation

### Students (Optional)
- Homework viewing
- Results checking
- Attendance tracking

## 🇳🇬 Nigerian School Features

### Fee Structure
- Different fees for Creche, Nursery, Primary classes
- Common charges: PTA levy, Bus fee, Uniform, Books, Feeding
- Payment plans: Full term, Installment

### Academic System
- Nursery: Skills grading, behavior reports
- Primary: Subject-based scores, continuous assessment
- Term-based result management

### Payment Integration
- Paystack integration
- Flutterwave support
- Online receipt generation

## 🚀 Deployment

### Frontend (Vercel)
1. Connect GitHub repository to Vercel
2. Configure build settings
3. Set environment variables
4. Deploy!

### Backend (Render)
1. Connect GitHub repository to Render
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Add environment variables
5. Deploy!

### Database (Supabase)
1. Create new Supabase project
2. Set up database schema
3. Configure authentication
4. Set up storage buckets

## 💰 Costs

- **Vercel Pro**: $20/month
- **Render Starter**: $7/month
- **Supabase Pro**: $5-15/month
- **Total**: $32-42/month

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License

## 📞 Support

For support and questions:
- Email: support@fineedusphere.com
- Phone: +234 XXX XXX XXXX

---

Built with ❤️ for Nigerian schools
