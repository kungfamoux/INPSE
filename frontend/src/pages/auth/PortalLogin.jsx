import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "../utils";
import { GraduationCap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const roleRoutes = {
  proprietor: "ProprietorDashboard",
  admin: "AdminDashboard",
  teacher: "TeacherDashboard",
  parent: "ParentDashboard",
  student: "StudentDashboard",
  accountant: "AdminDashboard",
  store_manager: "AdminStoreProducts",
};

export default function PortalLogin() {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const check = async () => {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) { setChecking(false); return; }

      const user = await base44.auth.me();

      // Check UserAccount record — only invited users have one
      const accounts = await base44.entities.UserAccount.filter({ user_email: user.email });
      const account = accounts[0];

      if (!account) {
        // Self-registered with no invite — no access
        window.location.href = createPageUrl("PendingApproval") + "?reason=no_account";
        return;
      }

      if (account.account_status === "suspended") {
        window.location.href = createPageUrl("PendingApproval") + "?reason=suspended";
        return;
      }

      if (account.account_status === "pending_activation") {
        window.location.href = createPageUrl("PendingApproval") + "?reason=pending";
        return;
      }

      // Mark email verified on first successful login
      if (!account.email_verified) {
        await base44.entities.UserAccount.update(account.id, { email_verified: true, last_login_at: new Date().toISOString() });
      } else {
        await base44.entities.UserAccount.update(account.id, { last_login_at: new Date().toISOString() });
      }

      const route = roleRoutes[account.role] || "AdminDashboard";
      window.location.href = createPageUrl(route);
    };
    check();
  }, []);

  const handleLogin = () => {
    base44.auth.redirectToLogin(window.location.href);
  };

  if (checking) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 bg-gray-50">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-3xl shadow-xl p-10">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center">
            <GraduationCap className="w-9 h-9 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Portal Login</h2>
          <p className="text-gray-500 mb-8 text-sm">
            Access your dashboard to view results, attendance, fees, and more.
          </p>
          <Button onClick={handleLogin} size="lg" className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 h-12 text-base shadow-lg shadow-orange-200">
            Sign In to Portal
          </Button>
          <p className="text-xs text-gray-400 mt-4">
            Having trouble logging in? Contact the school administration.
          </p>
        </div>
      </div>
    </div>
  );
}