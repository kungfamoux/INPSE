import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import StatCard from "../components/portal/StatCard";
import { School, Users, ClipboardList, BookMarked, CalendarCheck, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function TeacherDashboard({ currentUser }) {
  const { data: staff = [] } = useQuery({ queryKey: ["my-staff"], queryFn: () => base44.entities.Staff.filter({ user_email: currentUser?.email }) });
  const { data: classes = [] } = useQuery({ queryKey: ["classes"], queryFn: () => base44.entities.SchoolClass.list() });
  const { data: students = [] } = useQuery({ queryKey: ["students"], queryFn: () => base44.entities.Student.filter({ status: "active" }) });
  const { data: announcements = [] } = useQuery({ queryKey: ["announcements"], queryFn: () => base44.entities.Announcement.list("-created_date", 5) });

  const myStaff = staff[0];
  const myClassIds = myStaff?.classes || [];
  const myClasses = classes.filter(c => myClassIds.includes(c.id));
  const myStudents = students.filter(s => myClassIds.includes(s.class_id));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Welcome, {currentUser?.full_name?.split(" ")[0] || "Teacher"} 👋</h2>
        <p className="text-gray-500 text-sm mt-1">Here's your teaching overview.</p>
      </div>

      {/* Mark Attendance Shortcut */}
      <Link to={createPageUrl("TeacherAttendance")}>
        <div className="bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl p-5 flex items-center justify-between cursor-pointer hover:opacity-95 transition-opacity shadow-lg shadow-orange-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <CalendarCheck className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-lg">Mark Today's Attendance</p>
              <p className="text-white/80 text-sm">{new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}</p>
            </div>
          </div>
          <ArrowRight className="w-6 h-6 text-white/70" />
        </div>
      </Link>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="My Classes" value={myClasses.length} icon={School} color="orange" />
        <StatCard title="My Students" value={myStudents.length} icon={Users} color="blue" />
        <StatCard title="Subjects" value={myStaff?.subjects?.length || 0} icon={BookMarked} color="purple" />
        <StatCard title="Announcements" value={announcements.length} icon={ClipboardList} color="green" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">My Classes</h3>
          {myClasses.length > 0 ? (
            <div className="space-y-2">
              {myClasses.map(c => (
                <div key={c.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <School className="w-5 h-5 text-orange-500" />
                    <span className="font-medium">{c.name} {c.arm || ""}</span>
                  </div>
                  <span className="text-sm text-gray-500">{students.filter(s => s.class_id === c.id).length} students</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No classes assigned yet. Ask your admin to assign classes to your staff record.</p>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Recent Announcements</h3>
          <div className="space-y-2">
            {announcements.map(a => (
              <div key={a.id} className="p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{a.title}</span>
                  <Badge className={`text-xs ${a.priority === "urgent" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"}`}>{a.priority}</Badge>
                </div>
                <p className="text-xs text-gray-400 mt-1 line-clamp-1">{a.body}</p>
              </div>
            ))}
            {announcements.length === 0 && <p className="text-sm text-gray-400">No announcements</p>}
          </div>
        </div>
      </div>
    </div>
  );
}