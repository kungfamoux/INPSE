import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Info, CheckCircle, AlertTriangle, AlertOctagon, X, CheckCheck, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { createPageUrl } from "../../utils";

const TYPE_CONFIG = {
  info:    { icon: Info,         cls: "text-blue-500",   bg: "bg-blue-50",   ring: "bg-blue-500" },
  success: { icon: CheckCircle,  cls: "text-green-500",  bg: "bg-green-50",  ring: "bg-green-500" },
  warning: { icon: AlertTriangle,cls: "text-yellow-500", bg: "bg-yellow-50", ring: "bg-yellow-500" },
  urgent:  { icon: AlertOctagon, cls: "text-red-500",    bg: "bg-red-50",    ring: "bg-red-500" },
};

export default function NotificationBell({ user }) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const qc = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications", user?.email, user?.role],
    queryFn: async () => {
      if (!user?.email) return [];
      const all = await base44.entities.Notification.list("-created_date", 50);
      const now = new Date();
      return all.filter(n => {
        if (n.expires_at && new Date(n.expires_at) < now) return false;
        if (n.user_email && n.user_email !== user.email) return false;
        if (n.role && n.role !== user.role) return false;
        // No specific targeting = broadcast to all
        return true;
      });
    },
    refetchInterval: 30000,
    enabled: !!user?.email,
  });

  const unread = notifications.filter(n => !n.is_read);

  const markRead = useMutation({
    mutationFn: (id) => base44.entities.Notification.update(id, { is_read: true }),
    onSuccess: () => qc.invalidateQueries(["notifications", user?.email, user?.role]),
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      await Promise.all(unread.map(n => base44.entities.Notification.update(n.id, { is_read: true })));
    },
    onSuccess: () => qc.invalidateQueries(["notifications", user?.email, user?.role]),
  });

  const handleClick = (n) => {
    if (!n.is_read) markRead.mutate(n.id);
    if (n.link) window.location.href = n.link;
    setOpen(false);
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors"
      >
        <Bell className="w-5 h-5" style={{ color: unread.length > 0 ? "var(--brand-primary)" : "#6b7280" }} />
        {unread.length > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none" style={{ background: "var(--brand-primary)" }}>
            {unread.length > 99 ? "99+" : unread.length}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* Mobile backdrop */}
          <div className="fixed inset-0 bg-black/20 z-40 lg:hidden" onClick={() => setOpen(false)} />

          {/* Panel */}
          <div className="fixed lg:absolute right-0 lg:right-0 top-0 lg:top-auto lg:mt-2 h-full lg:h-auto w-full sm:w-96 lg:w-96 bg-white rounded-none lg:rounded-2xl shadow-2xl border border-gray-100 z-50 flex flex-col max-h-screen lg:max-h-[520px]">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-orange-500" />
                <span className="font-semibold text-gray-900 text-sm">Notifications</span>
                {unread.length > 0 && (
                  <span className="text-xs bg-orange-100 text-orange-600 font-semibold px-2 py-0.5 rounded-full">{unread.length} new</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unread.length > 0 && (
                  <button
                    onClick={() => markAllRead.mutate()}
                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium"
                  >
                    <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-gray-100 lg:hidden">
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <Bell className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                notifications.map(n => {
                  const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.info;
                  const Icon = cfg.icon;
                  return (
                    <button
                      key={n.id}
                      onClick={() => handleClick(n)}
                      className={`w-full text-left flex gap-3 px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${!n.is_read ? "bg-orange-50/40" : ""}`}
                    >
                      <div className={`mt-0.5 w-8 h-8 rounded-full ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-4 h-4 ${cfg.cls}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm font-medium text-gray-900 leading-snug ${!n.is_read ? "font-semibold" : ""}`}>{n.title}</p>
                          {!n.is_read && <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${cfg.ring}`} />}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-[10px] text-gray-400">{n.created_date ? format(new Date(n.created_date), "MMM d, h:mm a") : ""}</p>
                          {n.link && <ExternalLink className="w-3 h-3 text-gray-400" />}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}