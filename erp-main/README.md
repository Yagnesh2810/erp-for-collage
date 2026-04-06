# 🏢 ERP Management System

A comprehensive Enterprise Resource Planning (ERP) system built with modern web technologies. This full-stack application manages employees, projects, inventory, customers, suppliers, and more with real-time updates and role-based access control.

## 🏗️ Project Structure

```
erp-main/
├── frontend/         # Next.js React application
├── backend/          # Express.js API server
├── Documentation/    # Project documentation
└── scripts/         # Database seeding and utility scripts
```

## 🚀 Technology Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe JavaScript development
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Modern React component library
- **Recharts** - Data visualization and charts
- **Socket.IO Client** - Real-time communication
- **React Hook Form** - Form handling and validation
- **Framer Motion** - Animation library

### Backend
- **Express.js** - Node.js web framework
- **TypeScript** - Type-safe server development
- **MongoDB** - NoSQL database with Mongoose ODM
- **Socket.IO** - Real-time WebSocket communication
- **JWT** - JSON Web Token authentication
- **bcryptjs** - Password hashing
- **Winston** - Logging library
- **Helmet** - Security middleware

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v22.x recommended)
- **npm** (v10.0.0+)
- **MongoDB** (local or cloud instance)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd erp-main
```

2. **Backend Setup**
```bash
cd backend
npm install

# Create environment file
cp .env.example .env
# Edit .env with your configuration
```

3. **Frontend Setup**
```bash
cd ../frontend
npm install

# Create environment file
echo "NEXT_PUBLIC_API_URL=http://localhost:5000" > .env.local
```

4. **Database Setup**
```bash
# Seed initial data (optional)
cd backend
npm run seed
```

## 🎮 Running the Application

### Development Mode

1. **Start the Backend**:
```bash
cd backend
npm run dev
```
Backend runs on: http://localhost:5000

2. **Start the Frontend**:
```bash
cd frontend
npm run dev
```
Frontend runs on: http://localhost:3000

### Production Mode

1. **Build and Start Backend**:
```bash
cd backend
npm run build
npm start
```

2. **Build and Start Frontend**:
```bash
cd frontend
npm run build
npm start
```

## ✨ Core Features

### 👥 Employee Management
- Complete employee lifecycle management
- Attendance tracking with check-in/check-out
- Leave management system
- Employee reports and analytics
- Real-time attendance statistics

### 📊 Project Management
- Project creation and tracking
- Task assignment and management
- Kanban-style task boards
- Project analytics and reporting
- Team collaboration features

### 📦 Inventory Management
- Product catalog management
- Stock level tracking
- Inventory adjustments
- Low stock alerts
- Inventory transaction history

### 🛒 Order Management
- Order creation and processing
- Order status tracking
- Customer order history
- Order analytics

### 👤 Customer & Supplier Management
- Customer relationship management
- Supplier information tracking
- Contact management system
- Communication history

### 🔐 Authentication & Authorization
- JWT-based authentication
- Role-based access control (RBAC)
- User management
- Permission system

### 📈 Analytics & Reporting
- Real-time dashboards
- Business intelligence reports
- Data visualization
- Export capabilities

### 🔄 Real-time Features
- Live updates via WebSocket
- Real-time notifications
- Collaborative editing
- Activity logging

## 🔌 API Endpoints

Base URL: `http://localhost:5000/api`

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `GET /auth/me` - Get current user info

### Employee Management
- `GET /employees` - Get all employees
- `POST /employees` - Create new employee
- `GET /employees/:id` - Get employee by ID
- `PUT /employees/:id` - Update employee
- `DELETE /employees/:id` - Delete employee

### Attendance
- `GET /attendance` - Get attendance records
- `POST /attendance/checkin` - Employee check-in
- `POST /attendance/checkout` - Employee check-out
- `GET /attendance/today-stats` - Today's attendance statistics

### Project Management
- `GET /projects` - Get all projects
- `POST /projects` - Create new project
- `GET /projects/:id` - Get project by ID
- `PUT /projects/:id` - Update project
- `DELETE /projects/:id` - Delete project
- `GET /projects/:id/tasks` - Get project tasks

