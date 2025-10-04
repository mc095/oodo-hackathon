'use client';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { PlusCircle } from 'lucide-react';
import { DataTable } from '@/components/expenses/data-table';
import { columns } from '@/components/expenses/columns';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ExpenseForm } from '@/components/expenses/expense-form';
import { Expense } from '@/lib/types';
import { useCollection, useUser } from '@/lib/mysql-index';
import { DataAPI } from '@/lib/data-api';

export default function ExpensesPage() {
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const { data: user } = useUser();
  const { data: expenses, isLoading } = useCollection<Expense>('/api/expenses');

  const sortedExpenses = React.useMemo(() => {
    if (!expenses) return [];
    // Create a new array to avoid mutating the original
    return [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses]);


  const handleNewExpense = () => {
    setIsSheetOpen(true);
  };
  
  const handleFormSubmit = async (newExpense: Omit<Expense, 'id' | 'approvers' | 'status' | 'userId'>) => {
    if (!user) return;
    
    const newExpenseWithDetails: Omit<Expense, 'id'> = {
      ...newExpense,
      userId: user.id,
      status: 'Pending',
      approvers: [], // Simplified for now
    };

    try {
        await DataAPI.createExpense(newExpenseWithDetails);
        setIsSheetOpen(false);
        // Refresh the page or trigger a reload of data
        window.location.reload();
    } catch(e) {
        console.error("Error adding expense: ", e);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Expenses">
        <Button onClick={handleNewExpense}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Expense
        </Button>
      </PageHeader>
      <DataTable columns={columns} data={sortedExpenses} />
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full max-w-2xl sm:w-[800px] sm:max-w-none overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="font-headline">Submit Expense</SheetTitle>
            <SheetDescription>
              Fill out the details or scan a receipt to get started.
            </SheetDescription>
          </SheetHeader>
          <ExpenseForm onSubmitSuccess={handleFormSubmit} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
