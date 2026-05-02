// Date formatting utilities
export const formatDate = (date, format = 'YYYY-MM-DD') => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  switch (format) {
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    case 'MM/DD/YYYY':
      return `${month}/${day}/${year}`;
    case 'YYYY-MM-DD HH:mm':
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    default:
      return d.toLocaleDateString();
  }
};

// Generate unique IDs
export const generateId = (prefix = '') => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return prefix ? `${prefix}_${timestamp}_${random}` : `${timestamp}_${random}`;
};

// Generate admission number
export const generateAdmissionNumber = async (year = new Date().getFullYear()) => {
  const { countRecords } = await import('./database.js');
  
  try {
    const count = await countRecords('students', {
      admission_no: `${year}/%`
    });
    
    const nextNumber = (count + 1).toString().padStart(4, '0');
    return `${year}/${nextNumber}`;
  } catch (error) {
    console.error('Error generating admission number:', error);
    return `${year}/0001`;
  }
};

// Generate invoice number
export const generateInvoiceNumber = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `INV-${timestamp}-${random}`;
};

// Generate receipt number
export const generateReceiptNumber = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `RCP-${timestamp}-${random}`;
};

// Calculate age from date of birth
export const calculateAge = (dateOfBirth) => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

// Calculate percentage
export const calculatePercentage = (obtained, total) => {
  if (total === 0) return 0;
  return ((obtained / total) * 100).toFixed(2);
};

// Calculate grade based on percentage
export const calculateGrade = (percentage) => {
  const score = parseFloat(percentage);
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  if (score >= 50) return 'E';
  return 'F';
};

// Format currency
export const formatCurrency = (amount, currency = 'NGN') => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  }).format(amount);
};

// Validate email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number (Nigerian format)
export const isValidPhone = (phone) => {
  const phoneRegex = /^(\+234|0)[789][01]\d{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

// Sanitize string input
export const sanitizeString = (str) => {
  return str.trim().replace(/[<>]/g, '');
};

// Generate random password
export const generatePassword = (length = 8) => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};

// Paginate results
export const paginate = (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  return { offset, limit };
};

// Create pagination metadata
export const createPaginationMeta = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;
  
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage,
    hasPrevPage
  };
};

// Filter object by allowed keys
export const filterObject = (obj, allowedKeys) => {
  return Object.keys(obj)
    .filter(key => allowedKeys.includes(key))
    .reduce((result, key) => {
      result[key] = obj[key];
      return result;
    }, {});
};

// Deep clone object
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

// Remove null/undefined values from object
export const removeEmptyValues = (obj) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => 
      value !== null && value !== undefined && value !== ''
    )
  );
};

// Capitalize first letter of each word
export const capitalizeWords = (str) => {
  return str.replace(/\b\w/g, char => char.toUpperCase());
};

// Convert string to slug
export const toSlug = (str) => {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Check if date is in the past
export const isPastDate = (date) => {
  return new Date(date) < new Date();
};

// Check if date is in the future
export const isFutureDate = (date) => {
  return new Date(date) > new Date();
};

// Get date range for a period
export const getDateRange = (period) => {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);
  
  switch (period) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'week':
      start.setDate(now.getDate() - 7);
      break;
    case 'month':
      start.setMonth(now.getMonth() - 1);
      break;
    case 'year':
      start.setFullYear(now.getFullYear() - 1);
      break;
    default:
      break;
  }
  
  return { start, end };
};

// Calculate days between two dates
export const daysBetween = (date1, date2) => {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round(Math.abs((new Date(date1) - new Date(date2)) / oneDay));
};

// Check if date is overdue
export const isOverdue = (dueDate) => {
  return new Date(dueDate) < new Date();
};

// Get overdue status
export const getOverdueStatus = (dueDate) => {
  if (isOverdue(dueDate)) {
    const daysOverdue = daysBetween(new Date(), dueDate);
    return {
      isOverdue: true,
      daysOverdue,
      status: daysOverdue > 30 ? 'critical' : daysOverdue > 7 ? 'warning' : 'normal'
    };
  }
  return {
    isOverdue: false,
    daysOverdue: 0,
    status: 'paid'
  };
};

// Generate class list for Nigerian schools
export const getClassLevels = () => [
  'Creche',
  'Nursery 1 Yellow',
  'Nursery 1 Blue', 
  'Nursery 1 Green',
  'Nursery 2 Yellow',
  'Nursery 2 Blue',
  'Nursery 2 Green',
  'Nursery 3 Yellow',
  'Nursery 3 Blue',
  'Nursery 3 Green',
  'Primary 1 Yellow',
  'Primary 1 Blue',
  'Primary 1 Green',
  'Primary 2 Yellow',
  'Primary 2 Blue',
  'Primary 2 Green',
  'Primary 3 Yellow',
  'Primary 3 Blue',
  'Primary 3 Green',
  'Primary 4 Yellow',
  'Primary 4 Blue',
  'Primary 4 Green',
  'Primary 5 Yellow',
  'Primary 5 Blue',
  'Primary 5 Green',
  'Primary 6'
];

