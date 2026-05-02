import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Badge } from "@/components/ui/badge";
import { Megaphone } from "lucide-react";
import { format } from "date-fns";

export default function TeacherAnnouncements() {
  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ["announcements"],
    queryFn: () => base44.entities.Announcement.filter({ is_published: true }, "-created_date", 50),
  });

  const filtered = announcements.filter(a => a.audience === "all" || a.audience === "teachers");

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-white rounded-xl animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center"><p className="text-gray-400">No announcements.</p></div>
      ) : (
        filtered.map(a => (
          <div key={a.id} className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-orange-500" />
                <h3 className="font-semibold text-gray-900">{a.title}</h3>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={`text-xs ${a.priority === "urgent" ? "bg-red-100 text-red-700" : a.priority === "important" ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-600"}`}>{a.priority}</Badge>
                {a.created_date && <span className="text-xs text-gray-400">{format(new Date(a.created_date), "MMM d, yyyy")}</span>}
              </div>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">{a.body}</p>
          </div>
        ))
      )}
    </div>
  );
}