import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, Users, FileText, AlertCircle } from "lucide-react";

export default function AccountantDashboard() {
  // Mock data - replace with actual API calls
  const stats = {
    totalRevenue: 2500000,
    totalExpenses: 850000,
    pendingPayments: 450000,
    monthlyProfit: 1650000,
    totalStudents: 245
  };

  const recentTransactions = [
    { id: 1, type: "payment", student: "John Smith", amount: 25000, status: "completed", date: "2024-01-15" },
    { id: 2, type: "payment", student: "Mary Johnson", amount: 20000, status: "pending", date: "2024-01-15" },
    { id: 3, type: "expense", description: "Teacher Salaries", amount: 500000, status: "completed", date: "2024-01-14" },
    { id: 4, type: "payment", student: "David Brown", amount: 30000, status: "completed", date: "2024-01-14" }
  ];

  const debtorsList = [
    { name: "John Smith's Parent", amount: 75000, class: "Primary 3A", daysOverdue: 15 },
    { name: "Mary Johnson's Parent", amount: 45000, class: "Nursery 2B", daysOverdue: 7 },
    { name: "David Brown's Parent", amount: 120000, class: "Primary 1A", daysOverdue: 30 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Accountant Dashboard</h1>
        <p className="text-gray-600">Manage school finances and payments</p>
      </div>

      {/* Financial Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">₦{(stats.totalRevenue / 1000000).toFixed(1)}M</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold">₦{(stats.totalExpenses / 1000000).toFixed(1)}M</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold">₦{(stats.pendingPayments / 1000000).toFixed(1)}M</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Monthly Profit</p>
                <p className="text-2xl font-bold">₦{(stats.monthlyProfit / 1000000).toFixed(1)}M</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Students</p>
                <p className="text-2xl font-bold">{stats.totalStudents}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">Confirm and record payments</p>
            <Button className="w-full">Manage Payments</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Receipts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">Print payment receipts</p>
            <Button className="w-full">Print Receipts</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Debtors</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">Track outstanding payments</p>
            <Button className="w-full">View Debtors</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">Generate financial reports</p>
            <Button className="w-full">Generate Reports</Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      transaction.type === 'payment' ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <div>
                      <p className="font-medium">
                        {transaction.type === 'payment' ? transaction.student : transaction.description}
                      </p>
                      <p className="text-sm text-gray-600">{transaction.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₦{transaction.amount.toLocaleString()}</p>
                    <Badge className={
                      transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                      transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }>
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Debtors */}
        <Card>
          <CardHeader>
            <CardTitle>Top Debtors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {debtorsList.map((debtor, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="font-medium">{debtor.name}</p>
                    <p className="text-sm text-gray-600">{debtor.class}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-red-600">₦{debtor.amount.toLocaleString()}</p>
                    <Badge className="bg-red-100 text-red-800">
                      {debtor.daysOverdue} days overdue
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Financial Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">₦{(stats.totalRevenue / 1000000).toFixed(1)}M</div>
              <div className="text-sm text-gray-600">Total Revenue</div>
              <div className="text-xs text-green-600 mt-1">+12% from last month</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">₦{(stats.totalExpenses / 1000000).toFixed(1)}M</div>
              <div className="text-sm text-gray-600">Total Expenses</div>
              <div className="text-xs text-red-600 mt-1">+5% from last month</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">₦{(stats.monthlyProfit / 1000000).toFixed(1)}M</div>
              <div className="text-sm text-gray-600">Net Profit</div>
              <div className="text-xs text-blue-600 mt-1">+18% from last month</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