// Get subject list for Nigerian primary schools
export const getPrimarySubjects = () => [
  'English Language',
  'Mathematics',
  'Basic Science',
  'Basic Technology',
  'Physical Health Education',
  'Computer Studies',
  'Home Economics',
  'Agricultural Science',
  'Civic Education',
  'Creative Arts',
  'Religious Studies',
  'French Language',
  'Igbo Language',
  'Social Studies'
];

// Get nursery colors
export const getNurseryColors = () => [
  'Yellow',
  'Blue',
  'Green'
];

// Get class structure with colors
export const getClassStructure = () => [
  {
    level: 'Creche',
    colors: null,
    classes: ['Creche']
  },
  {
    level: 'Nursery 1',
    colors: ['Yellow', 'Blue', 'Green'],
    classes: ['Nursery 1 Yellow', 'Nursery 1 Blue', 'Nursery 1 Green']
  },
  {
    level: 'Nursery 2',
    colors: ['Yellow', 'Blue', 'Green'],
    classes: ['Nursery 2 Yellow', 'Nursery 2 Blue', 'Nursery 2 Green']
  },
  {
    level: 'Nursery 3',
    colors: ['Yellow', 'Blue', 'Green'],
    classes: ['Nursery 3 Yellow', 'Nursery 3 Blue', 'Nursery 3 Green']
  },
  {
    level: 'Primary 1',
    colors: ['Yellow', 'Blue', 'Green'],
    classes: ['Primary 1 Yellow', 'Primary 1 Blue', 'Primary 1 Green']
  },
  {
    level: 'Primary 2',
    colors: ['Yellow', 'Blue', 'Green'],
    classes: ['Primary 2 Yellow', 'Primary 2 Blue', 'Primary 2 Green']
  },
  {
    level: 'Primary 3',
    colors: ['Yellow', 'Blue', 'Green'],
    classes: ['Primary 3 Yellow', 'Primary 3 Blue', 'Primary 3 Green']
  },
  {
    level: 'Primary 4',
    colors: ['Yellow', 'Blue', 'Green'],
    classes: ['Primary 4 Yellow', 'Primary 4 Blue', 'Primary 4 Green']
  },
  {
    level: 'Primary 5',
    colors: ['Yellow', 'Blue', 'Green'],
    classes: ['Primary 5 Yellow', 'Primary 5 Blue', 'Primary 5 Green']
  },
  {
    level: 'Primary 6',
    colors: null,
    classes: ['Primary 6']
  }
];

// Extract level from class name
export const getClassLevel = (className) => {
  if (className === 'Creche') return 'Creche';
  if (className.startsWith('Nursery')) {
    const match = className.match(/Nursery (\d)/);
    return match ? `Nursery ${match[1]}` : 'Nursery';
  }
  if (className.startsWith('Primary')) {
    const match = className.match(/Primary (\d)/);
    return match ? `Primary ${match[1]}` : 'Primary';
  }
  return 'Unknown';
};

// Extract color from class name
export const getClassColor = (className) => {
  const colors = ['Yellow', 'Blue', 'Green'];
  for (const color of colors) {
    if (className.includes(color)) {
      return color;
    }
  }
  return null;
};

// Check if class has color divisions
export const hasColorDivisions = (className) => {
  const level = getClassLevel(className);
  return ['Nursery 1', 'Nursery 2', 'Nursery 3', 'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5'].includes(level);
};

// Get term names
export const getTermNames = () => [
  'First Term',
  'Second Term',
  'Third Term'
];

// Get payment methods
export const getPaymentMethods = () => [
  'cash',
  'bank_transfer',
  'paystack',
  'flutterwave'
];

// Get user roles
export const getUserRoles = () => [
  'admin',
  'teacher',
  'parent',
  'student',
  'accountant',
  'proprietor'
];

// Get attendance statuses
export const getAttendanceStatuses = () => [
  'present',
  'absent',
  'late',
  'excused'
];

// Get result grades
export const getResultGrades = () => [
  { grade: 'A', min: 90, max: 100, remark: 'Excellent' },
  { grade: 'B', min: 80, max: 89, remark: 'Very Good' },
  { grade: 'C', min: 70, max: 79, remark: 'Good' },
  { grade: 'D', min: 60, max: 69, remark: 'Fair' },
  { grade: 'E', min: 50, max: 59, remark: 'Poor' },
  { grade: 'F', min: 0, max: 49, remark: 'Fail' }
];
