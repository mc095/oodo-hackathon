'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCollection } from '@/lib/mysql-index';
import { Expense, User } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import React from 'react';

export function RecentExpenses() {
    const { data: expenses, isLoading: expensesLoading } = useCollection<Expense>('/api/expenses');
    const { data: users, isLoading: usersLoading } = useCollection<User>('/api/users');

    const usersById = React.useMemo(() => {
        if (!users) return {};
        return users.reduce((acc, user) => {
            acc[user.id] = user;
            return acc;
        }, {} as { [key: string]: User });
    }, [users]);

    if (expensesLoading || usersLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="space-y-8">
            {expenses?.map(expense => {
                const user = usersById[expense.userId];
                if (!user) return null;
                return (
                    <div key={expense.id} className="flex items-center">
                        <Avatar className="h-9 w-9">
                            <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="person portrait" />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="ml-4 space-y-1">
                            <p className="text-sm font-medium leading-none">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{expense.vendor}</p>
                        </div>
                        <div className="ml-auto font-medium">{formatCurrency(expense.amount, expense.currency)}</div>
                    </div>
                )
            })}
        </div>
    );
}
