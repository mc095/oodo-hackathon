# ExpenseFlow Setup Guide

This application has been migrated from Firebase to MySQL. Here's how to set up and run both the backend and frontend.

## Prerequisites

1. **Node.js** (v18 or higher)
2. **MySQL** (v8.0 or higher)
3. **npm** or **yarn**

## Database Setup

### 1. Install MySQL
- Download and install MySQL from: https://dev.mysql.com/downloads/mysql/
- Make sure MySQL server is running

### 2. Create Database
```sql
CREATE DATABASE expenseflow;
```

### 3. Environment Configuration
Create a `.env.local` file in the project root:

```env
# MySQL Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=expenseflow
DB_PORT=3306
```

Replace `your_mysql_password` with your actual MySQL root password.

## Running the Application

### 1. Install Dependencies
```bash
npm install
```

### 2. Initialize Database
```bash
npm run init-db
```

This will:
- Create all necessary tables
- Insert a default admin user
- Set up the database schema

### 3. Start the Development Server
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:9002
- API: http://localhost:9002/api

## Login Credentials

Default admin credentials:
- **Email**: admin@expenseflow.com
- **Password**: password

## Available Scripts

- `npm run dev` - Start development server on port 9002
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript checks

## Project Structure

```
src/
├── app/
│   ├── api/               # Next.js API routes (backend)
│   │   ├── auth/          # Authentication endpoints
│   │   ├── users/         # User management
│   │   ├── expenses/      # Expense management
│   │   └── init/          # Database initialization
│   ├── login/             # Login page
│   ├── expenses/          # Expense management page
│   ├── team/              # Team management page
│   └── settings/          # Settings page
├── components/            # React components
├── lib/
│   ├── mysql.ts          # MySQL connection and schema
│   ├── auth.ts           # Authentication system
│   ├── data-api.ts       # API client
│   └── mysql-index.ts    # MySQL exports
└── hooks/
    ├── use-data.ts       # Data fetching hooks
    └── use-mysql.ts      # MySQL query hooks
```

## Key Features

✅ **Authentication System**
- MySQL-based user authentication
- Session management
- Login/logout functionality

✅ **User Management**
- Create, read, update, delete users
- Role-based access (Admin, Manager, Employee)
- Manager-employee relationships

✅ **Expense Management**
- Submit expenses
- Track expense status (Pending, Approved, Rejected)
- Expense categories and descriptions
- Currency support

✅ **Team Management**
- View team members
- Add new users
- Role assignment

✅ **Dashboard**
- Overview of recent expenses
- User statistics

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check MySQL is running
   - Verify credentials in `.env.local`
   - Ensure database exists

2. **Port Already in Use**
   - Change port in `package.json` scripts
   - Or kill the process using port 9002

3. **Authentication Issues**
   - Make sure database is initialized
   - Check user exists in database
   - Verify session management

### Database Reset
To reset the database:
```sql
DROP DATABASE expenseflow;
CREATE DATABASE expenseflow;
```
Then run `npm run init-db` again.

## Production Deployment

1. Build the application: `npm run build`
2. Set environment variables for production
3. Use a production MySQL database
4. Configure proper CORS and security settings
5. Run `npm run start`

## Migration Summary

This application has been successfully migrated from:
- **Firebase Authentication** → **MySQL-based Auth System**
- **Firestore** → **MySQL Database**
- **Firebase Hosting** → **Next.js App Router**

All buttons and functionality have been preserved and updated to work with the new MySQL backend.
