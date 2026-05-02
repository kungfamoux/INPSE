import React from "react";
import StatusChip from "./StatusChip";

export default function StudentRow({ student, status, onStatusChange, disabled, index }) {
  const initials = `${student.first_name?.[0] || ""}${student.last_name?.[0] || ""}`.toUpperCase();

  return (
    <div className={`flex items-center gap-3 px-4 py-3 ${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"} hover:bg-orange-50/30 transition-colors`}>
      {/* Avatar */}
      <div className="flex-shrink-0">
        {student.photo_url ? (
          <img src={student.photo_url} alt={initials} className="w-10 h-10 rounded-full object-cover border-2 border-orange-100" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-400 flex items-center justify-center text-white font-bold text-sm">
            {initials}
          </div>
        )}
      </div>

      {/* Name & number */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{student.first_name} {student.last_name}</p>
        <p className="text-xs text-gray-400">{student.admission_no || `#${index + 1}`}</p>
      </div>

      {/* Status chips */}
      <div className="flex gap-1.5 flex-shrink-0">
        {["present", "absent", "late", "excused"].map(s => (
          <StatusChip key={s} value={s} status={status} onClick={onStatusChange} disabled={disabled} />
        ))}
      </div>
    </div>
  );
}