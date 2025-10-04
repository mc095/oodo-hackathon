export type UserRole = 'Admin' | 'Manager' | 'Employee';

export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: UserRole;
  managerId?: string;
};

export type ExpenseStatus = 'Pending' | 'Approved' | 'Rejected';

export type Expense = {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  category: string;
  description: string;
  date: string; // ISO 8601 format
  status: ExpenseStatus;
  vendor: string;
  approvers: { userId: string, status: 'Pending' | 'Approved' | 'Rejected', comment?: string }[];
};

export type Company = {
    id: string;
    name: string;
    currency: string;
};

// For currency API
export type CurrencyInfo = {
  [key: string]: string;
};
export type Country = {
  name: {
    common: string;
  };
  currencies: {
    [key: string]: {
      name: string;
      symbol: string;
    };
  };
};
