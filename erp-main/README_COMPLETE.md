# 🏢 Enterprise Resource Planning (ERP) System

A comprehensive, full-stack Enterprise Resource Planning system built with modern web technologies. This production-ready application manages all aspects of business operations including HR, finance, projects, inventory, manufacturing, and more with real-time updates and enterprise-grade security.

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15.4-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.x-green.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [Project Architecture](#-project-architecture)
- [Getting Started](#-getting-started)
- [Module Documentation](#-module-documentation)
- [API Documentation](#-api-documentation)
- [Security & Authentication](#-security--authentication)
- [Real-time Features](#-real-time-features)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

This ERP system is a complete business management solution designed for small to medium enterprises. It provides integrated modules for managing human resources, financial accounting, project management, inventory control, manufacturing operations, and customer relationships.

### Why This ERP?

- **🚀 Modern Stack**: Built with Next.js 15, TypeScript, and MongoDB
- **⚡ Real-time**: WebSocket integration for live updates
- **🔒 Secure**: JWT authentication, RBAC, and enterprise security
- **📊 Analytics**: Comprehensive dashboards and reporting
- **🎨 Beautiful UI**: Modern design with Shadcn/ui components
- **📱 Responsive**: Works seamlessly on desktop, tablet, and mobile
- **🔧 Extensible**: Modular architecture for easy customization
- **🌐 Multi-industry**: Supports IT, manufacturing, services, and more

---

## ✨ Key Features

### 👥 Human Resources Management
- **Employee Lifecycle Management**
  - Complete employee profiles with personal and professional details
  - Department and role assignment
  - Salary and compensation tracking
  - Document management
  - Employee onboarding/offboarding workflows

- **Attendance & Time Tracking**
  - Real-time check-in/check-out system
  - Automatic attendance calculation
  - Late arrival and early departure tracking
  - Overtime management
  - Attendance reports and analytics
  - Integration with payroll

- **Leave Management**
  - Multiple leave types (sick, vacation, personal, etc.)
  - Leave request and approval workflow
  - Leave balance tracking
  - Calendar integration
  - Leave history and reports

- **Payroll Management**
  - Automated salary calculations
  - Tax deductions and benefits
  - Payslip generation
  - Payment history tracking
  - Compliance reporting

- **Performance Management**
  - Performance review cycles
  - Goal setting and tracking
  - 360-degree feedback
  - Performance analytics

### 💰 Financial Management

- **General Ledger & Accounting**
  - Double-entry bookkeeping system
  - Chart of accounts management
  - Journal entries and posting
  - Trial balance and financial statements
  - Multi-currency support
  - Fiscal period management

- **Accounts Payable & Receivable**
  - Invoice management
  - Payment processing
  - Vendor bill tracking
  - Customer payment tracking
  - Aging reports

- **Budgeting & Cost Control**
  - Budget creation and allocation
  - Budget vs actual analysis
  - Cost center management
  - Expense tracking and approval
  - Budget alerts and notifications

- **Project Finance**
  - Project budgeting
  - Cost tracking by project
  - Work-in-progress (WIP) accounting
  - Project profitability analysis
  - Revenue recognition

- **Financial Reporting**
  - Income statement
  - Balance sheet
  - Cash flow statement
  - Custom financial reports
  - Export to Excel/PDF

- **Tax Management**
  - Tax calculation and tracking
  - Tax compliance reports
  - Multi-jurisdiction support

### 📊 Project Management

- **Project Planning**
  - Project creation and setup
  - Milestone definition
  - Resource allocation
  - Timeline and Gantt charts
  - Project templates

- **Task Management**
  - Task creation and assignment
  - Kanban board view
  - Task dependencies
  - Priority and status tracking
  - Task comments and attachments
  - Subtask management

- **Team Collaboration**
  - Team member assignment
  - Role-based permissions
  - Activity feeds
  - Real-time notifications
  - File sharing

- **Project Tracking**
  - Progress monitoring
  - Time tracking
  - Budget tracking
  - Resource utilization
  - Burndown charts

- **Project Reporting**
  - Project status reports
  - Resource reports
  - Time and expense reports
  - Custom project analytics

### 📦 Inventory Management

- **Product Catalog**
  - Product information management
  - SKU and barcode management
  - Product categories and attributes
  - Pricing and cost tracking
  - Product images and documents

- **Stock Management**
  - Real-time inventory levels
  - Multi-location inventory
  - Stock adjustments
  - Inventory transfers
  - Batch and serial number tracking

- **Warehouse Management**
  - Warehouse locations
  - Bin management
  - Pick, pack, and ship
  - Receiving and putaway

- **Inventory Analytics**
  - Stock valuation reports
  - Inventory turnover analysis
  - Low stock alerts
  - Reorder point management
  - ABC analysis

### 🛒 Order Management

- **Sales Orders**
  - Order creation and processing
  - Order status tracking
  - Order fulfillment
  - Partial shipments
  - Order history

- **Purchase Orders**
  - Purchase requisitions
  - PO creation and approval
  - Vendor management
  - Receiving and inspection
  - Three-way matching

- **Order Analytics**
  - Sales trends and forecasting
  - Order fulfillment metrics
  - Customer order history
  - Supplier performance

### 👤 Customer Relationship Management (CRM)

- **Customer Management**
  - Customer profiles and contacts
  - Communication history
  - Customer segmentation
  - Credit limit management
  - Customer portal access

- **Contact Management**
  - Contact information tracking
  - Communication logs
  - Task and appointment scheduling
  - Email integration

- **Sales Pipeline**
  - Lead management
  - Opportunity tracking
  - Sales forecasting
  - Win/loss analysis

### 🏭 Manufacturing Management

- **Bill of Materials (BOM)**
  - Multi-level BOM
  - Component tracking
  - BOM versioning
  - Cost rollup

- **Work Orders**
  - Production planning
  - Work order scheduling
  - Material requirements planning (MRP)
  - Production tracking
  - Capacity planning

- **Quality Control**
  - Quality inspections
  - Defect tracking
  - Quality metrics
  - Compliance management

- **Machine Management**
  - Equipment tracking
  - Maintenance scheduling
  - Downtime tracking
  - OEE (Overall Equipment Effectiveness)

### 💻 IT Service Management

- **Support Tickets**
  - Ticket creation and assignment
  - Priority and SLA management
  - Ticket escalation
  - Knowledge base integration
  - Customer satisfaction tracking

- **Sprint Management**
  - Agile/Scrum support
  - Sprint planning
  - Backlog management
  - Velocity tracking
  - Sprint retrospectives

- **Time Tracking**
  - Billable and non-billable hours
  - Timesheet management
  - Project time allocation
  - Time reports and analytics

### 🎯 Service Management

- **Service Catalog**
  - Service offerings
  - Service pricing
  - Service level agreements (SLA)
  - Service packages

- **Appointment Scheduling**
  - Calendar management
  - Resource scheduling
  - Appointment reminders
  - Booking management

- **Subscription Management**
  - Recurring billing
  - Subscription plans
  - Renewal management
  - Usage tracking

### 📈 Analytics & Business Intelligence

- **Dashboard Analytics**
  - Real-time KPI monitoring
  - Customizable dashboards
  - Interactive charts and graphs
  - Drill-down capabilities

- **Operational Reports**
  - Employee performance reports
  - Project status reports
  - Financial reports
  - Inventory reports
  - Sales reports

- **Predictive Analytics**
  - Sales forecasting
  - Demand planning
  - Resource optimization
  - Trend analysis

### 🔐 Security & Administration

- **User Management**
  - User creation and management
  - Password policies
  - Account activation/deactivation
  - User activity logs

- **Role-Based Access Control (RBAC)**
  - Hierarchical role system (ROOT, SUPER_ADMIN, ADMIN, MANAGER, EMPLOYEE, NORMAL)
  - Module-level permissions
  - Action-level permissions (CRUD)
  - Data-level security

- **Audit & Compliance**
  - Activity logging
  - Audit trails
  - Compliance reports
  - Data retention policies

- **System Settings**
  - Company settings
  - Feature flags
  - Email configuration
  - Integration settings

---

## 🚀 Technology Stack

### Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 15.4.8 | React framework with App Router and server components |
| **React** | 18.2.0 | UI library for building interactive interfaces |
| **TypeScript** | 5.x | Type-safe JavaScript development |
| **Tailwind CSS** | 3.3.0 | Utility-first CSS framework |
| **Shadcn/ui** | Latest | Modern, accessible React component library |
| **Recharts** | 2.15.4 | Data visualization and charting library |
| **Framer Motion** | 12.23.12 | Animation library for smooth transitions |
| **React Hook Form** | 7.62.0 | Performant form handling and validation |
| **Zod** | 3.24.2 | TypeScript-first schema validation |
| **Socket.IO Client** | 4.8.1 | Real-time WebSocket communication |
| **Axios** | 1.12.0 | HTTP client for API requests |
| **date-fns** | 3.6.0 | Modern date utility library |
| **Lucide React** | 0.476.0 | Beautiful icon library |
| **React Hot Toast** | 2.5.2 | Toast notifications |
| **Next Themes** | 0.4.6 | Dark mode support |

### Backend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 18.x | JavaScript runtime environment |
| **Express.js** | 4.21.2 | Web application framework |
| **TypeScript** | 4.9.5 | Type-safe server development |
| **MongoDB** | 7.2.0 | NoSQL database |
| **Mongoose** | 7.2.0 | MongoDB ODM (Object Data Modeling) |
| **Socket.IO** | 4.8.1 | Real-time bidirectional communication |
| **JWT** | 9.0.2 | JSON Web Token authentication |
| **bcryptjs** | 2.4.3 | Password hashing |
| **Helmet** | 7.0.0 | Security middleware |
| **CORS** | 2.8.5 | Cross-origin resource sharing |
| **Winston** | 3.8.2 | Logging library |
| **Express Validator** | 7.2.1 | Request validation middleware |
| **Express Rate Limit** | 6.7.0 | Rate limiting middleware |
| **Cookie Parser** | 1.4.7 | Cookie parsing middleware |
| **dotenv** | 16.0.3 | Environment variable management |

### Development Tools

- **Nodemon** - Auto-restart server on changes
- **ts-node** - TypeScript execution for Node.js
- **ESLint** - Code linting and quality
- **Prettier** - Code formatting
- **Jest** - Testing framework
- **Git** - Version control

---

## 🏗️ Project Architecture

### Directory Structure

```
erp-main/
├── frontend/                 # Next.js React application
│   ├── src/
│   │   ├── app/             # Next.js App Router pages
│   │   │   ├── dashboard/   # Main dashboard and modules
│   │   │   ├── login/       # Authentication pages
│   │   │   └── signup/      # User registration
│   │   ├── components/      # Reusable React components
│   │   │   ├── ui/          # Shadcn/ui components
│   │   │   ├── forms/       # Form components
│   │   │   ├── tables/      # Data table components
│   │   │   └── charts/      # Chart components
│   │   ├── lib/             # Utility functions and API clients
│   │   ├── hooks/           # Custom React hooks
│   │   ├── contexts/        # React context providers
│   │   ├── types/           # TypeScript type definitions
│   │   └── utils/           # Helper utilities
│   ├── public/              # Static assets
│   ├── .env.local           # Environment variables
│   └── package.json         # Frontend dependencies
│
├── backend/                 # Express.js API server
│   ├── src/
│   │   ├── controllers/     # Business logic handlers
│   │   │   ├── finance/     # Financial controllers
│   │   │   ├── it/          # IT service controllers
│   │   │   ├── manufacturing/ # Manufacturing controllers
│   │   │   └── services/    # Service management controllers
│   │   ├── models/          # MongoDB schemas and models
│   │   │   ├── finance/     # Financial models
│   │   │   ├── hr/          # HR models
│   │   │   ├── it/          # IT models
│   │   │   ├── manufacturing/ # Manufacturing models
│   │   │   └── services/    # Service models
│   │   ├── routes/          # API route definitions
│   │   ├── middleware/      # Authentication, validation, error handling
│   │   ├── services/        # Business logic services
│   │   ├── utils/           # Helper functions and utilities
│   │   ├── types/           # TypeScript interfaces
│   │   └── server.ts        # Application entry point
│   ├── scripts/             # Database seeding and utilities
│   ├── .env                 # Environment variables
│   └── package.json         # Backend dependencies
│
├── Documentation/           # Project documentation
│   └── Finance/            # Finance module documentation
│
├── README.md               # This file
├── DEPLOYMENT.md           # Deployment guide
└── package.json            # Root package scripts
```

### Backend Architecture

#### Models (Database Schemas)

**Core Models:**
- User - User accounts and authentication
- Employee - Employee information and HR data
- Role - User roles and permissions
- Permission - Granular permissions
- Settings - System configuration

**HR Models:**
- Attendance - Employee attendance records
- Leave - Leave requests and balances
- Payroll - Salary and payment information
- PerformanceReview - Performance evaluations

**Finance Models:**
- Account - Chart of accounts
- JournalEntry - General ledger entries
- Invoice - Customer invoices
- Payment - Payment transactions
- Budget - Budget allocations
- Expense - Expense tracking
- ProjectBudget - Project financial planning
- Tax - Tax management

**Project Models:**
- Project - Project information
- Task - Task management
- Timeline - Project timelines

**Inventory Models:**
- Product - Product catalog
- Inventory - Stock levels
- InventoryTransaction - Stock movements

**Order Models:**
- Order - Sales and purchase orders
- Customer - Customer information
- Supplier - Supplier information
- Contact - Contact management

**Manufacturing Models:**
- BillOfMaterials - Product BOMs
- WorkOrder - Production orders
- Machine - Equipment tracking
- QualityControl - Quality management
- BatchLot - Batch tracking

**IT Models:**
- SupportTicket - Help desk tickets
- Sprint - Agile sprint management
- TimeEntry - Time tracking

**Service Models:**
- ServiceCatalog - Service offerings
- Appointment - Scheduling
- Subscription - Recurring services

#### Controllers

Controllers handle HTTP requests and implement business logic:

- **authController** - Authentication and authorization
- **employeeController** - Employee CRUD operations
- **attendanceController** - Attendance tracking
- **leaveController** - Leave management
- **projectController** - Project management
- **taskController** - Task operations
- **inventoryController** - Inventory management
- **orderController** - Order processing
- **financeController** - Financial operations
- **analyticsController** - Dashboard analytics
- **reportController** - Report generation

#### Middleware

- **auth.middleware** - JWT token verification
- **rbac.middleware** - Role-based access control
- **validation.middleware** - Request validation
- **error.middleware** - Error handling
- **rateLimit.middleware** - API rate limiting

#### Routes

RESTful API routes organized by module:
- `/api/auth` - Authentication endpoints
- `/api/employees` - Employee management
- `/api/attendance` - Attendance tracking
- `/api/projects` - Project management
- `/api/tasks` - Task management
- `/api/inventory` - Inventory operations
- `/api/orders` - Order management
- `/api/finance` - Financial operations
- `/api/analytics` - Analytics and reports

### Frontend Architecture

#### Pages (App Router)

- `/` - Landing page
- `/login` - User login
- `/signup` - User registration
- `/dashboard` - Main dashboard
- `/dashboard/employees` - Employee management
- `/dashboard/projects` - Project management
- `/dashboard/inventory` - Inventory management
- `/dashboard/orders` - Order management
- `/dashboard/finance` - Financial management
- `/dashboard/reports` - Reports and analytics
- `/dashboard/settings` - System settings

#### Components

**UI Components (Shadcn/ui):**
- Button, Input, Select, Checkbox, Radio
- Dialog, Sheet, Popover, Dropdown
- Table, Card, Badge, Avatar
- Tabs, Accordion, Collapsible
- Calendar, DatePicker, TimePicker
- Toast, Alert, Progress

**Custom Components:**
- DataTable - Advanced data tables with sorting, filtering, pagination
- FormBuilder - Dynamic form generation
- ChartWidget - Reusable chart components
- StatCard - Dashboard statistics cards
- Sidebar - Navigation sidebar
- Header - Application header
- LoadingSpinner - Loading states

#### Hooks

- **useAuth** - Authentication state and methods
- **useApi** - API request handling
- **useSocket** - WebSocket connection
- **useToast** - Toast notifications
- **useDebounce** - Debounced values
- **useLocalStorage** - Local storage management

#### Contexts

- **AuthContext** - Global authentication state
- **ThemeContext** - Dark/light mode
- **SocketContext** - WebSocket connection
- **NotificationContext** - Real-time notifications

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.x or higher) - [Download](https://nodejs.org/)
- **npm** (v10.0.0 or higher) - Comes with Node.js
- **MongoDB** (v7.x or higher) - [Download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **Git** - [Download](https://git-scm.com/)

### Installation

#### 1. Clone the Repository

```bash
git clone <repository-url>
cd erp-main
```

#### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env file with your configuration
# Required variables:
# - MONGO_URI: Your MongoDB connection string
# - JWT_SECRET: Secret key for JWT tokens
# - PORT: Server port (default: 5000)
# - CORS_ORIGIN: Frontend URL (default: http://localhost:3000)
```

**Backend Environment Variables (.env):**

```env
# Database Configuration
MONGO_URI=mongodb://localhost:27017/erp-finance
# For MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/erp-finance?retryWrites=true&w=majority

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-key-here-make-it-long-and-random

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
FRONTEND_URL=http://localhost:3000

# Company Configuration
DEFAULT_COMPANY_ID=your-default-company-id

# Logging Configuration
LOG_LEVEL=info
LOG_FILE=./logs/app.log
```

#### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Create environment file
echo "NEXT_PUBLIC_API_URL=http://localhost:5000" > .env.local
```

**Frontend Environment Variables (.env.local):**

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

#### 4. Database Setup

**Option A: Seed Sample Data (Recommended for Development)**

```bash
cd backend
npm run seed
```

This will create:
- Sample users with different roles
- Employee records
- Projects and tasks
- Inventory items
- Customers and suppliers
- Financial accounts

**Option B: Create Admin User Only**

```bash
cd backend
npx ts-node scripts/create_admin.ts
```

### Running the Application

#### Development Mode

**Terminal 1 - Start Backend:**
```bash
cd backend
npm run dev
```
Backend will run on: http://localhost:5000

**Terminal 2 - Start Frontend:**
```bash
cd frontend
npm run dev
```
Frontend will run on: http://localhost:3000

#### Production Mode

**Build and Start Backend:**
```bash
cd backend
npm run build
npm start
```

**Build and Start Frontend:**
```bash
cd frontend
npm run build
npm start
```

### Default Login Credentials

After seeding the database, you can login with:

**Super Admin:**
- Email: `admin@erp.com`
- Password: `admin123`

**Manager:**
- Email: `manager@erp.com`
- Password: `manager123`

**Employee:**
- Email: `employee@erp.com`
- Password: `employee123`

### Verify Installation

1. **Backend Health Check:**
   - Visit: http://localhost:5000/api/test
   - Should return: `{"message": "API is working"}`

2. **Frontend:**
   - Visit: http://localhost:3000
   - You should see the login page

3. **Socket.IO:**
   - Visit: http://localhost:5000/api/socket/health
   - Should return socket connection status

---

## 📚 Module Documentation

### Employee Management Module

**Features:**
- Create, read, update, delete employee records
- Employee profile with photo and documents
- Department and position assignment
- Salary and compensation tracking
- Employment history
- Contact information

**API Endpoints:**
```
GET    /api/employees          - Get all employees
POST   /api/employees          - Create new employee
GET    /api/employees/:id      - Get employee by ID
PUT    /api/employees/:id      - Update employee
DELETE /api/employees/:id      - Delete employee
GET    /api/employees/stats    - Get employee statistics
```

**Frontend Routes:**
- `/dashboard/employees` - Employee list
- `/dashboard/employees/create` - Create employee
- `/dashboard/employees/:id` - Employee details
- `/dashboard/employees/:id/edit` - Edit employee

### Attendance Management Module

**Features:**
- Real-time check-in/check-out
- Automatic attendance calculation
- Late arrival tracking
- Overtime calculation
- Attendance reports
- Calendar view

**API Endpoints:**
```
GET    /api/attendance                - Get attendance records
POST   /api/attendance/checkin        - Employee check-in
POST   /api/attendance/checkout       - Employee check-out
GET    /api/attendance/today-stats    - Today's statistics
GET    /api/attendance/employee/:id   - Employee attendance history
GET    /api/attendance/report         - Attendance report
```

**Frontend Routes:**
- `/dashboard/employees/attendance` - Attendance dashboard
- `/dashboard/employees/:id/attendance` - Employee attendance

### Project Management Module

**Features:**
- Project creation and planning
- Task assignment and tracking
- Kanban board view
- Project timeline and milestones
- Team collaboration
- Project budget tracking
- Progress monitoring

**API Endpoints:**
```
GET    /api/projects              - Get all projects
POST   /api/projects              - Create new project
GET    /api/projects/:id          - Get project by ID
PUT    /api/projects/:id          - Update project
DELETE /api/projects/:id          - Delete project
GET    /api/projects/:id/tasks    - Get project tasks
GET    /api/projects/:id/members  - Get project team
POST   /api/projects/:id/members  - Add team member
```

**Frontend Routes:**
- `/dashboard/projects` - Project list
- `/dashboard/projects/create` - Create project
- `/dashboard/projects/:id` - Project details
- `/dashboard/projects/:id/tasks` - Project tasks

### Task Management Module

**Features:**
- Task creation and assignment
- Priority and status management
- Task dependencies
- Comments and attachments
- Time tracking
- Subtasks
- Task notifications

**API Endpoints:**
```
GET    /api/tasks              - Get all tasks
POST   /api/tasks              - Create new task
GET    /api/tasks/:id          - Get task by ID
PUT    /api/tasks/:id          - Update task
DELETE /api/tasks/:id          - Delete task
POST   /api/tasks/:id/comments - Add comment
GET    /api/tasks/my-tasks     - Get user's tasks
```

**Frontend Routes:**
- `/dashboard/projects/tasks` - All tasks
- `/dashboard/projects/my-tasks` - My tasks
- `/dashboard/projects/:id/tasks` - Project tasks

### Inventory Management Module

**Features:**
- Product catalog management
- Stock level tracking
- Multi-location inventory
- Stock adjustments
- Low stock alerts
- Inventory valuation
- Transaction history

**API Endpoints:**
```
GET    /api/inventory              - Get inventory items
POST   /api/inventory              - Add inventory item
GET    /api/inventory/:id          - Get item by ID
PUT    /api/inventory/:id          - Update item
DELETE /api/inventory/:id          - Delete item
PUT    /api/inventory/:id/adjust   - Adjust stock levels
GET    /api/inventory/low-stock    - Get low stock items
GET    /api/inventory/valuation    - Get inventory valuation
```

**Frontend Routes:**
- `/dashboard/inventory` - Inventory list
- `/dashboard/inventory/add` - Add inventory
- `/dashboard/inventory/:id` - Item details

### Financial Management Module

**Features:**
- General ledger accounting
- Chart of accounts
- Journal entries
- Invoice management
- Payment processing
- Budget management
- Expense tracking
- Financial reports

**API Endpoints:**
```
# Accounts
GET    /api/finance/accounts       - Get chart of accounts
POST   /api/finance/accounts       - Create account
PUT    /api/finance/accounts/:id   - Update account

# Journal Entries
GET    /api/finance/journal        - Get journal entries
POST   /api/finance/journal        - Create journal entry

# Invoices
GET    /api/finance/invoices       - Get invoices
POST   /api/finance/invoices       - Create invoice
PUT    /api/finance/invoices/:id   - Update invoice

# Payments
GET    /api/finance/payments       - Get payments
POST   /api/finance/payments       - Record payment

# Budgets
GET    /api/finance/budgets        - Get budgets
POST   /api/finance/budgets        - Create budget

# Reports
GET    /api/finance/reports/income-statement  - Income statement
GET    /api/finance/reports/balance-sheet     - Balance sheet
GET    /api/finance/reports/cash-flow         - Cash flow statement
```

**Frontend Routes:**
- `/dashboard/finance` - Finance dashboard
- `/dashboard/finance/accounts` - Chart of accounts
- `/dashboard/finance/general-ledger` - General ledger
- `/dashboard/finance/invoices` - Invoice management
- `/dashboard/finance/budgeting` - Budget management
- `/dashboard/finance/expenses` - Expense tracking
- `/dashboard/finance/reports` - Financial reports

### Order Management Module

**Features:**
- Sales order creation
- Purchase order management
- Order status tracking
- Order fulfillment
- Shipping management
- Order history
- Order analytics

**API Endpoints:**
```
GET    /api/orders         - Get all orders
POST   /api/orders         - Create new order
GET    /api/orders/:id     - Get order by ID
PUT    /api/orders/:id     - Update order
DELETE /api/orders/:id     - Delete order
PUT    /api/orders/:id/status - Update order status
GET    /api/orders/stats   - Get order statistics
```

**Frontend Routes:**
- `/dashboard/orders` - Order list
- `/dashboard/orders/new` - Create order
- `/dashboard/orders/:id` - Order details

### Customer & Supplier Management

**Features:**
- Customer profiles
- Supplier information
- Contact management
- Communication history
- Credit management
- Vendor performance

**API Endpoints:**
```
# Customers
GET    /api/customers      - Get all customers
POST   /api/customers      - Create customer
GET    /api/customers/:id  - Get customer by ID
PUT    /api/customers/:id  - Update customer
DELETE /api/customers/:id  - Delete customer

# Suppliers
GET    /api/suppliers      - Get all suppliers
POST   /api/suppliers      - Create supplier
GET    /api/suppliers/:id  - Get supplier by ID
PUT    /api/suppliers/:id  - Update supplier
DELETE /api/suppliers/:id  - Delete supplier

# Contacts
GET    /api/contacts       - Get all contacts
POST   /api/contacts       - Create contact
GET    /api/contacts/:id   - Get contact by ID
PUT    /api/contacts/:id   - Update contact
DELETE /api/contacts/:id   - Delete contact
```

**Frontend Routes:**
- `/dashboard/customers` - Customer list
- `/dashboard/suppliers` - Supplier list
- `/dashboard/contacts` - Contact list

---

## 🔌 API Documentation

### Base URL

```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

### Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Response Format

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400
}
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "EMPLOYEE"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "EMPLOYEE"
  }
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer <token>
```

### Employee Endpoints

#### Get All Employees
```http
GET /api/employees?page=1&limit=10&search=john&department=IT
Authorization: Bearer <token>
```

#### Create Employee
```http
POST /api/employees
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@company.com",
  "phone": "+1234567890",
  "department": "IT",
  "position": "Software Engineer",
  "salary": 75000,
  "joinDate": "2024-01-15",
  "status": "active"
}
```

#### Update Employee
```http
PUT /api/employees/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "position": "Senior Software Engineer",
  "salary": 85000
}
```

### Attendance Endpoints

#### Check In
```http
POST /api/attendance/checkin
Authorization: Bearer <token>
Content-Type: application/json

{
  "employeeId": "employee_id",
  "location": "Office"
}
```

#### Check Out
```http
POST /api/attendance/checkout
Authorization: Bearer <token>
Content-Type: application/json

{
  "attendanceId": "attendance_id"
}
```

#### Get Today's Stats
```http
GET /api/attendance/today-stats
Authorization: Bearer <token>
```

### Project Endpoints

#### Create Project
```http
POST /api/projects
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Website Redesign",
  "description": "Complete redesign of company website",
  "startDate": "2024-02-01",
  "endDate": "2024-06-30",
  "budget": 50000,
  "status": "planning",
  "teamMembers": ["user_id_1", "user_id_2"]
}
```

#### Get Project Tasks
```http
GET /api/projects/:projectId/tasks
Authorization: Bearer <token>
```

### Task Endpoints

#### Create Task
```http
POST /api/tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Design homepage mockup",
  "description": "Create initial design mockup for homepage",
  "projectId": "project_id",
  "assignedTo": "user_id",
  "priority": "high",
  "status": "todo",
  "dueDate": "2024-02-15"
}
```

#### Update Task Status
```http
PUT /api/tasks/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "in_progress"
}
```

### Inventory Endpoints

#### Adjust Stock
```http
PUT /api/inventory/:id/adjust
Authorization: Bearer <token>
Content-Type: application/json

{
  "quantity": 100,
  "type": "addition",
  "reason": "Purchase order received",
  "reference": "PO-12345"
}
```

### Financial Endpoints

#### Create Journal Entry
```http
POST /api/finance/journal
Authorization: Bearer <token>
Content-Type: application/json

{
  "date": "2024-01-15",
  "description": "Office rent payment",
  "entries": [
    {
      "account": "Rent Expense",
      "debit": 2000,
      "credit": 0
    },
    {
      "account": "Cash",
      "debit": 0,
      "credit": 2000
    }
  ]
}
```

### Rate Limiting

API endpoints are rate-limited to prevent abuse:
- **General endpoints**: 100 requests per 15 minutes
- **Authentication endpoints**: 5 requests per 15 minutes

### Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

---

## 🔐 Security & Authentication

### Authentication System

**JWT-Based Authentication:**
- Secure token generation using jsonwebtoken
- Token expiration and refresh mechanism
- HTTP-only cookies for token storage
- Secure password hashing with bcryptjs (10 salt rounds)

**Password Security:**
- Minimum password length requirements
- Password complexity validation
- Secure password reset flow
- Password history tracking

### Role-Based Access Control (RBAC)

**Role Hierarchy:**

1. **ROOT** (Level 6)
   - System administrator with full access
   - Can manage all users and roles
   - Access to all system settings
   - Database management capabilities

2. **SUPER_ADMIN** (Level 5)
   - Administrative access to all modules
   - User management
   - System configuration
   - Financial oversight

3. **ADMIN** (Level 4)
   - Department-level administrative access
   - Employee management
   - Project oversight
   - Report generation

4. **MANAGER** (Level 3)
   - Team and project management
   - Task assignment
   - Team member oversight
   - Budget approval

5. **EMPLOYEE** (Level 2)
   - Basic user access
   - Assigned task management
   - Time tracking
   - Personal data access

6. **NORMAL** (Level 1)
   - Limited access
   - View-only permissions
   - Personal profile access

**Permission System:**

Permissions are organized by module and action:

```typescript
{
  module: "employees",
  actions: ["create", "read", "update", "delete"],
  dataAccess: "all" | "department" | "own"
}
```

**Module Permissions:**
- **employees**: Employee management
- **attendance**: Attendance tracking
- **leave**: Leave management
- **projects**: Project management
- **tasks**: Task management
- **inventory**: Inventory operations
- **orders**: Order management
- **finance**: Financial operations
- **reports**: Report access
- **settings**: System settings

**Action Permissions:**
- **create**: Create new records
- **read**: View records
- **update**: Modify records
- **delete**: Delete records
- **approve**: Approve requests
- **export**: Export data

### Security Middleware

**Helmet.js:**
- Content Security Policy (CSP)
- X-Frame-Options
- X-Content-Type-Options
- Strict-Transport-Security
- X-XSS-Protection

**CORS Configuration:**
- Whitelist allowed origins
- Credentials support
- Preflight request handling

**Rate Limiting:**
- Request throttling per IP
- Endpoint-specific limits
- Brute force protection

**Input Validation:**
- Request body validation
- SQL injection prevention
- XSS attack prevention
- Parameter sanitization

### Data Security

**Encryption:**
- Password hashing with bcrypt
- Sensitive data encryption at rest
- HTTPS/TLS for data in transit

**Audit Logging:**
- User activity tracking
- Authentication attempts
- Data modification logs
- Access logs

**Data Privacy:**
- GDPR compliance features
- Data retention policies
- Right to be forgotten
- Data export capabilities

---

## 🔄 Real-time Features

### WebSocket Integration

**Socket.IO Implementation:**
- Bidirectional communication
- Automatic reconnection
- Room-based messaging
- Event-driven architecture

**Real-time Events:**

```typescript
// Client-side connection
const socket = io('http://localhost:5000', {
  auth: { token: authToken }
});

// Server-side events
socket.on('connection', (socket) => {
  // User connected
});
```

### Real-time Notifications

**Notification Types:**
- Task assignments
- Project updates
- Attendance alerts
- Leave approvals
- Order status changes
- Low stock alerts
- Payment reminders
- System announcements

**Notification Delivery:**
- In-app notifications
- Real-time toast messages
- Email notifications (optional)
- Push notifications (optional)

### Live Updates

**Dashboard Updates:**
- Real-time KPI metrics
- Live attendance tracking
- Project progress updates
- Inventory level changes
- Order status updates

**Collaborative Features:**
- Multi-user task editing
- Real-time comments
- Live presence indicators
- Typing indicators

### Socket Events

**Authentication:**
```javascript
socket.emit('authenticate', token);
socket.on('authenticated', (data) => {
  console.log('Authenticated:', data.userId);
});
```

**Notifications:**
```javascript
socket.on('notification', (notification) => {
  // Display notification
});
```

**Data Updates:**
```javascript
socket.on('data:update', (data) => {
  // Update UI with new data
});
```

---

## 🚀 Deployment

### Deployment Options

#### 1. Render (Recommended)

**Automatic Deployment with Blueprint:**

The project includes a `render.yaml` file for easy deployment:

```bash
# Push to GitHub
git push origin main

# In Render Dashboard:
# 1. New → Blueprint
# 2. Connect repository
# 3. Render auto-detects render.yaml
# 4. Add environment variables
# 5. Deploy
```

**Services Created:**
- `erp-backend` - Express.js API (Port 5000)
- `erp-frontend` - Next.js app (Port 3000)

**Environment Variables (Backend):**
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/erp
JWT_SECRET=your-secret-key
NODE_ENV=production
FRONTEND_URL=https://erp-frontend.onrender.com
```

**Environment Variables (Frontend):**
```env
NEXT_PUBLIC_API_URL=https://erp-backend.onrender.com
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

#### 2. Vercel (Frontend) + Render (Backend)

**Frontend on Vercel:**
```bash
cd frontend
vercel --prod
```

**Backend on Render:**
- Deploy as Web Service
- Connect GitHub repository
- Set root directory to `backend`

#### 3. AWS Deployment

**Backend (EC2 or Elastic Beanstalk):**
- Launch EC2 instance
- Install Node.js and MongoDB
- Clone repository
- Configure environment variables
- Use PM2 for process management

**Frontend (S3 + CloudFront):**
```bash
cd frontend
npm run build
aws s3 sync out/ s3://your-bucket-name
```

**Database (MongoDB Atlas or DocumentDB):**
- Create cluster
- Configure network access
- Get connection string

#### 4. Docker Deployment

**Docker Compose:**

```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - MONGO_URI=mongodb://mongo:27017/erp
      - JWT_SECRET=your-secret
    depends_on:
      - mongo
  
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:5000
    depends_on:
      - backend
  
  mongo:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

volumes:
  mongo-data:
```

**Deploy:**
```bash
docker-compose up -d
```

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure production MongoDB instance
- [ ] Set strong JWT_SECRET
- [ ] Enable HTTPS/SSL certificates
- [ ] Configure CORS for production domains
- [ ] Set up monitoring and logging
- [ ] Configure backup strategies
- [ ] Set up CI/CD pipeline
- [ ] Enable rate limiting
- [ ] Configure CDN for static assets
- [ ] Set up error tracking (Sentry)
- [ ] Configure email service
- [ ] Set up database backups
- [ ] Enable security headers
- [ ] Configure firewall rules

### Monitoring & Logging

**Winston Logger:**
- Application logs
- Error tracking
- Request logging
- Performance monitoring

**Log Levels:**
- error: Error messages
- warn: Warning messages
- info: Informational messages
- debug: Debug messages

**Monitoring Tools:**
- PM2 for process monitoring
- MongoDB Atlas monitoring
- Render metrics dashboard
- Custom health check endpoints

### Backup Strategy

**Database Backups:**
```bash
# MongoDB backup
mongodump --uri="mongodb://localhost:27017/erp" --out=/backup/$(date +%Y%m%d)

# Restore
mongorestore --uri="mongodb://localhost:27017/erp" /backup/20240115
```

**Automated Backups:**
- Daily automated backups
- Retention policy (30 days)
- Off-site backup storage
- Backup verification

---

## 🧪 Testing

### Backend Testing

**Unit Tests:**
```bash
cd backend
npm test
```

**API Testing:**
```bash
# Test all endpoints
node test-backend.js

# Test specific module
node test-employee-creation.js
```

**Test Coverage:**
- Controller tests
- Model validation tests
- Middleware tests
- Integration tests

### Frontend Testing

**Component Tests:**
```bash
cd frontend
npm test
```

**E2E Tests:**
```bash
npm run test:e2e
```

### Manual Testing Checklist

**Authentication:**
- [ ] User registration
- [ ] User login
- [ ] Token refresh
- [ ] Password reset
- [ ] Logout

**Employee Management:**
- [ ] Create employee
- [ ] Update employee
- [ ] Delete employee
- [ ] View employee list
- [ ] Search employees

**Attendance:**
- [ ] Check-in
- [ ] Check-out
- [ ] View attendance records
- [ ] Generate reports

**Projects:**
- [ ] Create project
- [ ] Assign team members
- [ ] Create tasks
- [ ] Update task status
- [ ] View project dashboard

**Inventory:**
- [ ] Add product
- [ ] Adjust stock
- [ ] View inventory levels
- [ ] Low stock alerts

**Orders:**
- [ ] Create order
- [ ] Update order status
- [ ] View order history
- [ ] Generate invoice

**Finance:**
- [ ] Create journal entry
- [ ] Record payment
- [ ] Generate reports
- [ ] View financial statements

---

## 📊 Performance Optimization

### Backend Optimization

**Database Indexing:**
```javascript
// Employee model indexes
employeeSchema.index({ email: 1 });
employeeSchema.index({ department: 1, status: 1 });
employeeSchema.index({ firstName: 'text', lastName: 'text' });
```

**Query Optimization:**
- Use projection to limit fields
- Implement pagination
- Use aggregation pipelines
- Cache frequently accessed data

**API Optimization:**
- Response compression (gzip)
- Request payload limits
- Connection pooling
- Query result caching

### Frontend Optimization

**Next.js Features:**
- Server-side rendering (SSR)
- Static site generation (SSG)
- Incremental static regeneration (ISR)
- Image optimization
- Code splitting
- Lazy loading

**Performance Techniques:**
- Component memoization
- Virtual scrolling for large lists
- Debounced search inputs
- Optimistic UI updates
- Service worker caching

**Bundle Optimization:**
```bash
# Analyze bundle size
npm run build
npm run analyze
```

---

## 🛠️ Development Tools

### Available Scripts

**Root Directory:**
```bash
npm run install:all    # Install all dependencies
npm run dev           # Run both frontend and backend
npm run build         # Build both applications
```

**Backend:**
```bash
npm run dev           # Start development server
npm run build         # Build TypeScript
npm start             # Start production server
npm run seed          # Seed database
npm run clean         # Clean build directory
```

**Frontend:**
```bash
npm run dev           # Start development server
npm run build         # Build for production
npm start             # Start production server
npm run lint          # Run ESLint
```

### Database Scripts

**Seed Data:**
```bash
cd backend
npm run seed                              # Seed test data
node scripts/seed-comprehensive-data.js   # Comprehensive data
node scripts/seed-multi-industry.js       # Multi-industry data
```

**Database Utilities:**
```bash
node scripts/debug_db.ts                  # Debug database
node scripts/fetch_users.js               # Fetch users
node scripts/create_admin.ts              # Create admin user
```

### Code Quality

**ESLint Configuration:**
```json
{
  "extends": ["next/core-web-vitals"],
  "rules": {
    "no-console": "warn",
    "no-unused-vars": "error"
  }
}
```

**TypeScript Configuration:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true
  }
}
```

---

## 🤝 Contributing

We welcome contributions to improve the ERP system!

### How to Contribute

1. **Fork the Repository**
```bash
git clone https://github.com/your-username/erp-system.git
cd erp-system
```

2. **Create a Feature Branch**
```bash
git checkout -b feature/amazing-feature
```

3. **Make Your Changes**
- Write clean, documented code
- Follow existing code style
- Add tests for new features
- Update documentation

4. **Commit Your Changes**
```bash
git add .
git commit -m "Add amazing feature"
```

5. **Push to Your Fork**
```bash
git push origin feature/amazing-feature
```

6. **Open a Pull Request**
- Describe your changes
- Reference any related issues
- Wait for review

### Coding Standards

**TypeScript:**
- Use TypeScript for all new code
- Define proper interfaces and types
- Avoid `any` type when possible

**React Components:**
- Use functional components with hooks
- Implement proper prop types
- Follow component naming conventions

**API Design:**
- RESTful endpoint design
- Consistent response format
- Proper error handling
- API versioning

**Git Commit Messages:**
```
feat: Add new feature
fix: Fix bug
docs: Update documentation
style: Format code
refactor: Refactor code
test: Add tests
chore: Update dependencies
```

---

## 📖 Additional Documentation

- [API Fixes Summary](Documentation/API_FIXES_SUMMARY.md)
- [Employee & Project Management](Documentation/EMPLOYEE_PROJECT_MANAGEMENT.md)
- [Task Management System](Documentation/TASK_MANAGEMENT.md)
- [Attendance System Fix](ATTENDANCE_FIX_README.md)
- [Employee Management Fix](EMPLOYEE_MANAGEMENT_FIX_README.md)
- [Socket Deployment Fix](SOCKET_DEPLOYMENT_FIX.md)
- [Socket Fix Guide](SOCKET_FIX_GUIDE.md)
- [Deployment Guide](DEPLOYMENT.md)

---

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Error:**
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:**
- Ensure MongoDB is running: `mongod`
- Check MONGO_URI in .env file
- Verify network connectivity

**Port Already in Use:**
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:**
```bash
# Find process using port
lsof -i :5000
# Kill process
kill -9 <PID>
```

**JWT Token Error:**
```
Error: jwt malformed
```
**Solution:**
- Check JWT_SECRET is set in .env
- Verify token format
- Clear browser cookies and login again

**CORS Error:**
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution:**
- Check CORS_ORIGIN in backend .env
- Verify frontend URL matches
- Clear browser cache

**Build Errors:**
```
Module not found
```
**Solution:**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

### Debug Mode

**Backend Debug:**
```bash
npm run dev:debug
```

**Frontend Debug:**
- Open browser DevTools
- Check Console for errors
- Use React DevTools extension

### Getting Help

1. Check existing documentation
2. Search closed issues on GitHub
3. Open a new issue with:
   - Error message
   - Steps to reproduce
   - Environment details
   - Screenshots (if applicable)

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 ERP System

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙏 Acknowledgments

- **Next.js Team** - Amazing React framework
- **Vercel** - Hosting and deployment platform
- **MongoDB** - Flexible NoSQL database
- **Shadcn** - Beautiful UI components
- **Open Source Community** - For all the amazing libraries

---

## 📞 Support

For support and questions:

- **Documentation**: Check the `/Documentation` folder
- **Issues**: Open an issue on GitHub
- **Email**: support@erp-system.com
- **Discord**: Join our community server

---

## 🗺️ Roadmap

### Version 2.0 (Planned)

- [ ] Mobile application (React Native)
- [ ] Advanced analytics with AI/ML
- [ ] Multi-company support
- [ ] Advanced workflow automation
- [ ] Integration marketplace
- [ ] Custom report builder
- [ ] Advanced permissions system
- [ ] Multi-language support
- [ ] Dark mode enhancements
- [ ] Offline mode support

### Version 2.1 (Future)

- [ ] Blockchain integration for audit trails
- [ ] Advanced forecasting and predictions
- [ ] IoT device integration
- [ ] Voice commands and AI assistant
- [ ] Advanced data visualization
- [ ] Custom module builder
- [ ] API marketplace
- [ ] White-label solution

---

## 📈 Project Statistics

- **Total Lines of Code**: 50,000+
- **Backend Controllers**: 40+
- **Database Models**: 50+
- **Frontend Pages**: 30+
- **React Components**: 100+
- **API Endpoints**: 150+
- **Supported Modules**: 12+

---

## 🌟 Features Highlight

### What Makes This ERP Special?

✅ **Modern Technology Stack** - Built with latest technologies
✅ **Real-time Updates** - WebSocket integration for live data
✅ **Beautiful UI** - Modern, responsive design
✅ **Comprehensive** - All business modules in one place
✅ **Secure** - Enterprise-grade security
✅ **Scalable** - Designed to grow with your business
✅ **Well-Documented** - Extensive documentation
✅ **Open Source** - Free to use and modify
✅ **Active Development** - Regular updates and improvements
✅ **Production Ready** - Battle-tested and reliable

---

## 💡 Use Cases

### Industries

- **IT & Software Companies** - Project management, time tracking, sprint management
- **Manufacturing** - Production planning, inventory, quality control
- **Services** - Appointment scheduling, subscription management
- **Retail** - Inventory management, order processing, customer management
- **Consulting** - Project tracking, time billing, client management
- **Healthcare** - Appointment scheduling, patient records, billing
- **Education** - Student management, course scheduling, fee management

### Company Sizes

- **Startups** (1-10 employees) - Basic features, easy setup
- **Small Business** (10-50 employees) - Full feature set
- **Medium Enterprise** (50-200 employees) - Advanced features, multi-department
- **Large Enterprise** (200+ employees) - Enterprise features, scalability

---

## 🎓 Learning Resources

### For Developers

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [MongoDB University](https://university.mongodb.com/)
- [React Documentation](https://react.dev/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)

### For Users

- User manual (coming soon)
- Video tutorials (coming soon)
- FAQ section (coming soon)
- Best practices guide (coming soon)

---

**Built with ❤️ by developers, for businesses**

**⭐ Star this repository if you find it helpful!**

---

*Last Updated: January 2024*
*Version: 1.0.0*
