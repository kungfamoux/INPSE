import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import DataTable from "../components/portal/DataTable";
import OrderStatusBadge from "../components/store/OrderStatusBadge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { MapPin, Calendar, Package } from "lucide-react";

const STATUSES = ["pending", "paid", "processing", "ready_for_pickup", "fulfilled", "cancelled", "refunded"];

export default function AdminStoreOrders() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState(null);

  const { data: orders = [], isLoading } = useQuery({ queryKey: ["store-orders"], queryFn: () => base44.entities.StoreOrder.list("-created_date", 500) });
  const { data: payments = [] } = useQuery({ queryKey: ["store-payments"], queryFn: () => base44.entities.StorePayment.list("-created_date", 500) });

  const updateOrder = useMutation({
    mutationFn: ({ id, data }) => base44.entities.StoreOrder.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["store-orders"] }); if (selected) setSelected(o => ({ ...o, ...arguments[0] })); },
  });

  const filtered = statusFilter === "all" ? orders : orders.filter(o => o.status === statusFilter);

  const columns = [
    { key: "order_no", label: "Order #", render: r => <span className="font-mono font-semibold text-sm">{r.order_no}</span> },
    { key: "parent", label: "Parent", render: r => <span className="text-sm">{r.parent_email}</span> },
    { key: "date", label: "Date", render: r => r.created_date ? format(new Date(r.created_date), "MMM d, yyyy") : "—" },
    { key: "items", label: "Items", render: r => `${r.items?.length || 0} item(s)` },
    { key: "total", label: "Total", render: r => <span className="font-semibold">₦{r.total?.toLocaleString()}</span> },
    { key: "status", label: "Status", render: r => <OrderStatusBadge status={r.status} /> },
    { key: "payment", label: "Payment", render: r => <Badge className={`text-xs ${r.payment_status === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{r.payment_status}</Badge> },
    { key: "method", label: "Method", render: r => <span className="text-xs capitalize text-gray-500">{r.payment_method?.replace(/_/g, " ")}</span> },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-bold text-gray-900">Store Orders</h2>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-52 rounded-xl"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            {STATUSES.map(s => <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <DataTable columns={columns} data={filtered} isLoading={isLoading} onRowClick={setSelected} emptyMessage="No orders found." />

      {selected && (
        <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Order #{selected.order_no}</DialogTitle></DialogHeader>
            <div className="space-y-5">
              <div className="flex items-center gap-3 flex-wrap">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Order Status</p>
                  <Select value={selected.status} onValueChange={v => { updateOrder.mutate({ id: selected.id, data: { status: v } }); setSelected(o => ({ ...o, status: v })); }}>
                    <SelectTrigger className="w-52 rounded-xl h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Payment Status</p>
                  <Select value={selected.payment_status} onValueChange={v => { updateOrder.mutate({ id: selected.id, data: { payment_status: v } }); setSelected(o => ({ ...o, payment_status: v })); }}>
                    <SelectTrigger className="w-40 rounded-xl h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["unpaid", "paid", "partial", "refunded"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Items</h4>
                <div className="space-y-2">
                  {selected.items?.map((item, i) => (
                    <div key={i} className="flex gap-3 items-center bg-gray-50 rounded-xl p-3">
                      {item.image_url && <img src={item.image_url} alt={item.product_name} className="w-12 h-12 rounded-lg object-cover" />}
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.product_name}</p>
                        {item.variant_label && <p className="text-xs text-gray-400">{item.variant_label}</p>}
                        <p className="text-xs text-gray-400">Qty: {item.qty}</p>
                      </div>
                      <p className="text-sm font-semibold">₦{item.subtotal?.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-1">
                <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>₦{selected.subtotal?.toLocaleString()}</span></div>
                {selected.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>–₦{selected.discount?.toLocaleString()}</span></div>}
                <div className="flex justify-between font-bold text-base pt-1 border-t"><span>Total</span><span className="text-orange-600">₦{selected.total?.toLocaleString()}</span></div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-semibold text-gray-700 mb-1">Parent</p>
                  <p className="text-gray-500">{selected.parent_email}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700 mb-1">Payment Method</p>
                  <p className="text-gray-500 capitalize">{selected.payment_method?.replace(/_/g, " ")}</p>
                </div>
                {selected.pickup_date && <div><p className="font-semibold text-gray-700 mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> Pickup Date</p><p className="text-gray-500">{selected.pickup_date} {selected.pickup_time_slot && `· ${selected.pickup_time_slot}`}</p></div>}
                {selected.pickup_location && <div><p className="font-semibold text-gray-700 mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> Location</p><p className="text-gray-500">{selected.pickup_location}</p></div>}
              </div>

              {(() => { const p = payments.find(pay => pay.order_id === selected.id); return p?.proof_url ? (
                <div><p className="font-semibold text-gray-700 text-sm mb-1">Payment Proof</p><a href={p.proof_url} target="_blank" rel="noreferrer" className="text-orange-600 hover:underline text-sm">View proof ↗</a></div>
              ) : null; })()}

              {selected.notes && <div><p className="font-semibold text-gray-700 text-sm">Notes</p><p className="text-sm text-gray-500 mt-1">{selected.notes}</p></div>}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}