'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ApprovalStep {
  id?: string;
  stepOrder: number;
  approverType: 'Manager' | 'Finance' | 'Director' | 'Specific_User';
  specificUserId?: string;
  isManagerApprover: boolean;
}

interface ApprovalWorkflow {
  id: string;
  name: string;
  isActive: boolean;
  steps: ApprovalStep[];
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export function ApprovalWorkflowManager() {
  const [workflows, setWorkflows] = useState<ApprovalWorkflow[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // New workflow form
  const [newWorkflowName, setNewWorkflowName] = useState('');
  const [newWorkflowSteps, setNewWorkflowSteps] = useState<ApprovalStep[]>([]);

  useEffect(() => {
    fetchWorkflows();
    fetchUsers();
  }, []);

  const fetchWorkflows = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/approval-workflows', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setWorkflows(data);
      }
    } catch (error) {
      console.error('Error fetching workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const addStep = () => {
    const newStep: ApprovalStep = {
      stepOrder: newWorkflowSteps.length + 1,
      approverType: 'Manager',
      isManagerApprover: false
    };
    setNewWorkflowSteps([...newWorkflowSteps, newStep]);
  };

  const removeStep = (index: number) => {
    const updatedSteps = newWorkflowSteps.filter((_, i) => i !== index);
    // Reorder steps
    const reorderedSteps = updatedSteps.map((step, i) => ({
      ...step,
      stepOrder: i + 1
    }));
    setNewWorkflowSteps(reorderedSteps);
  };

  const updateStep = (index: number, field: keyof ApprovalStep, value: any) => {
    const updatedSteps = [...newWorkflowSteps];
    updatedSteps[index] = { ...updatedSteps[index], [field]: value };
    setNewWorkflowSteps(updatedSteps);
  };

  const saveWorkflow = async () => {
    if (!newWorkflowName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter a workflow name'
      });
      return;
    }

    if (newWorkflowSteps.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please add at least one approval step'
      });
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/approval-workflows', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newWorkflowName,
          steps: newWorkflowSteps
        })
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Approval workflow created successfully'
        });
        setNewWorkflowName('');
        setNewWorkflowSteps([]);
        fetchWorkflows();
      } else {
        throw new Error('Failed to create workflow');
      }
    } catch (error) {
      console.error('Error creating workflow:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create approval workflow'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Approval Workflows</h3>
        <p className="text-sm text-muted-foreground">
          Configure multi-level approval workflows for expense claims
        </p>
      </div>

      {/* Existing Workflows */}
      {workflows.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium">Existing Workflows</h4>
          {workflows.map((workflow) => (
            <Card key={workflow.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">{workflow.name}</CardTitle>
                    <CardDescription>
                      {workflow.steps.length} approval step{workflow.steps.length !== 1 ? 's' : ''}
                    </CardDescription>
                  </div>
                  <Badge variant={workflow.isActive ? 'default' : 'secondary'}>
                    {workflow.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {workflow.steps.map((step, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <span className="font-medium">Step {step.stepOrder}:</span>
                      <span>{step.approverType}</span>
                      {step.specificUserId && (
                        <span className="text-muted-foreground">
                          ({users.find(u => u.id === step.specificUserId)?.name})
                        </span>
                      )}
                      {step.isManagerApprover && (
                        <Badge variant="outline" className="text-xs">Manager Required</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create New Workflow */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Create New Workflow</CardTitle>
          <CardDescription>
            Define a new approval workflow for expense claims
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="workflow-name">Workflow Name</Label>
            <Input
              id="workflow-name"
              value={newWorkflowName}
              onChange={(e) => setNewWorkflowName(e.target.value)}
              placeholder="e.g., Standard Expense Approval"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Approval Steps</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addStep}
                className="flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                Add Step
              </Button>
            </div>

            {newWorkflowSteps.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No approval steps configured. Click "Add Step" to get started.
              </p>
            )}

            {newWorkflowSteps.map((step, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium">Step {step.stepOrder}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeStep(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`approver-type-${index}`}>Approver Type</Label>
                    <Select
                      value={step.approverType}
                      onValueChange={(value: any) => updateStep(index, 'approverType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Manager">Employee's Manager</SelectItem>
                        <SelectItem value="Finance">Finance Department</SelectItem>
                        <SelectItem value="Director">Director</SelectItem>
                        <SelectItem value="Specific_User">Specific User</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {step.approverType === 'Specific_User' && (
                    <div>
                      <Label htmlFor={`specific-user-${index}`}>Select User</Label>
                      <Select
                        value={step.specificUserId || ''}
                        onValueChange={(value) => updateStep(index, 'specificUserId', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a user" />
                        </SelectTrigger>
                        <SelectContent>
                          {users.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.name} ({user.email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`manager-approver-${index}`}
                      checked={step.isManagerApprover}
                      onChange={(e) => updateStep(index, 'isManagerApprover', e.target.checked)}
                    />
                    <Label htmlFor={`manager-approver-${index}`} className="text-sm">
                      Manager must approve
                    </Label>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Button
            onClick={saveWorkflow}
            disabled={saving || !newWorkflowName.trim() || newWorkflowSteps.length === 0}
            className="w-full"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Creating...' : 'Create Workflow'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
