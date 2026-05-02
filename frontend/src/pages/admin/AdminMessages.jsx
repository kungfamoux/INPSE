import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import DataTable from "../components/portal/DataTable";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export default function AdminMessages() {
  const [selected, setSelected] = useState(null);
  const qc = useQueryClient();

  const { data: messages = [], isLoading } = useQuery({ queryKey: ["messages"], queryFn: () => base44.entities.ContactMessage.list("-created_date", 200) });
  const markRead = useMutation({
    mutationFn: id => base44.entities.ContactMessage.update(id, { is_read: true }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["messages"] }),
  });

  const columns = [
    { key: "name", label: "Name", render: r => <span className={`font-medium ${!r.is_read ? "text-gray-900" : "text-gray-500"}`}>{r.name}</span> },
    { key: "email", label: "Email" },
    { key: "subject", label: "Subject", render: r => r.subject || "—" },
    { key: "is_read", label: "Status", render: r => r.is_read ? <Badge className="text-xs bg-gray-100 text-gray-500">Read</Badge> : <Badge className="text-xs bg-blue-100 text-blue-700">New</Badge> },
    { key: "created_date", label: "Date", render: r => r.created_date ? format(new Date(r.created_date), "MMM d, yyyy") : "—" },
  ];

  const handleOpen = (msg) => {
    setSelected(msg);
    if (!msg.is_read) markRead.mutate(msg.id);
  };

  return (
    <div className="space-y-6">
      <p className="text-gray-500 text-sm">{messages.filter(m => !m.is_read).length} unread messages</p>
      <DataTable columns={columns} data={messages} isLoading={isLoading} onRowClick={handleOpen} emptyMessage="No messages yet" />

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Message from {selected?.name}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-gray-400">Email</p><p className="font-medium">{selected.email}</p></div>
                <div><p className="text-gray-400">Phone</p><p className="font-medium">{selected.phone || "—"}</p></div>
              </div>
              {selected.subject && <div><p className="text-gray-400">Subject</p><p className="font-medium">{selected.subject}</p></div>}
              <div><p className="text-gray-400">Message</p><p className="mt-1 whitespace-pre-wrap bg-gray-50 rounded-xl p-4">{selected.message}</p></div>
              <div className="flex justify-end"><Button variant="outline" onClick={() => setSelected(null)}>Close</Button></div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}