import React from "react";
import { CheckCircle, XCircle, Clock, FileText } from "lucide-react";

const config = {
  present:  { label: "Present",  icon: CheckCircle, active: "bg-green-500 text-white border-green-500",  inactive: "bg-white text-gray-300 border-gray-200 hover:border-green-300 hover:text-green-400" },
  absent:   { label: "Absent",   icon: XCircle,     active: "bg-red-500 text-white border-red-500",      inactive: "bg-white text-gray-300 border-gray-200 hover:border-red-300 hover:text-red-400" },
  late:     { label: "Late",     icon: Clock,       active: "bg-yellow-500 text-white border-yellow-500", inactive: "bg-white text-gray-300 border-gray-200 hover:border-yellow-300 hover:text-yellow-400" },
  excused:  { label: "Excused",  icon: FileText,    active: "bg-blue-500 text-white border-blue-500",    inactive: "bg-white text-gray-300 border-gray-200 hover:border-blue-300 hover:text-blue-400" },
};

export const statusBadgeClass = {
  present: "bg-green-100 text-green-700",
  absent:  "bg-red-100 text-red-700",
  late:    "bg-yellow-100 text-yellow-700",
  excused: "bg-blue-100 text-blue-700",
};

export default function StatusChip({ status, value, onClick, disabled }) {
  const cfg = config[value];
  const isActive = status === value;
  return (
    <button
      type="button"
      onClick={() => !disabled && onClick(value)}
      disabled={disabled}
      title={cfg.label}
      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all select-none
        ${isActive ? cfg.active : cfg.inactive}
        ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer active:scale-95"}`}
    >
      <cfg.icon className="w-3.5 h-3.5" />
      <span className="hidden sm:inline">{cfg.label}</span>
    </button>
  );
}