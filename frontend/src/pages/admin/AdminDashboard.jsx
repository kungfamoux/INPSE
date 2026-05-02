import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import StatCard from "../components/portal/StatCard";
import { Users, GraduationCap, BookOpen, CreditCard, FileText, UserCheck, Clock, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function AdminDashboard({ currentUser }) {
  const { data: students = [] } = useQuery({
    queryKey: ["students"],
    queryFn: () => base44.entities.Student.list("-created_date", 500),
  });
  const { data: staff = [] } = useQuery({
    queryKey: ["staff"],
    queryFn: () => base44.entities.Staff.list("-created_date", 500),
  });
  const { data: applications = [] } = useQuery({
    queryKey: ["applications"],
    queryFn: () => base44.entities.AdmissionApplication.list("-created_date", 20),
  });
  const { data: invoices = [] } = useQuery({
    queryKey: ["invoices"],
    queryFn: () => base44.entities.FeeInvoice.list("-created_date", 500),
  });
  const { data: announcements = [] } = useQuery({
    queryKey: ["announcements"],
    queryFn: () => base44.entities.Announcement.list("-created_date", 5),
  });

  const activeStudents = students.filter(s => s.status === "active").length;
  const pendingApps = applications.filter(a => a.status === "pending").length;
  const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.paid || 0), 0);
  const unpaidInvoices = invoices.filter(i => i.status !== "paid").length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Welcome back, {currentUser?.full_name?.split(" ")[0] || "Admin"} 👋</h2>
        <p className="text-gray-500 text-sm mt-1">Here's what's happening at the school today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Students" value={activeStudents} icon={GraduationCap} color="orange" />
        <StatCard title="Staff Members" value={staff.length} icon={Users} color="blue" />
        <StatCard title="Pending Admissions" value={pendingApps} icon={FileText} color="purple" />
        <StatCard title="Revenue Collected" value={`₦${totalRevenue.toLocaleString()}`} icon={CreditCard} color="green" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Recent Applications</h3>
            <Link to={createPageUrl("AdminAdmissions")} className="text-sm text-orange-500 font-medium hover:underline">View All</Link>
          </div>
          <div className="space-y-3">
            {applications.slice(0, 5).map((app) => (
              <div key={app.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-100 to-pink-100 flex items-center justify-center text-orange-600 font-bold text-xs">
                    {app.student_first_name?.[0]}{app.student_last_name?.[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{app.student_first_name} {app.student_last_name}</p>
                    <p className="text-xs text-gray-400">{app.applying_for_class}</p>
                  </div>
                </div>
                <Badge className={`text-xs ${
                  app.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                  app.status === "accepted" ? "bg-green-100 text-green-700" :
                  app.status === "rejected" ? "bg-red-100 text-red-700" :
                  "bg-blue-100 text-blue-700"
                }`}>
                  {app.status}
                </Badge>
              </div>
            ))}
            {applications.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No applications yet</p>}
          </div>
        </div>

        {/* Announcements */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Recent Announcements</h3>
            <Link to={createPageUrl("AdminAnnouncements")} className="text-sm text-orange-500 font-medium hover:underline">View All</Link>
          </div>
          <div className="space-y-3">
            {announcements.map((a) => (
              <div key={a.id} className="p-3 rounded-xl bg-gray-50">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">{a.title}</p>
                  <Badge className={`text-xs ${
                    a.priority === "urgent" ? "bg-red-100 text-red-700" :
                    a.priority === "important" ? "bg-orange-100 text-orange-700" :
                    "bg-gray-100 text-gray-600"
                  }`}>
                    {a.priority}
                  </Badge>
                </div>
                <p className="text-xs text-gray-400 mt-1 line-clamp-1">{a.body}</p>
              </div>
            ))}
            {announcements.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No announcements</p>}
          </div>
        </div>
      </div>
    </div>
  );
}