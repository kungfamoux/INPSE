# Fine Edu Sphere Link Backend

Backend API server for the Fine Edu Sphere Link School Management System.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- Supabase project set up

### Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file with the following variables:

```
# Server Configuration
PORT=3001
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=your-supabase-project-url
SUPABASE_SERVICE_KEY=your-supabase-service-key

# JWT Secret (for authentication)
JWT_SECRET=your-jwt-secret-key
```

## 📡 API Endpoints

### Health Check
- `GET /health` - Server health status

### Students
- `GET /api/students` - Get all students
- `POST /api/students` - Create new student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student

### Classes
- `GET /api/classes` - Get all classes

### Staff
- `GET /api/staff` - Get all staff members

### Fee Invoices
- `GET /api/fee-invoices` - Get all fee invoices

### Authentication
- `POST /api/auth/login` - User login

## 🛠️ Development

### Running in Development
```bash
npm run dev
```

### Running in Production
```bash
npm start
```

## 📦 Deployment

This backend is designed to be deployed on Render.com.

### Render Deployment Steps:
1. Connect your GitHub repository
2. Create a new Web Service
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add environment variables
6. Deploy!

## 🔐 Security Features

- Helmet.js for security headers
- Rate limiting on API endpoints
- CORS configuration
- Input validation
- Error handling

## 📊 Database

Uses Supabase PostgreSQL database with the following tables:
- students
- classes
- staff
- fee_invoices
- users
- announcements

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License
