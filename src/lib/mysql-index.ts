// MySQL-based replacements for Firebase functionality

export * from './auth';
export * from './data-api';

// Export custom hooks
export { useCollection, useDoc, useUsers, useExpenses, useExpense } from '../hooks/use-data';
export { useApiQuery, useApiMutation } from '../hooks/use-mysql';

// For backward compatibility, provide these exports that components expect
export { AuthProvider as FirebaseClientProvider } from './auth';
export { useUser, useAuth } from './auth';
