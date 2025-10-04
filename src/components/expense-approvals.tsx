'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CheckCircle, XCircle, Clock, DollarSign, Calendar, User, Building } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ExpenseApproval {
  id: string;
  expenseId: string;
  currentApproverId: string;
  stepOrder: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  comment?: string;
  createdAt: string;
  updatedAt: string;
  expense: {
    id: string;
    userId: string;
    amount: number;
    currency: string;
    category: string;
    description: string;
    date: string;
    status: string;
    vendor: string;
    employeeName: string;
    employeeEmail: string;
  };
  approverName: string;
  approverEmail: string;
}

export function ExpenseApprovals() {
  const [approvals, setApprovals] = useState<ExpenseApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [selectedApproval, setSelectedApproval] = useState<ExpenseApproval | null>(null);
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [comment, setComment] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchApprovals();
  }, []);

  const fetchApprovals = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/expense-approvals', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setApprovals(data);
      }
    } catch (error) {
      console.error('Error fetching approvals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalAction = async (approvalId: string, action: 'approve' | 'reject') => {
    setProcessing(approvalId);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/expense-approvals', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          expenseId: selectedApproval?.expenseId,
          action,
          comment: comment.trim() || undefined
        })
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: `Expense ${action === 'approve' ? 'approved' : 'rejected'} successfully`
        });
        setSelectedApproval(null);
        setAction(null);
        setComment('');
        fetchApprovals();
      } else {
        throw new Error(`Failed to ${action} expense`);
      }
    } catch (error) {
      console.error(`Error ${action}ing expense:`, error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Failed to ${action} expense`
      });
    } finally {
      setProcessing(null);
    }
  };

  const openApprovalDialog = (approval: ExpenseApproval, action: 'approve' | 'reject') => {
    setSelectedApproval(approval);
    setAction(action);
    setComment('');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'Rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      case 'Pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Expense Approvals</h3>
        <p className="text-sm text-muted-foreground">
          Review and approve expense claims from your team
        </p>
      </div>

      {approvals.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Clock className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Pending Approvals</h3>
            <p className="text-sm text-muted-foreground text-center">
              There are no expense claims waiting for your approval at the moment.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {approvals.map((approval) => (
            <Card key={approval.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">
                      {approval.expense.vendor} - {approval.expense.category}
                    </CardTitle>
                    <CardDescription>
                      Submitted by {approval.expense.employeeName} on {formatDate(approval.expense.date)}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(approval.status)}
                    {approval.status === 'Pending' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => openApprovalDialog(approval, 'approve')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => openApprovalDialog(approval, 'reject')}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {formatCurrency(approval.expense.amount, approval.expense.currency)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {formatDate(approval.expense.date)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {approval.expense.employeeName} ({approval.expense.employeeEmail})
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium">Description:</span>
                      <p className="text-sm text-muted-foreground mt-1">
                        {approval.expense.description || 'No description provided'}
                      </p>
                    </div>
                    {approval.comment && (
                      <div>
                        <span className="text-sm font-medium">Comment:</span>
                        <p className="text-sm text-muted-foreground mt-1">{approval.comment}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Approval Dialog */}
      <Dialog open={!!selectedApproval && !!action} onOpenChange={() => {
        setSelectedApproval(null);
        setAction(null);
        setComment('');
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === 'approve' ? 'Approve' : 'Reject'} Expense
            </DialogTitle>
            <DialogDescription>
              {action === 'approve' 
                ? 'Are you sure you want to approve this expense claim?' 
                : 'Are you sure you want to reject this expense claim?'
              }
            </DialogDescription>
          </DialogHeader>
          
          {selectedApproval && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Expense Details</h4>
                <div className="space-y-1 text-sm">
                  <div><strong>Vendor:</strong> {selectedApproval.expense.vendor}</div>
                  <div><strong>Amount:</strong> {formatCurrency(selectedApproval.expense.amount, selectedApproval.expense.currency)}</div>
                  <div><strong>Category:</strong> {selectedApproval.expense.category}</div>
                  <div><strong>Date:</strong> {formatDate(selectedApproval.expense.date)}</div>
                  <div><strong>Employee:</strong> {selectedApproval.expense.employeeName}</div>
                  {selectedApproval.expense.description && (
                    <div><strong>Description:</strong> {selectedApproval.expense.description}</div>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="comment" className="text-sm font-medium">
                  Comment (optional)
                </label>
                <Textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={`Add a comment for ${action === 'approve' ? 'approval' : 'rejection'}...`}
                  className="mt-1"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedApproval(null);
                    setAction(null);
                    setComment('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant={action === 'approve' ? 'default' : 'destructive'}
                  onClick={() => selectedApproval && handleApprovalAction(selectedApproval.id, action!)}
                  disabled={processing === selectedApproval.id}
                >
                  {processing === selectedApproval.id ? 'Processing...' : `${action === 'approve' ? 'Approve' : 'Reject'} Expense`}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
