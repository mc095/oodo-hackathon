'use client';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { PlusCircle } from 'lucide-react';
import { expenses as mockExpenses } from '@/lib/data';
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

export default function ExpensesPage() {
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);

  const handleNewExpense = () => {
    setIsSheetOpen(true);
  };
  
  const handleFormSubmit = () => {
    // Here you would handle form submission, e.g., refetch data
    setIsSheetOpen(false);
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Expenses">
        <Button onClick={handleNewExpense}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Expense
        </Button>
      </PageHeader>
      <DataTable columns={columns} data={mockExpenses} />
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
