import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, GraduationCap, DollarSign, BookOpen, TrendingUp, AlertCircle } from "lucide-react";

export default function AdminDashboard() {
  // Mock data - replace with actual API calls
  const stats = {
    totalStudents: 245,
    totalStaff: 28,
    pendingApplications: 12,
    monthlyRevenue: 850000,
    attendanceRate: 92
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Manage your school operations efficiently</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <GraduationCap className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold">{stats.totalStudents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Staff</p>
                <p className="text-2xl font-bold">{stats.totalStaff}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Applications</p>
                <p className="text-2xl font-bold">{stats.pendingApplications}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold">₦{(stats.monthlyRevenue / 1000).toFixed(0)}K</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
                <p className="text-2xl font-bold">{stats.attendanceRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Student Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">Add, edit, and manage student records</p>
            <Button className="w-full">Manage Students</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Fee Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">Track payments and manage fees</p>
            <Button className="w-full">Manage Fees</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Academic Records</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">Manage results and academic data</p>
            <Button className="w-full">Manage Results</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Communication</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">Send messages and notifications</p>
            <Button className="w-full">Send Messages</Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">John Smith - Primary 1</p>
                  <p className="text-sm text-gray-600">Applied 2 hours ago</p>
                </div>
                <Badge>Pending</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Mary Johnson - Nursery 2</p>
                  <p className="text-sm text-gray-600">Applied 5 hours ago</p>
                </div>
                <Badge>Pending</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">David Brown - Primary 3</p>
                  <p className="text-sm text-gray-600">Applied yesterday</p>
                </div>
                <Badge className="bg-green-100 text-green-800">Approved</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">John Smith's Parent</p>
                  <p className="text-sm text-gray-600">Term 2 Fees - ₦25,000</p>
                </div>
                <Badge className="bg-green-100 text-green-800">Paid</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Mary Johnson's Parent</p>
                  <p className="text-sm text-gray-600">Term 2 Fees - ₦20,000</p>
                </div>
                <Badge className="bg-orange-100 text-orange-800">Partial</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">David Brown's Parent</p>
                  <p className="text-sm text-gray-600">Term 2 Fees - ₦30,000</p>
                </div>
                <Badge className="bg-red-100 text-red-800">Unpaid</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>System Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
              <AlertCircle className="h-5 w-5 text-yellow-600 mr-3" />
              <div>
                <p className="font-medium text-yellow-800">12 pending admission applications</p>
                <p className="text-sm text-yellow-600">Review and process applications</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-blue-50 rounded-lg">
              <BookOpen className="h-5 w-5 text-blue-600 mr-3" />
              <div>
                <p className="font-medium text-blue-800">End of term assessments due</p>
                <p className="text-sm text-blue-600">Teachers need to submit scores by next week</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-green-50 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600 mr-3" />
              <div>
                <p className="font-medium text-green-800">Monthly revenue target achieved</p>
                <p className="text-sm text-green-600">₦850,000 collected this month</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
