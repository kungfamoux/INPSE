import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, BookOpen, Calendar, MessageSquare, CheckCircle } from "lucide-react";

export default function TeacherDashboard() {
  // Mock data - replace with actual API calls
  const teacherInfo = {
    name: "Mrs. Sarah Johnson",
    class: "Primary 3A",
    subjects: ["Mathematics", "English"],
    totalStudents: 28
  };

  const todaySchedule = [
    { time: "8:00 AM", subject: "Mathematics", class: "Primary 3A" },
    { time: "9:30 AM", subject: "English", class: "Primary 3A" },
    { time: "11:00 AM", subject: "Break", class: "-" },
    { time: "11:30 AM", subject: "Science", class: "Primary 3A" },
    { time: "1:00 PM", subject: "Lunch", class: "-" },
    { time: "2:00 PM", subject: "Social Studies", class: "Primary 3A" }
  ];

  const pendingTasks = [
    { task: "Submit Mathematics test scores", due: "Today", priority: "high" },
    { task: "Mark English assignments", due: "Tomorrow", priority: "medium" },
    { task: "Prepare lesson plan for next week", due: "Friday", priority: "low" }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
        <p className="text-gray-600">Welcome back, {teacherInfo.name}</p>
      </div>

      {/* Teacher Info */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">{teacherInfo.name}</h2>
              <p className="text-gray-600">Class: {teacherInfo.class}</p>
              <p className="text-gray-600">Subjects: {teacherInfo.subjects.join(", ")}</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{teacherInfo.totalStudents}</div>
              <div className="text-sm text-gray-600">Total Students</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5" />
              Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">Mark daily attendance</p>
            <Button className="w-full">Mark Attendance</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Scores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">Upload test and exam scores</p>
            <Button className="w-full">Upload Scores</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Homework
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">Assign homework to students</p>
            <Button className="w-full">Assign Homework</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Messages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">Communicate with parents</p>
            <Button className="w-full">Send Messages</Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todaySchedule.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium text-gray-600 w-20">{item.time}</div>
                    <div>
                      <p className="font-medium">{item.subject}</p>
                      <p className="text-sm text-gray-600">{item.class}</p>
                    </div>
                  </div>
                  {item.subject === "Break" || item.subject === "Lunch" ? (
                    <Badge variant="secondary">Break</Badge>
                  ) : (
                    <Badge className="bg-green-100 text-green-800">Class</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingTasks.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{item.task}</p>
                    <p className="text-sm text-gray-600">Due: {item.due}</p>
                  </div>
                  <Badge className={
                    item.priority === 'high' ? 'bg-red-100 text-red-800' :
                    item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }>
                    {item.priority}
                  </Badge>
                </div>
              ))}
            </div>
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
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">Mathematics test scores submitted</p>
                <p className="text-sm text-gray-600">Primary 3A - 28 students</p>
              </div>
              <Badge className="ml-auto">2 hours ago</Badge>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">Attendance marked for today</p>
                <p className="text-sm text-gray-600">26 present, 2 absent</p>
              </div>
              <Badge className="ml-auto">4 hours ago</Badge>
            </div>
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium">Message sent to parents</p>
                <p className="text-sm text-gray-600">Reminder about parent-teacher meeting</p>
              </div>
              <Badge className="ml-auto">Yesterday</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
