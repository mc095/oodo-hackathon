import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { expenses, getUserById } from '@/lib/data';
import { formatCurrency } from '@/lib/utils';

export function RecentExpenses() {
    const recentExpenses = expenses.slice(0, 5);

  return (
    <div className="space-y-8">
        {recentExpenses.map(expense => {
            const user = getUserById(expense.userId);
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
