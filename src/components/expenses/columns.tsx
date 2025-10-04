'use client';

import { ColumnDef } from '@tanstack/react-table';
import {
  ArrowUpDown,
  MoreHorizontal,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Expense, User } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { useCollection } from '@/lib/mysql-index';

const StatusIcon = ({ status }: { status: Expense['status'] }) => {
  switch (status) {
    case 'Approved':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'Pending':
      return <Clock className="h-4 w-4 text-yellow-500" />;
    case 'Rejected':
      return <XCircle className="h-4 w-4 text-red-500" />;
    default:
      return null;
  }
};

const UserCell = ({ userId }: { userId: string }) => {
    const { data: users, isLoading } = useCollection<User>('/api/users');

    const user = React.useMemo(() => users?.find(u => u.id === userId), [users, userId]);

    if (isLoading) return 'Loading...';
    if (!user) return 'Unknown User';

    return (
        <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="person portrait" />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className='font-medium'>{user.name}</span>
        </div>
    );
};


export const columns: ColumnDef<Expense>[] = [
  {
    accessorKey: 'vendor',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Vendor
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: 'userId',
    header: 'Submitted By',
    cell: ({ row }) => {
      const userId = row.original.userId;
      return <UserCell userId={userId} />;
    },
  },
  {
    accessorKey: 'amount',
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('amount'));
      return (
        <div className="text-right font-medium">
          {formatCurrency(amount, row.original.currency)}
        </div>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as Expense['status'];
      return (
        <Badge variant={status === 'Approved' ? 'default' : status === 'Rejected' ? 'destructive' : 'secondary'} className='capitalize'>
            <StatusIcon status={status} />
            <span className='ml-2'>{status}</span>
        </Badge>
      );
    },
  },
  {
    accessorKey: 'date',
    header: 'Date',
    cell: ({ row }) => {
      return <span>{formatDate(row.getValue('date'))}</span>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const expense = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(expense.id)}
            >
              Copy expense ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View details</DropdownMenuItem>
            <DropdownMenuItem>Approve</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              Reject
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
