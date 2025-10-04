'use client';
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useDoc } from "@/lib/mysql-index";
import { useToast } from "@/hooks/use-toast";
import { Company } from "@/lib/types";
import { DataAPI } from "@/lib/data-api";
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

      <Separator />

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <h2 className="text-xl font-semibold font-headline">Approval Workflow</h2>
          <p className="text-muted-foreground mt-1">
            Define how expenses are approved. Configure multi-level and conditional rules.
          </p>
        </div>
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Multi-level Approval</CardTitle>
              <CardDescription>
                Define the sequence of approvers for an expense claim.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-16 text-sm text-muted-foreground">Step 1</div>
                    <Select defaultValue="manager">
                        <SelectTrigger><SelectValue/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="manager">Employee's Manager</SelectItem>
                            <SelectItem value="finance">Finance Department</SelectItem>
                            <SelectItem value="director">Director</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-16 text-sm text-muted-foreground">Step 2</div>
                    <Select defaultValue="finance">
                        <SelectTrigger><SelectValue/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="manager">Employee's Manager</SelectItem>
                            <SelectItem value="finance">Finance Department</SelectItem>
                            <SelectItem value="director">Director</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Button variant="outline" size="sm">Add Step</Button>
            </CardContent>
          </Card>
           <Card>
            <CardHeader>
              <CardTitle>Conditional Rules</CardTitle>
              <CardDescription>
                Set up rules for automatic approvals to speed up the process.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-md">
                    <div>
                        <Label htmlFor="cfo-rule" className="font-medium">CFO Auto-Approval</Label>
                        <p className="text-sm text-muted-foreground">If CFO approves, expense is auto-approved.</p>
                    </div>
                    <Switch id="cfo-rule" defaultChecked/>
                </div>
                 <div className="flex items-center justify-between p-4 border rounded-md">
                    <div>
                        <Label htmlFor="percentage-rule" className="font-medium">Percentage Approval</Label>
                        <p className="text-sm text-muted-foreground">Approve if a certain percentage of approvers agree.</p>
                    </div>
                    <Switch id="percentage-rule" />
                </div>
            </CardContent>
          </Card>
        </div>
      </div>

    </div>
  );
}
