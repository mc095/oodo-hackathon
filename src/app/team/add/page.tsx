
'use client';
import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useCollection, useFirestore } from '@/firebase';
import { addDoc, collection } from 'firebase/firestore';
import { User, UserRole } from '@/lib/types';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email address.'),
  role: z.enum(['Admin', 'Manager', 'Employee']),
  managerId: z.string().optional(),
});

type UserFormValues = z.infer<typeof formSchema>;

export default function AddUserPage() {
  const { toast } = useToast();
  const router = useRouter();
  const firestore = useFirestore();

  const { data: users, isLoading: isLoadingUsers } = useCollection<User>(
    firestore ? collection(firestore, 'users') : null
  );

  const managers = React.useMemo(() => 
    users?.filter(user => user.role === 'Manager' || user.role === 'Admin') || [], 
  [users]);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'Employee',
      managerId: '',
    },
  });

  const onSubmit = async (values: UserFormValues) => {
    if (!firestore) return;

    try {
      const newUser: Omit<User, 'id'> = {
        ...values,
        avatarUrl: `https://avatar.vercel.sh/${values.email}.png`, // Generate a default avatar
      };
      await addDoc(collection(firestore, 'users'), newUser);

      toast({
        title: 'User Added',
        description: `${values.name} has been successfully added to the team.`,
      });
      router.push('/team');
    } catch (error) {
      console.error('Error adding user: ', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add the user. Please try again.',
      });
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Add New User" />
      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Jane Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="e.g. jane.doe@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Admin">Admin</SelectItem>
                        <SelectItem value="Manager">Manager</SelectItem>
                        <SelectItem value="Employee">Employee</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="managerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Manager (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a manager" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingUsers ? (
                            <SelectItem value="loading" disabled>Loading managers...</SelectItem>
                        ) : (
                            managers.map(manager => (
                                <SelectItem key={manager.id} value={manager.id}>{manager.name}</SelectItem>
                            ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end pt-4 gap-2">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                    Cancel
                </Button>
                <Button type="submit">Add User</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
