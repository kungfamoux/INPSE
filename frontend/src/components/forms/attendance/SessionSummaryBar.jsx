import React from "react";
import { CheckCircle, XCircle, Clock, FileText } from "lucide-react";

export default function SessionSummaryBar({ records }) {
  const values = Object.values(records);
  const total = values.length;
  const present = values.filter(v => v === "present").length;
  const absent = values.filter(v => v === "absent").length;
  const late = values.filter(v => v === "late").length;
  const excused = values.filter(v => v === "excused").length;

  const items = [
    { label: "Present", count: present, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
    { label: "Absent",  count: absent,  icon: XCircle,     color: "text-red-600",   bg: "bg-red-50" },
    { label: "Late",    count: late,    icon: Clock,        color: "text-yellow-600", bg: "bg-yellow-50" },
    { label: "Excused", count: excused, icon: FileText,     color: "text-blue-600",  bg: "bg-blue-50" },
  ];

  return (
    <div className="grid grid-cols-4 gap-2">
      {items.map(item => (
        <div key={item.label} className={`${item.bg} rounded-xl p-3 text-center`}>
          <item.icon className={`w-5 h-5 ${item.color} mx-auto mb-1`} />
          <p className={`text-lg font-bold ${item.color}`}>{item.count}</p>
          <p className="text-[10px] text-gray-500 font-medium">{item.label}</p>
        </div>
      ))}
    </div>
  );
}