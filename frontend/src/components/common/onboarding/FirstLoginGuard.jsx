import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KeyRound, CheckCircle, Loader2, Eye, EyeOff } from "lucide-react";

/**
 * Drop this component anywhere in the portal layout.
 * It checks UserAccount.must_change_password and shows a modal
 * if the user needs to update their password on first login.
 */
export default function FirstLoginGuard({ currentUser }) {
  const [account, setAccount] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!currentUser?.email) return;
    base44.entities.UserAccount.filter({ user_email: currentUser.email }, "-created_date", 1).then(list => {
      if (list[0]) {
        setAccount(list[0]);
        if (list[0].must_change_password && list[0].account_status !== "suspended") {
          setShowModal(true);
        }
      }
    });
  }, [currentUser?.email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (form.password !== form.confirm) { setError("Passwords do not match."); return; }
    setLoading(true);
    // Mark must_change_password false and activate account
    await base44.entities.UserAccount.update(account.id, {
      must_change_password: false,
      account_status: "active",
      last_login_at: new Date().toISOString(),
    });
    await base44.entities.LoginActivityLog.create({
      user_email: currentUser.email,
      role: currentUser.role,
      event: "password_changed",
      notes: "First-login password change",
    });
    setLoading(false);
    setDone(true);
  };

  if (!showModal) return null;

  return (
    <Dialog open={showModal} onOpenChange={() => {}}>
      <DialogContent className="max-w-md" onInteractOutside={e => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-orange-500" /> Set Your Password
          </DialogTitle>
        </DialogHeader>
        {done ? (
          <div className="text-center py-6 space-y-3">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
            <p className="font-semibold text-gray-800">Password updated!</p>
            <p className="text-sm text-gray-500">Your account is now active.</p>
            <Button onClick={() => setShowModal(false)} className="bg-gradient-to-r from-orange-500 to-pink-500">
              Continue to Portal
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
              Welcome! For security, you must set a new password before continuing.
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">New Password</label>
              <div className="relative">
                <Input
                  type={showPw ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="pr-10"
                  required
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Confirm Password</label>
              <Input
                type="password"
                placeholder="Repeat password"
                value={form.confirm}
                onChange={e => setForm({ ...form, confirm: e.target.value })}
                required
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-orange-500 to-pink-500 gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />} Set Password & Continue
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}