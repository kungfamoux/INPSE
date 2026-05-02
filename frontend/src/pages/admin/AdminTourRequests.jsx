import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Phone, Mail, Baby, MessageSquare, Clock } from "lucide-react";
import { format } from "date-fns";

const STATUS_COLORS = {
  New: "bg-blue-100 text-blue-700",
  Contacted: "bg-yellow-100 text-yellow-700",
  Scheduled: "bg-purple-100 text-purple-700",
  Completed: "bg-green-100 text-green-700",
};

export default function AdminTourRequests({ currentUser }) {
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState("all");

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["tour-requests"],
    queryFn: () => base44.entities.TourRequest.list("-created_date", 100),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.TourRequest.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tour-requests"] }),
  });

  const filtered = filterStatus === "all" ? requests : requests.filter((r) => r.status === filterStatus);

  const counts = requests.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tour Requests</h1>
          <p className="text-sm text-gray-500 mt-1">Manage physical school visit bookings</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {["New", "Contacted", "Scheduled", "Completed"].map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(filterStatus === s ? "all" : s)}
            className={`p-4 rounded-xl border text-left transition-all ${filterStatus === s ? "border-orange-400 bg-orange-50" : "border-gray-200 bg-white hover:bg-gray-50"}`}
          >
            <p className="text-2xl font-bold text-gray-900">{counts[s] || 0}</p>
            <p className={`text-xs font-semibold mt-1 ${STATUS_COLORS[s].split(" ")[1]}`}>{s}</p>
          </button>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Requests</SelectItem>
            <SelectItem value="New">New</SelectItem>
            <SelectItem value="Contacted">Contacted</SelectItem>
            <SelectItem value="Scheduled">Scheduled</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-gray-500">{filtered.length} record{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Table / cards */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No tour requests found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((req) => (
            <div key={req.id} className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-gray-900">{req.parentName}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[req.status] || "bg-gray-100 text-gray-600"}`}>{req.status}</span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                  <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {req.phone}</span>
                  {req.email && <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {req.email}</span>}
                  <span className="flex items-center gap-1"><Baby className="w-3.5 h-3.5" /> {req.childAge}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {req.preferredDate ? format(new Date(req.preferredDate), "MMM d, yyyy") : "—"}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {req.created_date ? format(new Date(req.created_date), "MMM d, yyyy") : "—"}</span>
                </div>
                {req.notes && (
                  <p className="text-sm text-gray-400 flex items-start gap-1">
                    <MessageSquare className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">{req.notes}</span>
                  </p>
                )}
              </div>
              <div className="flex-shrink-0">
                <Select
                  value={req.status}
                  onValueChange={(val) => updateMutation.mutate({ id: req.id, status: val })}
                >
                  <SelectTrigger className="w-36 text-xs h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="New">New</SelectItem>
                    <SelectItem value="Contacted">Contacted</SelectItem>
                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}