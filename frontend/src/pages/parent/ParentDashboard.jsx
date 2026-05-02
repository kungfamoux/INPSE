import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import StatCard from "../components/portal/StatCard";
import { Users, BarChart3, CreditCard, ClipboardList } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ParentDashboard({ currentUser }) {
  const { data: students = [] } = useQuery({
    queryKey: ["my-children"],
    queryFn: () => base44.entities.Student.filter({ parent_email: currentUser?.email }),
  });
  const { data: invoices = [] } = useQuery({ queryKey: ["invoices"], queryFn: () => base44.entities.FeeInvoice.list("-created_date", 500) });
  const { data: announcements = [] } = useQuery({ queryKey: ["announcements"], queryFn: () => base44.entities.Announcement.filter({ is_published: true }, "-created_date", 5) });
  const { data: classes = [] } = useQuery({ queryKey: ["classes"], queryFn: () => base44.entities.SchoolClass.list() });

  const childIds = students.map(s => s.id);
  const myInvoices = invoices.filter(i => childIds.includes(i.student_id));
  const totalBalance = myInvoices.reduce((s, i) => s + ((i.total || 0) - (i.paid || 0)), 0);
  const classMap = Object.fromEntries(classes.map(c => [c.id, `${c.name} ${c.arm || ""}`]));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Welcome, {currentUser?.full_name?.split(" ")[0] || "Parent"} 👋</h2>
        <p className="text-gray-500 text-sm mt-1">Here's an overview of your children's school activities.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Children" value={students.length} icon={Users} color="orange" />
        <StatCard title="Total Balance" value={`₦${totalBalance.toLocaleString()}`} icon={CreditCard} color={totalBalance > 0 ? "red" : "green"} />
      </div>

      {/* Children List */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4">My Children</h3>
        {students.length > 0 ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {students.map(s => (
              <div key={s.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white font-bold">
                  {s.first_name?.[0]}{s.last_name?.[0]}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{s.first_name} {s.last_name}</p>
                  <p className="text-sm text-gray-500">{classMap[s.class_id] || "No class"}</p>
                  <Badge className={`text-xs mt-1 ${s.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>{s.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">No children linked. Contact the school admin to link your account.</p>
        )}
      </div>

      {/* Announcements */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4">Announcements</h3>
        <div className="space-y-2">
          {announcements.filter(a => a.audience === "all" || a.audience === "parents").map(a => (
            <div key={a.id} className="p-3 bg-gray-50 rounded-xl">
              <p className="text-sm font-medium">{a.title}</p>
              <p className="text-xs text-gray-400 mt-1 line-clamp-2">{a.body}</p>
            </div>
          ))}
          {announcements.length === 0 && <p className="text-sm text-gray-400">No announcements</p>}
        </div>
      </div>
    </div>
  );
}