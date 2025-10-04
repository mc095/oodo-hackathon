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
import { useCollection, useFirestore, useUser } from '@/firebase';
import { addDoc, collection } from 'firebase/firestore';

export default function ExpensesPage() {
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const firestore = useFirestore();
  const { data: user } = useUser();
  const { data: expenses, isLoading } = useCollection<Expense>(
    firestore ? collection(firestore, 'expenses') : null
  );

  const sortedExpenses = React.useMemo(() => {
    if (!expenses) return [];
    // Create a new array to avoid mutating the original
    return [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses]);


  const handleNewExpense = () => {
    setIsSheetOpen(true);
  };
  
  const handleFormSubmit = async (newExpense: Omit<Expense, 'id' | 'approvers' | 'status' | 'userId'>) => {
    if (!firestore || !user) return;
    
    const newExpenseWithDetails: Omit<Expense, 'id'> = {
      ...newExpense,
      userId: user.uid,
      status: 'Pending',
      approvers: [], // Simplified for now
    };

    try {
        await addDoc(collection(firestore, 'expenses'), newExpenseWithDetails);
        setIsSheetOpen(false);
    } catch(e) {
        console.error("Error adding document: ", e);
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
