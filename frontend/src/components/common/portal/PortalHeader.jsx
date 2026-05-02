import React from "react";
import { Menu } from "lucide-react";
import NotificationBell from "../notifications/NotificationBell";

export default function PortalHeader({ user, title, onMenuToggle }) {
  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button onClick={onMenuToggle} className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
          <Menu className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
      </div>
      
      <div className="flex items-center gap-3">
        <NotificationBell user={user} />
        <div style={{ background: "linear-gradient(to bottom right, var(--brand-primary), var(--brand-secondary))" }} className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-xs">
          {user?.full_name?.[0] || "U"}
        </div>
      </div>
    </header>
  );
}