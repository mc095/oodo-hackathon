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

interface ApprovalRule {
  id: string;
  companyId: string;
  ruleType: 'Percentage' | 'Specific_Approver' | 'Hybrid';
  percentageThreshold?: number;
  specificApproverId?: string;
  specificApproverName?: string;
  hybridPercentage?: number;
  hybridApproverId?: string;
  hybridApproverName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export function ApprovalRulesManager() {
  const [rules, setRules] = useState<ApprovalRule[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // New rule form
  const [newRuleType, setNewRuleType] = useState<'Percentage' | 'Specific_Approver' | 'Hybrid'>('Percentage');
  const [newPercentageThreshold, setNewPercentageThreshold] = useState<number>(60);
  const [newSpecificApproverId, setNewSpecificApproverId] = useState<string>('');
  const [newHybridPercentage, setNewHybridPercentage] = useState<number>(60);
  const [newHybridApproverId, setNewHybridApproverId] = useState<string>('');

  useEffect(() => {
    fetchRules();
    fetchUsers();
  }, []);

  const fetchRules = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/approval-rules', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRules(data);
      }
    } catch (error) {
      console.error('Error fetching rules:', error);
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

  const saveRule = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('auth_token');
      
      let requestBody: any = {
        ruleType: newRuleType
      };

      if (newRuleType === 'Percentage') {
        requestBody.percentageThreshold = newPercentageThreshold;
      } else if (newRuleType === 'Specific_Approver') {
        if (!newSpecificApproverId) {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Please select a specific approver'
          });
          return;
        }
        requestBody.specificApproverId = newSpecificApproverId;
      } else if (newRuleType === 'Hybrid') {
        if (!newHybridApproverId) {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Please select a hybrid approver'
          });
          return;
        }
        requestBody.hybridPercentage = newHybridPercentage;
        requestBody.hybridApproverId = newHybridApproverId;
      }

      const response = await fetch('/api/approval-rules', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Approval rule created successfully'
        });
        resetForm();
        fetchRules();
      } else {
        throw new Error('Failed to create rule');
      }
    } catch (error) {
      console.error('Error creating rule:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create approval rule'
      });
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setNewRuleType('Percentage');
    setNewPercentageThreshold(60);
    setNewSpecificApproverId('');
    setNewHybridPercentage(60);
    setNewHybridApproverId('');
  };

  const getRuleDescription = (rule: ApprovalRule) => {
    switch (rule.ruleType) {
      case 'Percentage':
        return `If ${rule.percentageThreshold}% of approvers approve → Expense approved`;
      case 'Specific_Approver':
        return `If ${rule.specificApproverName} approves → Expense auto-approved`;
      case 'Hybrid':
        return `If ${rule.hybridPercentage}% OR ${rule.hybridApproverName} approves → Expense approved`;
      default:
        return 'Unknown rule type';
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Approval Rules</h3>
        <p className="text-sm text-muted-foreground">
          Define conditional approval rules that can override standard workflows
        </p>
      </div>

      {/* Existing Rules */}
      {rules.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium">Existing Rules</h4>
          {rules.map((rule) => (
            <Card key={rule.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base capitalize">{rule.ruleType} Rule</CardTitle>
                    <CardDescription>{getRuleDescription(rule)}</CardDescription>
                  </div>
                  <Badge variant={rule.isActive ? 'default' : 'secondary'}>
                    {rule.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {/* Create New Rule */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Create New Rule</CardTitle>
          <CardDescription>
            Define a conditional approval rule for expense claims
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="rule-type">Rule Type</Label>
            <Select value={newRuleType} onValueChange={(value: any) => setNewRuleType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Percentage">Percentage Rule</SelectItem>
                <SelectItem value="Specific_Approver">Specific Approver Rule</SelectItem>
                <SelectItem value="Hybrid">Hybrid Rule</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {newRuleType === 'Percentage' && (
            <div>
              <Label htmlFor="percentage-threshold">Percentage Threshold</Label>
              <Input
                id="percentage-threshold"
                type="number"
                min="1"
                max="100"
                value={newPercentageThreshold}
                onChange={(e) => setNewPercentageThreshold(Number(e.target.value))}
                placeholder="e.g., 60"
              />
              <p className="text-sm text-muted-foreground mt-1">
                If this percentage of approvers approve, the expense will be automatically approved
              </p>
            </div>
          )}

          {newRuleType === 'Specific_Approver' && (
            <div>
              <Label htmlFor="specific-approver">Specific Approver</Label>
              <Select value={newSpecificApproverId} onValueChange={setNewSpecificApproverId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an approver" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} ({user.email}) - {user.role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-1">
                If this specific approver approves, the expense will be automatically approved
              </p>
            </div>
          )}

          {newRuleType === 'Hybrid' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="hybrid-percentage">Percentage Threshold</Label>
                <Input
                  id="hybrid-percentage"
                  type="number"
                  min="1"
                  max="100"
                  value={newHybridPercentage}
                  onChange={(e) => setNewHybridPercentage(Number(e.target.value))}
                  placeholder="e.g., 60"
                />
              </div>
              <div>
                <Label htmlFor="hybrid-approver">Specific Approver</Label>
                <Select value={newHybridApproverId} onValueChange={setNewHybridApproverId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an approver" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} ({user.email}) - {user.role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <p className="text-sm text-muted-foreground">
                If either the percentage threshold is met OR the specific approver approves, the expense will be approved
              </p>
            </div>
          )}

          <Button
            onClick={saveRule}
            disabled={saving}
            className="w-full"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Creating...' : 'Create Rule'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