### Task Management
- `GET /tasks` - Get all tasks
- `POST /tasks` - Create new task
- `GET /tasks/:id` - Get task by ID
- `PUT /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task
- `POST /tasks/:id/comments` - Add task comment

### Inventory Management
- `GET /inventory` - Get inventory items
- `POST /inventory` - Add inventory item
- `GET /inventory/:id` - Get inventory item by ID
- `PUT /inventory/:id` - Update inventory item
- `PUT /inventory/:id/adjust` - Adjust inventory levels

### Product Management
- `GET /products` - Get all products
- `POST /products` - Create new product
- `GET /products/:id` - Get product by ID
- `PUT /products/:id` - Update product
- `DELETE /products/:id` - Delete product

### Order Management
- `GET /orders` - Get all orders
- `POST /orders` - Create new order
- `GET /orders/:id` - Get order by ID
- `PUT /orders/:id` - Update order
- `DELETE /orders/:id` - Delete order

### Customer Management
- `GET /customers` - Get all customers
- `POST /customers` - Create new customer
- `GET /customers/:id` - Get customer by ID
- `PUT /customers/:id` - Update customer
- `DELETE /customers/:id` - Delete customer

### Supplier Management
- `GET /suppliers` - Get all suppliers
- `POST /suppliers` - Create new supplier
- `GET /suppliers/:id` - Get supplier by ID
- `PUT /suppliers/:id` - Update supplier
- `DELETE /suppliers/:id` - Delete supplier

### Contact Management
- `GET /contacts` - Get all contacts
- `POST /contacts` - Create new contact
- `GET /contacts/:id` - Get contact by ID
- `PUT /contacts/:id` - Update contact
- `DELETE /contacts/:id` - Delete contact

### Analytics & Reports
- `GET /analytics/dashboard` - Dashboard statistics
- `GET /reports/employees` - Employee reports
- `GET /reports/projects` - Project reports
- `GET /reports/inventory` - Inventory reports

## 👑 User Roles & Permissions

### Role Hierarchy
1. **ROOT** - System administrator with full access
2. **SUPER_ADMIN** - Administrative access to all modules
3. **ADMIN** - Department-level administrative access
4. **MANAGER** - Team and project management access
5. **EMPLOYEE** - Basic user access to assigned tasks
6. **NORMAL** - Limited access to personal data

### Permission System
- **RBAC (Role-Based Access Control)** implementation
- **Module-level permissions** for different system areas
- **Action-level permissions** (create, read, update, delete)
- **Data-level permissions** for sensitive information

## 🧠 Project Architecture

### Backend Structure
```
backend/
├── src/
│   ├── controllers/    # Business logic handlers
│   ├── middleware/     # Authentication, validation, error handling
│   ├── models/         # MongoDB schemas and models
│   ├── routes/         # API route definitions
│   ├── utils/          # Helper functions and utilities
│   └── server.ts       # Application entry point
├── scripts/            # Database seeding and utilities
└── public/             # Static assets
```

### Frontend Structure
```
frontend/
├── src/
│   ├── app/            # Next.js App Router pages
│   │   ├── dashboard/  # Main application dashboard
│   │   ├── login/      # Authentication pages
│   │   └── signup/     # User registration
│   ├── components/     # Reusable React components
│   ├── lib/            # Utility functions and API clients
│   ├── hooks/          # Custom React hooks
│   ├── contexts/       # React context providers
│   └── types/          # TypeScript type definitions
```

## 📊 Dashboard Features

### Analytics Dashboard
- **Employee Statistics** - Active employees, attendance rates
- **Project Progress** - Task completion, project timelines
- **Inventory Levels** - Stock status, low inventory alerts
- **Order Analytics** - Sales trends, order status distribution
- **Performance Metrics** - KPIs and business intelligence

### Real-time Updates
- **Live Statistics** - Auto-updating dashboard metrics
- **WebSocket Integration** - Real-time data synchronization
- **Activity Feeds** - Live system activity logs
- **Notifications** - Instant alerts and updates

## 🔧 Environment Configuration

### Backend Environment Variables (.env)
```env
# Database
MONGO_URI=mongodb://localhost:27017/erp-system
# or MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/erp-system

# Server
PORT=5000
NODE_ENV=development

# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3000
FRONTEND_URL=http://localhost:3000
```

### Frontend Environment Variables (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## 🧪 Testing

### API Testing
```bash
# Test all API endpoints
node test-backend.js
```

### Manual Testing
1. **Authentication Flow**
   - Register new user
   - Login with credentials
   - Access protected routes

2. **Employee Management**
   - Create employee records
   - Track attendance
   - Manage leave requests

3. **Project Management**
   - Create projects
   - Assign tasks
   - Track progress

4. **Real-time Features**
   - Test WebSocket connections
   - Verify live updates
   - Check notifications

## 🚀 Deployment

### Production Checklist
- [ ] Set production environment variables
- [ ] Configure MongoDB production instance
- [ ] Set up SSL certificates
- [ ] Configure reverse proxy (nginx)
- [ ] Set up monitoring and logging
- [ ] Configure backup strategies

### Deployment Platforms
- **Backend**: Heroku, AWS EC2, DigitalOcean
- **Frontend**: Vercel, Netlify, AWS S3 + CloudFront
- **Database**: MongoDB Atlas, AWS DocumentDB

## 📚 Documentation

For detailed documentation, see:
- [API Fixes Summary](API_FIXES_SUMMARY.md)
- [Employee & Project Management](EMPLOYEE_PROJECT_MANAGEMENT.md)
- [Task Management System](TASK_MANAGEMENT.md)
- [Attendance System Fix](../ATTENDANCE_FIX_README.md)
- [Employee Management Fix](../EMPLOYEE_MANAGEMENT_FIX_README.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
1. Check the documentation files
2. Review the API endpoints
3. Check the troubleshooting section in API_FIXES_SUMMARY.md
4. Submit an issue with detailed information

---

**Built with ❤️ using modern web technologies**