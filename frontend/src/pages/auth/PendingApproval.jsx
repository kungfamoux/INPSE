import React from "react";
import { GraduationCap, Clock, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

export default function PendingApproval({ reason = "pending" }) {
  const handleLogout = () => base44.auth.logout("/PortalLogin");

  const messages = {
    pending: {
      icon: <Clock className="w-9 h-9 text-white" />,
      iconBg: "bg-gradient-to-br from-yellow-400 to-orange-500",
      title: "Account Pending Activation",
      body: "Your account has been created but is awaiting activation by a school administrator. You will be able to log in once your account is approved.",
    },
    suspended: {
      icon: <span className="text-3xl">🚫</span>,
      iconBg: "bg-gradient-to-br from-red-400 to-red-600",
      title: "Account Suspended",
      body: "Your account has been suspended. Please contact the school administration for assistance.",
    },
    no_account: {
      icon: <span className="text-3xl">🔒</span>,
      iconBg: "bg-gradient-to-br from-gray-400 to-gray-600",
      title: "No Portal Access",
      body: "Your email address does not have a portal account. Access to this portal is by invitation only. Please contact the school administration if you believe this is an error.",
    },
  };

  const msg = messages[reason] || messages.pending;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-3xl shadow-xl p-10">
          <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl ${msg.iconBg} flex items-center justify-center`}>
            {msg.icon}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">{msg.title}</h2>
          <p className="text-gray-500 mb-8 text-sm leading-relaxed">{msg.body}</p>
          <div className="p-4 bg-gray-50 rounded-2xl text-sm text-gray-500 mb-6">
            <p>For assistance, contact the school administration office.</p>
          </div>
          <Button onClick={handleLogout} variant="outline" className="w-full rounded-xl gap-2">
            <LogOut className="w-4 h-4" /> Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}