# INPSE Backend API Documentation

## Overview

This is the complete API documentation for the International Nursery and Primary School Enugu (INPSE) School Management System backend.

**Base URL:** `https://inpse-backend-api.onrender.com/api`

**Authentication:** JWT Bearer Token (required for most endpoints)

---

## Authentication

### Login
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "admin@inpse.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@inpse.com",
    "first_name": "System",
    "last_name": "Administrator",
    "role": "admin",
    "is_active": true,
    "is_approved": true
  }
}
```

### Register User (Admin Only)
```http
POST /api/auth/register
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "email": "teacher@inpse.com",
  "password": "password123",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+2348000000000",
  "role": "teacher"
}
```

### Get Current User Profile
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Logout
```http
POST /api/auth/logout
Authorization: Bearer <token>
```

---

## Students Management

### Get All Students
```http
GET /api/students
Authorization: Bearer <token>
```

**Query Parameters:**
- `class_id` (optional): Filter by class
- `parent_id` (optional): Filter by parent (auto-applied for parent role)

**Response:**
```json
[
  {
    "id": 1,
    "admission_no": "2024/0001",
    "first_name": "Alice",
    "last_name": "Johnson",
    "date_of_birth": "2018-05-15",
    "gender": "female",
    "class_id": 1,
    "parent_id": 2,
    "classes": {
      "name": "Primary 1A",
      "level": "Primary 1"
    }
  }
]
```

### Create Student (Admin/Proprietor Only)
```http
POST /api/students
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "first_name": "Bob",
  "last_name": "Smith",
  "date_of_birth": "2017-03-20",
  "gender": "male",
  "class_id": 1,
  "parent_id": 2,
  "address": "123 School Road",
  "emergency_contact": "+2348000000001",
  "medical_conditions": "None"
}
```

### Update Student (Admin/Proprietor Only)
```http
PUT /api/students/:id
Authorization: Bearer <token>
```

### Delete Student (Admin/Proprietor Only)
```http
DELETE /api/students/:id
Authorization: Bearer <token>
```

### Get Student Attendance
```http
GET /api/students/:id/attendance
Authorization: Bearer <token>
```

### Get Student Results
```http
GET /api/students/:id/results
Authorization: Bearer <token>
```

---

## Academic Management

### Classes

#### Get All Classes
```http
GET /api/academics/classes
Authorization: Bearer <token>
```

#### Create Class (Admin/Proprietor Only)
```http
POST /api/academics/classes
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Primary 2A",
  "level": "Primary 2",
  "capacity": 30,
  "teacher_id": 5
}
```

#### Update Class (Admin/Proprietor Only)
```http
PUT /api/academics/classes/:id
Authorization: Bearer <token>
```

#### Delete Class (Admin/Proprietor Only)
```http
DELETE /api/academics/classes/:id
Authorization: Bearer <token>
```

### Subjects

#### Get All Subjects
```http
GET /api/academics/subjects
Authorization: Bearer <token>
```

#### Create Subject (Admin/Proprietor Only)
```http
POST /api/academics/subjects
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Mathematics",
  "code": "MATH"
}
```

### Sessions

#### Get All Sessions
```http
GET /api/academics/sessions
Authorization: Bearer <token>
```

#### Create Session (Admin/Proprietor Only)
```http
POST /api/academics/sessions
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "2024/2025",
  "start_date": "2024-09-01",
  "end_date": "2025-07-31"
}
```

### Terms

#### Get All Terms
```http
GET /api/academics/terms
Authorization: Bearer <token>
```

#### Create Term (Admin/Proprietor Only)
```http
POST /api/academics/terms
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "session_id": 1,
  "name": "First Term",
  "start_date": "2024-09-01",
  "end_date": "2024-12-15"
}
```

---

## Fee Management

### Fee Structures

#### Get All Fee Structures
```http
GET /api/fees/structures
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Primary 1 Fees",
    "class_level": "Primary 1",
    "tuition_fee": 25000,
    "pta_levy": 3000,
    "bus_fee": 3000,
    "uniform_fee": 7000,
    "books_fee": 5000,
    "feeding_fee": 8000,
    "total_amount": 51000
  }
]
```

#### Create Fee Structure (Admin/Proprietor/Accountant Only)
```http
POST /api/fees/structures
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Primary 2 Fees",
  "class_level": "Primary 2",
  "tuition_fee": 25000,
  "pta_levy": 3000,
  "bus_fee": 3000,
  "uniform_fee": 7000,
  "books_fee": 5000,
  "feeding_fee": 8000,
  "session_id": 1
}
```

### Fee Invoices

#### Get All Fee Invoices
```http
GET /api/fees/invoices
Authorization: Bearer <token>
```

**Query Parameters:**
- `student_id` (optional): Filter by student
- `status` (optional): Filter by status (unpaid, partial, paid, overdue)

#### Create Fee Invoice (Admin/Proprietor/Accountant Only)
```http
POST /api/fees/invoices
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "student_id": 1,
  "fee_structure_id": 1,
  "term_id": 1,
  "due_date": "2024-09-30"
}
```

### Payments

#### Get All Payments
```http
GET /api/fees/payments
Authorization: Bearer <token>
```

#### Create Payment (Admin/Proprietor/Accountant Only)
```http
POST /api/fees/payments
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "invoice_id": 1,
  "payment_method": "paystack",
  "amount": 25000,
  "transaction_id": "txn_1234567890",
  "recorded_by": 1
}
```

### Student Fee Information
```http
GET /api/fees/students/:studentId
Authorization: Bearer <token>
```

### Fee Reports (Admin/Proprietor/Accountant Only)
```http
GET /api/fees/reports
Authorization: Bearer <token>
```

**Query Parameters:**
- `session_id` (optional): Filter by session
- `term_id` (optional): Filter by term
- `class_level` (optional): Filter by class level
- `date_from` (optional): Start date
- `date_to` (optional): End date

---

## Staff Management

### Get All Staff
```http
GET /api/staff
Authorization: Bearer <token>
```

### Create Staff (Admin/Proprietor Only)
```http
POST /api/staff
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "user_id": 5,
  "employee_no": "EMP001",
  "qualification": "B.Ed Mathematics",
  "specialization": "Primary Mathematics",
  "hire_date": "2020-09-01",
  "salary": 150000,
  "department": "Academic"
}
```

### Teachers

#### Get All Teachers
```http
GET /api/staff/teachers
Authorization: Bearer <token>
```

#### Create Teacher (Admin/Proprietor Only)
```http
POST /api/staff/teachers
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "user_id": 6,
  "employee_no": "EMP002",
  "qualification": "B.Sc Computer Science",
  "specialization": "Computer Studies",
  "hire_date": "2021-01-15",
  "salary": 120000,
  "class_id": 2
}
```

### Staff Attendance

#### Get Staff Attendance
```http
GET /api/staff/attendance
Authorization: Bearer <token>
```

**Query Parameters:**
- `date_from` (optional): Start date
- `date_to` (optional): End date
- `staff_id` (optional): Filter by staff

#### Mark Staff Attendance (Admin/Proprietor Only)
```http
POST /api/staff/attendance
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "staff_id": 1,
  "date": "2024-05-02",
  "status": "present",
  "reason": ""
}
```

---

## Communications

### Messages

#### Get Messages
```http
GET /api/communications/messages
Authorization: Bearer <token>
```

#### Create Message
```http
POST /api/communications/messages
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "receiver_id": 3,
  "subject": "Student Progress Update",
  "content": "Your child is doing well in Mathematics...",
  "message_type": "parent_teacher"
}
```

#### Get Conversation
```http
GET /api/communications/messages/conversation/:userId
Authorization: Bearer <token>
```

#### Mark Message as Read
```http
PUT /api/communications/messages/:id/read
Authorization: Bearer <token>
```

### Announcements

#### Get Announcements
```http
GET /api/communications/announcements
Authorization: Bearer <token>
```

**Query Parameters:**
- `target_audience` (optional): Filter by audience (all, parents, teachers, students, staff)
- `priority` (optional): Filter by priority (low, normal, high, urgent)

#### Create Announcement (Admin/Proprietor/Teacher Only)
```http
POST /api/communications/announcements
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "School Holiday Notice",
  "content": "The school will be closed for the public holiday...",
  "target_audience": "all",
  "priority": "high",
  "expires_at": "2024-05-10T23:59:59Z"
}
```

#### Publish Announcement (Admin/Proprietor Only)
```http
PUT /api/communications/announcements/:id/publish
Authorization: Bearer <token>
```

---

## Health Check

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-05-02T13:36:06.130Z",
  "version": "1.0.0",
  "message": "INPSE Backend API is running"
}
```

