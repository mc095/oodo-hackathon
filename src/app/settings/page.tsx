'use client';
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDoc } from "@/lib/mysql-index";
import { useToast } from "@/hooks/use-toast";
import { Company } from "@/lib/types";
import { DataAPI } from "@/lib/data-api";
import { ApprovalWorkflowManager } from "@/components/approval-workflow-manager";
import { ApprovalRulesManager } from "@/components/approval-rules-manager";
import { ExpenseApprovals } from "@/components/expense-approvals";
import { Save } from "lucide-react";
import * as React from "react";

// Assuming a single company document for simplicity
const COMPANY_ID = "main";

export default function SettingsPage() {
  const { toast } = useToast();
  const { data: companyData, isLoading } = useDoc<Company>(`/api/companies/${COMPANY_ID}`);

  const [companyName, setCompanyName] = React.useState("");
  const [defaultCurrency, setDefaultCurrency] = React.useState("USD");

  React.useEffect(() => {
    if (companyData) {
      setCompanyName(companyData.name);
      setDefaultCurrency(companyData.currency);
    }
  }, [companyData]);

  const handleSaveChanges = async () => {
    try {
        await DataAPI.createExpense({
            name: companyName,
            currency: defaultCurrency,
        } as any);
        toast({
            title: "Settings Saved",
            description: "Your company settings have been updated.",
        });
    } catch (error) {
        console.error("Error saving settings: ", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to save settings. Please try again.",
        });
    }
  };


  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Settings">
        <Button onClick={handleSaveChanges} disabled={isLoading}>
          <Save className="mr-2 h-4 w-4" />
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </PageHeader>
      
      <Tabs defaultValue="company" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="rules">Rules</TabsTrigger>
          <TabsTrigger value="approvals">Approvals</TabsTrigger>
        </TabsList>
        
        <TabsContent value="company" className="space-y-6">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="md:col-span-1">
              <h2 className="text-xl font-semibold font-headline">Company Profile</h2>
              <p className="text-muted-foreground mt-1">
                Update your company's information and default settings.
              </p>
            </div>
            <div className="md:col-span-2">
              <Card>
                <CardContent className="pt-6 space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input id="companyName" value={companyName} onChange={e => setCompanyName(e.target.value)} disabled={isLoading} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Default Currency</Label>
                    <Select value={defaultCurrency} onValueChange={setDefaultCurrency} disabled={isLoading}>
                      <SelectTrigger id="currency">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD - United States Dollar</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                        <SelectItem value="GBP">GBP - British Pound</SelectItem>
                        <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="workflows">
          <ApprovalWorkflowManager />
        </TabsContent>
        
        <TabsContent value="rules">
          <ApprovalRulesManager />
        </TabsContent>
        
        <TabsContent value="approvals">
          <ExpenseApprovals />
        </TabsContent>
      </Tabs>
    </div>
  );
}
