import React from "react";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, XCircle } from "lucide-react";

const config = {
  pending_activation: { label: "Pending", cls: "bg-yellow-100 text-yellow-700", icon: Clock },
  active: { label: "Active", cls: "bg-green-100 text-green-700", icon: CheckCircle },
  suspended: { label: "Suspended", cls: "bg-red-100 text-red-700", icon: XCircle },
};

export default function AccountStatusBadge({ status }) {
  const c = config[status] || config.pending_activation;
  const Icon = c.icon;
  return (
    <Badge className={`text-xs gap-1 inline-flex items-center ${c.cls}`}>
      <Icon className="w-3 h-3" /> {c.label}
    </Badge>
  );
}