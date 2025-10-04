# 🚀 ExpenseFlow - Modern Expense Management System

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-15.3.3-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/MySQL-8.0-orange?style=for-the-badge&logo=mysql" alt="MySQL" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Google%20Gemini-AI-4285F4?style=for-the-badge&logo=google" alt="Google Gemini AI" />
</div>

## 🌟 Overview

**ExpenseFlow** is a cutting-edge expense management system that revolutionizes how companies handle expense reimbursements. Built with modern web technologies and powered by AI, it provides a seamless, transparent, and efficient expense management experience.

### ✨ Key Features

- 🤖 **AI-Powered Receipt OCR** - Automatically extract expense details from receipt images
- 💱 **Multi-Currency Support** - Real-time currency conversion with live exchange rates
- 🔄 **Flexible Approval Workflows** - Configurable multi-level approval processes
- 📊 **Smart Analytics** - Comprehensive expense tracking and reporting
- 👥 **Role-Based Access Control** - Secure permissions for Admin, Manager, and Employee roles
- 🎯 **Conditional Approval Rules** - Percentage-based and specific approver rules
- 📱 **Modern UI/UX** - Beautiful, responsive interface built with Radix UI

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 15, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, MySQL 8.0
- **AI/ML**: Google Gemini AI for OCR and expense processing
- **UI Components**: Radix UI, Lucide React Icons
- **State Management**: React Hooks, Custom Hooks
- **Form Handling**: React Hook Form with Zod validation

### Database Schema
- **Users** - User accounts with roles and relationships
- **Companies** - Company information and settings
- **Expenses** - Expense records with status tracking
- **Approval Workflows** - Configurable approval processes
- **Approval Rules** - Conditional approval logic
- **Sessions** - Authentication session management

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MySQL 8.0+
- Google Gemini API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd oodo-hackathon
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create `.env.local` file:
   ```env
   # MySQL Database Configuration
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=expenseflow
   DB_PORT=3306

   # Google Gemini API Key
   GOOGLE_GENAI_API_KEY=your_gemini_api_key_here
   ```

4. **Set up MySQL database**
   ```sql
   CREATE DATABASE expenseflow;
   ```

5. **Initialize the database**
   ```bash
   npm run dev
   # In another terminal:
   curl -X POST http://localhost:3000/api/init
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Access the application**
   Open [http://localhost:3000](http://localhost:3000)

## 🎯 Core Workflows

### 1. Expense Submission Flow
```
Employee → Scan Receipt (AI OCR) → Fill Form → Submit → Approval Workflow
```

### 2. Approval Workflow
```
Expense Created → First Approver → Sequential Approval → Final Decision
```

### 3. Conditional Rules
```
Rules Evaluation → Auto-Approval (if conditions met) → Manual Review (if needed)
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript checks
- `npm run init-db` - Initialize database
- `npm run genkit:dev` - Start AI development server

## 📱 Features Breakdown

### 🔐 Authentication & User Management
- **Auto-company Creation**: New companies created automatically on first signup
- **Role-based Access**: Admin, Manager, Employee with specific permissions
- **Session Management**: Secure token-based authentication

### 💰 Expense Management
- **Multi-currency Support**: Submit expenses in any currency
- **Real-time Conversion**: Live currency conversion to company default
- **OCR Integration**: AI-powered receipt scanning and data extraction
- **Status Tracking**: Pending → Approved/Rejected workflow

### ⚙️ Approval System
- **Multi-level Workflows**: Configurable approval sequences
- **Conditional Rules**: Percentage-based and specific approver rules
- **Manager Priority**: Manager approval before other approvers
- **Comments & Feedback**: Rich approval comments system

### 📊 Analytics & Reporting
- **Dashboard Overview**: Real-time expense statistics
- **Team Analytics**: Manager view of team expenses
- **Status Tracking**: Visual approval progress
- **Export Capabilities**: Data export for accounting

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/signup-company` - Company signup
- `GET /api/auth/me` - Get current user

### Expenses
- `GET /api/expenses` - Get expenses (role-based)
- `POST /api/expenses` - Create expense
- `GET /api/expenses/[id]` - Get specific expense
- `PUT /api/expenses/[id]` - Update expense

### Approval System
- `GET /api/approval-workflows` - Get workflows
- `POST /api/approval-workflows` - Create workflow
- `GET /api/approval-rules` - Get approval rules
- `POST /api/approval-rules` - Create approval rule
- `GET /api/expense-approvals` - Get pending approvals
- `POST /api/expense-approvals` - Process approval

### Utilities
- `GET /api/currency/convert` - Currency conversion
- `GET /api/countries` - Get countries and currencies

## 🎨 UI Components

Built with modern design principles:
- **Responsive Design**: Mobile-first approach
- **Dark/Light Mode**: Theme support
- **Accessibility**: WCAG compliant components
- **Performance**: Optimized rendering and loading

## 🔒 Security Features

- **Authentication**: Secure session-based auth
- **Authorization**: Role-based access control
- **Data Validation**: Zod schema validation
- **SQL Injection Protection**: Parameterized queries
- **CORS Configuration**: Proper cross-origin setup

## 🚀 Deployment

### Production Build
```bash
npm run build
npm run start
```

### Environment Variables (Production)
```env
NODE_ENV=production
DB_HOST=your_production_db_host
DB_USER=your_production_db_user
DB_PASSWORD=your_production_db_password
DB_NAME=expenseflow
GOOGLE_GENAI_API_KEY=your_production_gemini_key
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini AI** for powerful OCR capabilities
- **Radix UI** for accessible component primitives
- **Next.js Team** for the amazing framework
- **Tailwind CSS** for utility-first styling


---

<div align="center">
  <p>Built with ❤️ by the ExpenseFlow Team</p>
  <p>⭐ Star this repository if you found it helpful!</p>
</div>


---

## 👥 Team Details

**Team Name:** Oodo Hackers  
**Reviewer:** Aman Patel (ampa)  

### 🧑‍💻 Team Members

- **Prasanna Kumar Raparla** *(Team Leader)*  
  Email: prasannakumar0396@gmail.com  
  Phone: 9392693465  
  Passing Year: 2026

- **Ganesh Vathumilli**  
  Email: 22a81a05q0@sves.org.in  
  Phone: 8008149866  
  Passing Year: 2026

- **Rasmitha Lekha Rambha**  
  Email: rambhasmeth7024@gmail.com  
  Phone: 9121487799  
  Passing Year: 2026

- **Andra Tulasi Lakshmi Tanya**  
  Email: tanyakonapala@gmail.com  
  Phone: 6302601497  
  Passing Year: 2026

---

## 🎥 Video Presentation

**Link:** [(https://drive.google.com/uc?id=1iT63sjANfBtaLRuIyIMh_D4w1rOvfR5i&export=download)]  

---

