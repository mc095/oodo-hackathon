import mysql from 'mysql2/promise';

export interface DatabaseConfig {
  host: string;
  user: string;
  password: string;
  database: string;
  port?: number;
}

const config: DatabaseConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root', // Use 'root' as password based on test
  database: process.env.DB_NAME || 'expenseflow',
  port: parseInt(process.env.DB_PORT || '3306'),
};

let pool: mysql.Pool;

export function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool({
      ...config,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
  return pool;
}

export async function initializeDatabase() {
  const pool = getPool();
  
  // Create tables if they don't exist
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      avatar_url VARCHAR(500),
      role ENUM('Admin', 'Manager', 'Employee') DEFAULT 'Employee',
      manager_id VARCHAR(36),
      company_id VARCHAR(36),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    )
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS expenses (
      id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
      user_id VARCHAR(36) NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      currency VARCHAR(3) DEFAULT 'USD',
      category VARCHAR(100) NOT NULL,
      description TEXT,
      date DATE NOT NULL,
      status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
      vendor VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS expense_approvers (
      id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
      expense_id VARCHAR(36) NOT NULL,
      approver_id VARCHAR(36) NOT NULL,
      status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
      comment TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE CASCADE,
      FOREIGN KEY (approver_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS companies (
      id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
      name VARCHAR(255) NOT NULL UNIQUE,
      currency VARCHAR(3) DEFAULT 'USD',
      country VARCHAR(2) DEFAULT 'US',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS sessions (
      id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
      user_id VARCHAR(36) NOT NULL,
      token VARCHAR(255) UNIQUE NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Approval workflow tables
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS approval_workflows (
      id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
      company_id VARCHAR(36) NOT NULL,
      name VARCHAR(255) NOT NULL,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    )
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS approval_steps (
      id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
      workflow_id VARCHAR(36) NOT NULL,
      step_order INT NOT NULL,
      approver_type ENUM('Manager', 'Finance', 'Director', 'Specific_User') NOT NULL,
      specific_user_id VARCHAR(36),
      is_manager_approver BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (workflow_id) REFERENCES approval_workflows(id) ON DELETE CASCADE,
      FOREIGN KEY (specific_user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS approval_rules (
      id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
      company_id VARCHAR(36) NOT NULL,
      rule_type ENUM('Percentage', 'Specific_Approver', 'Hybrid') NOT NULL,
      percentage_threshold DECIMAL(5,2),
      specific_approver_id VARCHAR(36),
      hybrid_percentage DECIMAL(5,2),
      hybrid_approver_id VARCHAR(36),
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      FOREIGN KEY (specific_approver_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (hybrid_approver_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS expense_approval_requests (
      id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
      expense_id VARCHAR(36) NOT NULL,
      current_approver_id VARCHAR(36) NOT NULL,
      step_order INT NOT NULL,
      status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
      comment TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE CASCADE,
      FOREIGN KEY (current_approver_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Insert default admin user if no users exist
  const [users] = await pool.execute('SELECT COUNT(*) as count FROM users');
  const userCount = (users as any)[0].count;
  
  if (userCount === 0) {
    await pool.execute(`
      INSERT INTO users (id, name, email, role) 
      VALUES (UUID(), 'Admin User', 'admin@expenseflow.com', 'Admin')
    `);
  }
}