---

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

**Error Response Format:**
```json
{
  "error": "Error message description"
}
```

---

## Role-Based Access Control

### User Roles and Permissions:

- **Admin**: Full access to all endpoints
- **Proprietor**: Full access to all endpoints
- **Teacher**: Access to student data in their classes, academic management
- **Parent**: Access to own children's data, fee payments, messages
- **Accountant**: Access to fee management, payments, financial reports
- **Student**: Access to own results, attendance, homework

### Permission Matrix:

| Endpoint | Admin | Proprietor | Teacher | Parent | Accountant | Student |
|----------|-------|-----------|---------|--------|------------|---------|
| Auth | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Students | ✅ | ✅ | Limited | Own | ❌ | ❌ |
| Classes | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Fees | ✅ | ✅ | ❌ | Own | ✅ | ❌ |
| Staff | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Messages | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Announcements | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## Rate Limiting

- **Limit**: 100 requests per 15 minutes per IP
- **Protected Routes**: All `/api/*` routes

---

## CORS Configuration

**Allowed Origins:**
- `https://inpse.vercel.app`
- `https://yourdomain.com`
- `http://localhost:5173`
- `http://localhost:3000`

---

## Examples

### Complete Login Flow

1. **Login:**
```bash
curl -X POST https://inpse-backend-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@inpse.com","password":"admin123"}'
```

2. **Get Students:**
```bash
curl -X GET https://inpse-backend-api.onrender.com/api/students \
  -H "Authorization: Bearer <token>"
```

### Create Fee Invoice

```bash
curl -X POST https://inpse-backend-api.onrender.com/api/fees/invoices \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": 1,
    "fee_structure_id": 1,
    "term_id": 1,
    "due_date": "2024-09-30"
  }'
```

---

## Support

For API support and questions:
- **Email**: api-support@inpse.com
- **Documentation**: This document is updated with each API release
- **Status Page**: https://status.inpse.com

---

*Last Updated: May 2, 2026*
