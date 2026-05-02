import React from "react";

export default function StatCard({ title, value, icon: Icon, color = "orange", trend }) {
  const colors = {
    orange: "from-orange-500 to-pink-500 shadow-orange-200",
    blue: "from-blue-500 to-indigo-500 shadow-blue-200",
    green: "from-green-500 to-emerald-500 shadow-green-200",
    purple: "from-purple-500 to-violet-500 shadow-purple-200",
    red: "from-red-500 to-rose-500 shadow-red-200",
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {trend && <p className="text-xs text-green-600 font-medium mt-2">{trend}</p>}
        </div>
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${colors[color]} shadow-lg flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );
}