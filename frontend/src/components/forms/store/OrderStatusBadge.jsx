import React from "react";
import { Badge } from "@/components/ui/badge";

const STATUS_STYLES = {
  pending: "bg-yellow-100 text-yellow-700",
  paid: "bg-blue-100 text-blue-700",
  processing: "bg-indigo-100 text-indigo-700",
  ready_for_pickup: "bg-purple-100 text-purple-700",
  fulfilled: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  refunded: "bg-gray-100 text-gray-600",
};

const STATUS_LABELS = {
  pending: "Pending",
  paid: "Paid",
  processing: "Processing",
  ready_for_pickup: "Ready for Pickup",
  fulfilled: "Fulfilled",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export default function OrderStatusBadge({ status }) {
  return (
    <Badge className={`text-xs font-medium ${STATUS_STYLES[status] || "bg-gray-100 text-gray-600"}`}>
      {STATUS_LABELS[status] || status}
    </Badge>
  );
}