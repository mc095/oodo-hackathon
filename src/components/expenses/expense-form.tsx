'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Loader2, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { receiptOcrExpenseAutofill } from '@/ai/flows/receipt-ocr-expense-autofill';
import { Separator } from '../ui/separator';
import { Expense } from '@/lib/types';

const formSchema = z.object({
  vendor: z.string().min(2, 'Vendor must be at least 2 characters.'),
  amount: z.coerce.number().positive('Amount must be a positive number.'),
  date: z.date({ required_error: 'A date is required.' }),
  currency: z.string().min(1, 'Please select a currency.'),
  category: z.string().min(1, 'Please select a category.'),
  description: z.string().optional(),
  receipt: z.any().optional(),
});

type ExpenseFormValues = z.infer<typeof formSchema>;

type ExpenseFormProps = {
  onSubmitSuccess: (data: Omit<Expense, 'id' | 'approvers' | 'status' | 'userId'>) => void;
};

export function ExpenseForm({ onSubmitSuccess }: ExpenseFormProps) {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vendor: '',
      amount: 0,
      currency: 'USD',
      description: ''
    },
  });

  async function onSubmit(values: ExpenseFormValues) {
    const { receipt, ...expenseData } = values;
    onSubmitSuccess({
        ...expenseData,
        date: values.date.toISOString(),
    });
    toast({
      title: 'Expense Submitted',
      description: 'Your expense has been successfully submitted for approval.',
    });
    form.reset();
  }

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    toast({
        title: 'Processing Receipt',
        description: 'AI is extracting details from your receipt. Please wait...',
    });

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const dataUri = reader.result as string;
        try {
            const result = await receiptOcrExpenseAutofill({ receiptDataUri: dataUri });
            form.setValue('vendor', result.vendor);
            form.setValue('amount', parseFloat(result.amount.replace(/[^0-9.-]+/g,"")) || 0);
            const parsedDate = new Date(result.date);
            if (!isNaN(parsedDate.getTime())) {
              form.setValue('date', parsedDate);
            }
            form.setValue('category', result.category);
            form.setValue('description', result.description);

            toast({
                title: 'Success!',
                description: 'Expense details populated from receipt.',
                variant: 'default'
            });

        } catch (aiError) {
             toast({
                variant: 'destructive',
                title: 'AI Processing Failed',
                description:
                'Could not extract details automatically. Please enter them manually.',
            });
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'File Read Error',
        description: 'There was a problem reading the uploaded file.',
      });
    } finally {
      setIsProcessing(false);
      // Reset file input
      if(fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="py-6">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />
      <Button
        variant="outline"
        className="w-full mb-6"
        onClick={() => fileInputRef.current?.click()}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Upload className="mr-2 h-4 w-4" />
        )}
        Scan Receipt with AI
      </Button>

      <div className="flex items-center my-4">
        <Separator className="flex-1" />
        <span className="px-4 text-sm text-muted-foreground">OR</span>
        <Separator className="flex-1" />
      </div>


      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="vendor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vendor / Store</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Amazon, Starbucks" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem className='col-span-2'>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="CAD">CAD</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date of Expense</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={'outline'}
                        className={cn(
                          'pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value ? (
                          format(field.value, 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date('1900-01-01')
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select
                  onValuecha.ge={field.onChange}
                  defaultValue={field.value}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an expense category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="travel">Travel</SelectItem>
                    <SelectItem value="food">Food & Dining</SelectItem>
                    <SelectItem value="software">Software</SelectItem>
                    <SelectItem value="supplies">Office Supplies</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="A brief description of the expense (optional)"
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end pt-4">
            <Button type="submit">Submit for Approval</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
