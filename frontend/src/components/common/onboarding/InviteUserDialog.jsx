import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, CheckCircle, Loader2 } from "lucide-react";

export default function InviteUserDialog({ open, onClose, allowedRoles, currentUser }) {
  const qc = useQueryClient();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState(allowedRoles?.[0] || "teacher");
  const [done, setDone] = useState(false);

  const inviteMut = useMutation({
    mutationFn: async ({ email, role }) => {
      // Invite via base44 auth (admin = admin platform role, others = user)
      const platformRole = ["proprietor", "admin"].includes(role) ? "admin" : "user";
      await base44.users.inviteUser(email, platformRole);
      // Create UserAccount record to track role + status
      await base44.entities.UserAccount.create({
        user_email: email,
        role,
        account_status: "pending_activation",
        must_change_password: true,
        invited_by: currentUser?.email,
        invite_sent_at: new Date().toISOString(),
      });
      // Log the invite
      await base44.entities.LoginActivityLog.create({
        user_email: email,
        role,
        event: "invite_sent",
        notes: `Invited by ${currentUser?.email}`,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries(["user-accounts"]);
      qc.invalidateQueries(["all-users"]);
      setDone(true);
    },
  });

  const handleClose = () => {
    setDone(false);
    setEmail("");
    setRole(allowedRoles?.[0] || "teacher");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-orange-500" /> Invite New User
          </DialogTitle>
        </DialogHeader>

        {done ? (
          <div className="text-center py-6 space-y-3">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
            <p className="font-semibold text-gray-800">Invitation sent!</p>
            <p className="text-sm text-gray-500">{email} will receive an activation email.</p>
            <Button onClick={handleClose} className="bg-gradient-to-r from-orange-500 to-pink-500 mt-2">Done</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Email Address *</label>
              <Input
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="rounded-xl"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Role *</label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(allowedRoles || ["teacher", "admin", "accountant", "store_manager"]).map(r => (
                    <SelectItem key={r} value={r} className="capitalize">{r.replace("_", " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
              The user will receive an email invitation and must set their password on first login.
            </div>
            <div className="flex gap-2 justify-end pt-1">
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button
                onClick={() => inviteMut.mutate({ email, role })}
                disabled={!email || inviteMut.isPending}
                className="bg-gradient-to-r from-orange-500 to-pink-500 border-0 text-white gap-2"
              >
                {inviteMut.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Send Invite
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}