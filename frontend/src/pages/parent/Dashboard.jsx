import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, BookOpen, DollarSign, Bell, MessageSquare, TrendingUp } from "lucide-react";

export default function ParentDashboard() {
  // Mock data - replace with actual API calls
  const children = [
    {
      id: 1,
      name: "John Doe",
      class: "Primary 3A",
      photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      performance: 85,
      attendance: 92,
      feeBalance: 15000
    },
    {
      id: 2,
      name: "Jane Doe", 
      class: "Nursery 2B",
      photo: "https://images.unsplash.com/photo-1494790108755-2616b332c2ca?w=100&h=100&fit=crop&crop=face",
      performance: 90,
      attendance: 95,
      feeBalance: 12000
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Parent Dashboard</h1>
        <p className="text-gray-600">Track your children's progress and activities</p>
      </div>

      {/* Children Overview */}
      <div className="grid md:grid-cols-2 gap-6">
        {children.map((child) => (
          <Card key={child.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-4">
                <img
                  src={child.photo}
                  alt={child.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <CardTitle className="text-lg">{child.name}</CardTitle>
                  <p className="text-sm text-gray-600">{child.class}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">{child.performance}%</div>
                  <div className="text-xs text-gray-600">Performance</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">{child.attendance}%</div>
                  <div className="text-xs text-gray-600">Attendance</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">₦{child.feeBalance.toLocaleString()}</div>
                  <div className="text-xs text-gray-600">Fee Balance</div>
                </div>
              </div>
              
              <div className="mt-4 flex gap-2">
                <Link to="/parent/ChildResults">
                  <Button size="sm" variant="outline" className="flex-1">
                    <BookOpen className="w-4 h-4 mr-1" /> Results
                  </Button>
                </Link>
                <Link to="/parent/Fees">
                  <Button size="sm" variant="outline" className="flex-1">
                    <DollarSign className="w-4 h-4 mr-1" /> Fees
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Messages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">2 unread messages</p>
            <Link to="/parent/Messages">
              <Button className="w-full">View Messages</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">3 new notices</p>
            <Link to="/parent/Notifications">
              <Button className="w-full">View Notices</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Progress Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">View detailed performance</p>
            <Link to="/parent/ChildResults">
              <Button className="w-full">View Progress</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">John Doe - Test Results Published</p>
                <p className="text-sm text-gray-600">Mathematics: 85%, English: 90%</p>
              </div>
              <Badge>2 hours ago</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Fee Reminder - Term 2</p>
                <p className="text-sm text-gray-600">Outstanding balance: ₦15,000</p>
              </div>
              <Badge>1 day ago</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Parent-Teacher Meeting</p>
                <p className="text-sm text-gray-600">Scheduled for next Friday</p>
              </div>
              <Badge>3 days ago</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
