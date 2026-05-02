import React from "react";
import { Banknote, CreditCard, Smartphone, Building2, Wallet } from "lucide-react";

const config = {
  cash:             { label: "Cash",          icon: Banknote,    cls: "bg-green-50 text-green-700" },
  bank_transfer:    { label: "Bank Transfer", icon: Building2,   cls: "bg-blue-50 text-blue-700" },
  card:             { label: "Card",          icon: CreditCard,  cls: "bg-purple-50 text-purple-700" },
  online_paystack:  { label: "Paystack",      icon: Smartphone,  cls: "bg-orange-50 text-orange-700" },
  offline_cash:     { label: "Offline / Cash",icon: Wallet,      cls: "bg-amber-50 text-amber-700" },
};

export default function PaymentMethodBadge({ method }) {
  const c = config[method] || { label: method, icon: CreditCard, cls: "bg-gray-100 text-gray-600" };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium ${c.cls}`}>
      <c.icon className="w-3 h-3" />
      {c.label}
    </span>
  );
}