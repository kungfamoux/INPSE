import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import DataTable from "../components/portal/DataTable";
import StatCard from "../components/portal/StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CreditCard, CheckCircle, AlertCircle, DollarSign } from "lucide-react";
import { format } from "date-fns";

export default function AdminStorePayments() {
  const qc = useQueryClient();
  const [selected, setSelected] = useState(null);

  const { data: payments = [], isLoading } = useQuery({ queryKey: ["store-payments"], queryFn: () => base44.entities.StorePayment.list("-created_date", 500) });
  const { data: orders = [] } = useQuery({ queryKey: ["store-orders"], queryFn: () => base44.entities.StoreOrder.list("-created_date", 500) });

  const updatePayment = useMutation({
    mutationFn: ({ id, data }) => base44.entities.StorePayment.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["store-payments"] }); },
  });

  const orderMap = Object.fromEntries(orders.map(o => [o.id, o]));

  const totalConfirmed = payments.filter(p => p.status === "confirmed").reduce((s, p) => s + (p.amount || 0), 0);
  const totalPending = payments.filter(p => p.status === "pending").reduce((s, p) => s + (p.amount || 0), 0);
  const statusColors = { pending: "bg-yellow-100 text-yellow-700", confirmed: "bg-green-100 text-green-700", failed: "bg-red-100 text-red-700", refunded: "bg-gray-100 text-gray-600" };

  const columns = [
    { key: "order", label: "Order", render: r => <span className="font-mono text-xs">{orderMap[r.order_id]?.order_no || r.order_id}</span> },
    { key: "parent", label: "Parent", render: r => <span className="text-sm">{orderMap[r.order_id]?.parent_email || "—"}</span> },
    { key: "amount", label: "Amount", render: r => <span className="font-semibold">₦{r.amount?.toLocaleString()}</span> },
    { key: "method", label: "Method", render: r => <span className="text-xs capitalize text-gray-500">{r.method?.replace(/_/g, " ")}</span> },
    { key: "status", label: "Status", render: r => <Badge className={`text-xs ${statusColors[r.status]}`}>{r.status}</Badge> },
    { key: "date", label: "Date", render: r => r.created_date ? format(new Date(r.created_date), "MMM d, yyyy") : "—" },
    { key: "proof", label: "Proof", render: r => r.proof_url ? <a href={r.proof_url} target="_blank" rel="noreferrer" className="text-orange-600 hover:underline text-xs">View ↗</a> : "—" },
  ];

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold text-gray-900">Store Payments</h2>

      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard title="Total Received" value={`₦${totalConfirmed.toLocaleString()}`} icon={CheckCircle} color="green" />
        <StatCard title="Pending Verification" value={`₦${totalPending.toLocaleString()}`} icon={AlertCircle} color="orange" />
        <StatCard title="Total Transactions" value={payments.length} icon={CreditCard} color="blue" />
      </div>

      <DataTable
        columns={columns}
        data={payments}
        isLoading={isLoading}
        onRowClick={setSelected}
        emptyMessage="No payment records."
      />

      {selected && (
        <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>Payment Details</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-xs text-gray-500">Order</p><p className="font-mono font-semibold">{orderMap[selected.order_id]?.order_no || "—"}</p></div>
                <div><p className="text-xs text-gray-500">Amount</p><p className="font-bold text-orange-600">₦{selected.amount?.toLocaleString()}</p></div>
                <div><p className="text-xs text-gray-500">Method</p><p className="capitalize">{selected.method?.replace(/_/g, " ")}</p></div>
                <div><p className="text-xs text-gray-500">Reference</p><p className="font-mono text-xs">{selected.reference || "—"}</p></div>
              </div>
              {selected.proof_url && <a href={selected.proof_url} target="_blank" rel="noreferrer" className="block text-orange-600 hover:underline text-sm">📎 View proof ↗</a>}
              <div>
                <p className="text-xs text-gray-500 mb-1">Update Status</p>
                <Select value={selected.status} onValueChange={v => { updatePayment.mutate({ id: selected.id, data: { status: v } }); setSelected(s => ({ ...s, status: v })); }}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["pending", "confirmed", "failed", "refunded"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}