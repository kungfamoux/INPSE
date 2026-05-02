import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import OrderStatusBadge from "../components/store/OrderStatusBadge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Download, Calendar, MapPin } from "lucide-react";
import { format } from "date-fns";

export default function ParentOrders({ currentUser }) {
  const [selected, setSelected] = useState(null);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["store-orders", currentUser?.email],
    queryFn: () => base44.entities.StoreOrder.filter({ parent_email: currentUser?.email }, "-created_date"),
  });

  const { data: payments = [] } = useQuery({
    queryKey: ["store-payments"],
    queryFn: () => base44.entities.StorePayment.list("-created_date", 500),
  });

  const getPayment = (orderId) => payments.find(p => p.order_id === orderId);

  if (isLoading) return <div className="animate-pulse space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-24 bg-white rounded-2xl" />)}</div>;

  return (
    <div className="space-y-4">
      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center">
          <Package className="w-12 h-12 mx-auto mb-3 text-gray-200" />
          <p className="text-gray-400">No orders yet. Visit the store to get started!</p>
        </div>
      ) : (
        orders.map(order => (
          <div
            key={order.id}
            className="bg-white rounded-2xl p-5 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setSelected(order)}
          >
            <div className="flex items-start justify-between flex-wrap gap-2">
              <div>
                <p className="font-bold text-gray-900">#{order.order_no}</p>
                <p className="text-xs text-gray-400 mt-0.5">{order.created_date ? format(new Date(order.created_date), "MMM d, yyyy · h:mm a") : "—"}</p>
              </div>
              <div className="flex items-center gap-2">
                <OrderStatusBadge status={order.status} />
                <Badge className={`text-xs ${order.payment_status === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                  {order.payment_status}
                </Badge>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
              <span>{order.items?.length || 0} item(s)</span>
              <span className="font-semibold text-gray-900">₦{order.total?.toLocaleString()}</span>
              <span className="capitalize">{order.payment_method?.replace(/_/g, " ")}</span>
            </div>
            {order.pickup_date && (
              <p className="mt-2 text-xs text-gray-400 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Pickup: {order.pickup_date} {order.pickup_time_slot && `· ${order.pickup_time_slot}`}
              </p>
            )}
          </div>
        ))
      )}

      {/* Order Detail Modal */}
      {selected && (
        <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Order #{selected.order_no}</DialogTitle>
            </DialogHeader>
            <div className="space-y-5">
              <div className="flex flex-wrap gap-2">
                <OrderStatusBadge status={selected.status} />
                <Badge className={`text-xs ${selected.payment_status === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{selected.payment_status}</Badge>
              </div>

              {/* Items */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Items</h4>
                <div className="space-y-2">
                  {selected.items?.map((item, i) => (
                    <div key={i} className="flex gap-3 items-center bg-gray-50 rounded-xl p-3">
                      {item.image_url && <img src={item.image_url} alt={item.product_name} className="w-12 h-12 rounded-lg object-cover" />}
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.product_name}</p>
                        {item.variant_label && <p className="text-xs text-gray-400">{item.variant_label}</p>}
                      </div>
                      <p className="text-sm font-semibold">₦{item.subtotal?.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-1 text-sm">
                <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>₦{selected.subtotal?.toLocaleString()}</span></div>
                {selected.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>–₦{selected.discount?.toLocaleString()}</span></div>}
                <div className="flex justify-between font-bold text-base pt-1 border-t"><span>Total</span><span className="text-orange-600">₦{selected.total?.toLocaleString()}</span></div>
              </div>

              {/* Pickup */}
              {(selected.pickup_date || selected.pickup_location) && (
                <div className="text-sm space-y-1">
                  <p className="font-semibold text-gray-700">Pickup Info</p>
                  {selected.pickup_location && <p className="text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> {selected.pickup_location}</p>}
                  {selected.pickup_date && <p className="text-gray-500 flex items-center gap-1"><Calendar className="w-3 h-3" /> {selected.pickup_date} {selected.pickup_time_slot && `· ${selected.pickup_time_slot}`}</p>}
                </div>
              )}

              {/* Payment proof */}
              {(() => { const p = getPayment(selected.id); return p?.proof_url ? (
                <div className="text-sm">
                  <p className="font-semibold text-gray-700 mb-1">Payment Proof</p>
                  <a href={p.proof_url} target="_blank" rel="noreferrer" className="text-orange-600 hover:underline text-xs">View uploaded proof ↗</a>
                </div>
              ) : null; })()}

              {selected.notes && (
                <div><p className="font-semibold text-gray-700 text-sm">Notes</p><p className="text-sm text-gray-500 mt-1">{selected.notes}</p></div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}