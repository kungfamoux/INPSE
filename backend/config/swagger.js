import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'INPSE School Management System API',
      version: '1.0.0',
      description: 'Complete API documentation for International Nursery and Primary School Enugu School Management System',
      contact: {
        name: 'INPSE API Support',
        email: 'api-support@inpse.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001/api',
        description: 'Development server',
      },
      {
        url: 'https://inpse-backend-api.onrender.com/api',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'User ID',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
            },
            first_name: {
              type: 'string',
              description: 'First name',
            },
            last_name: {
              type: 'string',
              description: 'Last name',
            },
            phone: {
              type: 'string',
              description: 'Phone number',
            },
            role: {
              type: 'string',
              enum: ['admin', 'teacher', 'parent', 'student', 'accountant', 'proprietor'],
              description: 'User role',
            },
            is_active: {
              type: 'boolean',
              description: 'Account status',
            },
            is_approved: {
              type: 'boolean',
              description: 'Account approval status',
            },
          },
        },
        Student: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Student ID',
            },
            admission_no: {
              type: 'string',
              description: 'Admission number',
            },
            first_name: {
              type: 'string',
              description: 'First name',
            },
            last_name: {
              type: 'string',
              description: 'Last name',
            },
            date_of_birth: {
              type: 'string',
              format: 'date',
              description: 'Date of birth',
            },
            gender: {
              type: 'string',
              enum: ['male', 'female'],
              description: 'Gender',
            },
            class_id: {
              type: 'integer',
              description: 'Class ID',
            },
            parent_id: {
              type: 'integer',
              description: 'Parent ID',
            },
            address: {
              type: 'string',
              description: 'Home address',
            },
            emergency_contact: {
              type: 'string',
              description: 'Emergency contact number',
            },
            medical_conditions: {
              type: 'string',
              description: 'Medical conditions',
            },
          },
        },
        Class: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Class ID',
            },
            name: {
              type: 'string',
              description: 'Class name',
            },
            level: {
              type: 'string',
              description: 'Class level',
            },
            capacity: {
              type: 'integer',
              description: 'Maximum capacity',
            },
            teacher_id: {
              type: 'integer',
              description: 'Teacher ID',
            },
          },
        },
        FeeStructure: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Fee structure ID',
            },
            name: {
              type: 'string',
              description: 'Fee structure name',
            },
            class_level: {
              type: 'string',
              description: 'Class level',
            },
            tuition_fee: {
              type: 'number',
              description: 'Tuition fee amount',
            },
            pta_levy: {
              type: 'number',
              description: 'PTA levy amount',
            },
            bus_fee: {
              type: 'number',
              description: 'Bus fee amount',
            },
            uniform_fee: {
              type: 'number',
              description: 'Uniform fee amount',
            },
            books_fee: {
              type: 'number',
              description: 'Books fee amount',
            },
            feeding_fee: {
              type: 'number',
              description: 'Feeding fee amount',
            },
            total_amount: {
              type: 'number',
              description: 'Total fee amount',
            },
          },
        },
        FeeInvoice: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Invoice ID',
            },
            invoice_number: {
              type: 'string',
              description: 'Invoice number',
            },
            student_id: {
              type: 'integer',
              description: 'Student ID',
            },
            fee_structure_id: {
              type: 'integer',
              description: 'Fee structure ID',
            },
            term_id: {
              type: 'integer',
              description: 'Term ID',
            },
            total_amount: {
              type: 'number',
              description: 'Total amount',
            },
            paid_amount: {
              type: 'number',
              description: 'Paid amount',
            },
            balance: {
              type: 'number',
              description: 'Remaining balance',
            },
            status: {
              type: 'string',
              enum: ['unpaid', 'partial', 'paid', 'overdue'],
              description: 'Payment status',
            },
            due_date: {
              type: 'string',
              format: 'date',
              description: 'Due date',
            },
          },
        },
        Payment: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Payment ID',
            },
            invoice_id: {
              type: 'integer',
              description: 'Invoice ID',
            },
            payment_method: {
              type: 'string',
              enum: ['cash', 'bank_transfer', 'paystack', 'flutterwave'],
              description: 'Payment method',
            },
            amount: {
              type: 'number',
              description: 'Payment amount',
            },
            transaction_id: {
              type: 'string',
              description: 'Transaction ID',
            },
            receipt_number: {
              type: 'string',
              description: 'Receipt number',
            },
            payment_date: {
              type: 'string',
              format: 'date',
              description: 'Payment date',
            },
          },
        },
        Staff: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Staff ID',
            },
            user_id: {
              type: 'integer',
              description: 'User ID',
            },
            employee_no: {
              type: 'string',
              description: 'Employee number',
            },
            qualification: {
              type: 'string',
              description: 'Academic qualification',
            },
            specialization: {
              type: 'string',
              description: 'Area of specialization',
            },
            hire_date: {
              type: 'string',
              format: 'date',
              description: 'Hire date',
            },
            salary: {
              type: 'number',
              description: 'Monthly salary',
            },
            department: {
              type: 'string',
              description: 'Department',
            },
          },
        },
        Message: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Message ID',
            },
            sender_id: {
              type: 'integer',
              description: 'Sender ID',
            },
            receiver_id: {
              type: 'integer',
              description: 'Receiver ID',
            },
            subject: {
              type: 'string',
              description: 'Message subject',
            },
            content: {
              type: 'string',
              description: 'Message content',
            },
            message_type: {
              type: 'string',
              description: 'Message type',
            },
            is_read: {
              type: 'boolean',
              description: 'Read status',
            },
          },
        },
        Announcement: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Announcement ID',
            },
            title: {
              type: 'string',
              description: 'Announcement title',
            },
            content: {
              type: 'string',
              description: 'Announcement content',
            },
            target_audience: {
              type: 'string',
              enum: ['all', 'parents', 'teachers', 'students', 'staff'],
              description: 'Target audience',
            },
            priority: {
              type: 'string',
              enum: ['low', 'normal', 'high', 'urgent'],
              description: 'Priority level',
            },
            is_published: {
              type: 'boolean',
              description: 'Publication status',
            },
            expires_at: {
              type: 'string',
              format: 'date-time',
              description: 'Expiration date',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message',
            },
          },
        },
        Success: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Success message',
            },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Login message',
            },
            token: {
              type: 'string',
              description: 'JWT token',
            },
            user: {
              $ref: '#/components/schemas/User',
            },
          },
        },
      },
    },
  },
  apis: ['./routes/**/*.js', './server.js'], // Path to the API docs
};

const specs = swaggerJsdoc(options);

export { specs, swaggerUi };
