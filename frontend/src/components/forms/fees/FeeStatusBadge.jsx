import React from "react";
import { Badge } from "@/components/ui/badge";

const config = {
  unpaid:  { label: "Unpaid",   cls: "bg-red-100 text-red-700" },
  partial: { label: "Partial",  cls: "bg-yellow-100 text-yellow-700" },
  paid:    { label: "Paid",     cls: "bg-green-100 text-green-700" },
  overdue: { label: "Overdue",  cls: "bg-orange-100 text-orange-700" },
  pending:              { label: "Pending",              cls: "bg-gray-100 text-gray-600" },
  pending_verification: { label: "Pending Verification", cls: "bg-amber-100 text-amber-700" },
  confirmed:            { label: "Confirmed",            cls: "bg-green-100 text-green-700" },
  rejected:             { label: "Rejected",             cls: "bg-red-100 text-red-700" },
};

export default function FeeStatusBadge({ status }) {
  const c = config[status] || { label: status, cls: "bg-gray-100 text-gray-600" };
  return <Badge className={`text-xs capitalize ${c.cls}`}>{c.label}</Badge>;
}