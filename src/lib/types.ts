export type UserRole = 'Admin' | 'Manager' | 'Employee';

export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: UserRole;
  managerId?: string;
  companyId?: string;
  companyName?: string;
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
    country: string;
};

export type ApprovalWorkflow = {
    id: string;
    companyId: string;
    name: string;
    isActive: boolean;
    steps: ApprovalStep[];
    createdAt: string;
    updatedAt: string;
};

export type ApprovalStep = {
    id: string;
    workflowId: string;
    stepOrder: number;
    approverType: 'Manager' | 'Finance' | 'Director' | 'Specific_User';
    specificUserId?: string;
    isManagerApprover: boolean;
    createdAt: string;
};

export type ApprovalRule = {
    id: string;
    companyId: string;
    ruleType: 'Percentage' | 'Specific_Approver' | 'Hybrid';
    percentageThreshold?: number;
    specificApproverId?: string;
    hybridPercentage?: number;
    hybridApproverId?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
};

export type ExpenseApprovalRequest = {
    id: string;
    expenseId: string;
    currentApproverId: string;
    stepOrder: number;
    status: 'Pending' | 'Approved' | 'Rejected';
    comment?: string;
    createdAt: string;
    updatedAt: string;
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
