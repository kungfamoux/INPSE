import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Mail, Shield, Clock, CheckCircle, XCircle, UserPlus, Upload, History, Crown, Loader2 } from "lucide-react";
import AccountStatusBadge from "../components/onboarding/AccountStatusBadge";
import InviteUserDialog from "../components/onboarding/InviteUserDialog";
import BulkImportDialog from "../components/onboarding/BulkImportDialog";
import { format } from "date-fns";
import { logAudit } from "../utils/auditLogger";

const ROLE_COLORS = {
  proprietor: "bg-gradient-to-r from-orange-500 to-pink-500 text-white",
  admin: "bg-purple-100 text-purple-700",
  teacher: "bg-blue-100 text-blue-700",
  parent: "bg-green-100 text-green-700",
  student: "bg-yellow-100 text-yellow-700",
  accountant: "bg-indigo-100 text-indigo-700",
  store_manager: "bg-pink-100 text-pink-700",
};

export default function AdminOnboarding({ currentUser }) {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showInvite, setShowInvite] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [editAccount, setEditAccount] = useState(null);

  const isProprietor = currentUser?.role === "proprietor";

  const [registeringUser, setRegisteringUser] = useState(null);
  const [registerRole, setRegisterRole] = useState("teacher");

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ["user-accounts"],
    queryFn: () => base44.entities.UserAccount.list("-created_date", 500),
  });
  const { data: platformUsers = [] } = useQuery({
    queryKey: ["platform-users"],
    queryFn: () => base44.entities.User.list(),
  });
  const { data: classes = [] } = useQuery({
    queryKey: ["classes"],
    queryFn: () => base44.entities.SchoolClass.list(),
  });
  const { data: logs = [] } = useQuery({
    queryKey: ["login-logs"],
    queryFn: () => base44.entities.LoginActivityLog.list("-created_date", 100),
  });

  // Users who signed up on the platform but have no UserAccount record yet
  const accountEmails = new Set(accounts.map(a => a.user_email));
  const unregisteredUsers = platformUsers.filter(u => !accountEmails.has(u.email));

  const createAccountMut = useMutation({
    mutationFn: ({ email, role }) => base44.entities.UserAccount.create({
      user_email: email,
      role,
      account_status: "active",
      invited_by: currentUser?.email,
      activated_by: currentUser?.email,
      activated_at: new Date().toISOString(),
      email_verified: true,
    }),
    onSuccess: (created, { email, role }) => {
      qc.invalidateQueries(["user-accounts"]);
      qc.invalidateQueries(["platform-users"]);
      logAudit(currentUser, { action: "CREATE_ACCOUNT", module: "Accounts", entity_type: "UserAccount", entity_id: created.id, summary: `Created & activated account for ${email} as ${role}`, new_values: { user_email: email, role, account_status: "active" } });
      setRegisteringUser(null);
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data, prevStatus }) => {
      const update = { ...data };
      if (prevStatus !== "active" && data.account_status === "active") {
        update.activated_by = currentUser?.email;
        update.activated_at = new Date().toISOString();
      }
      return base44.entities.UserAccount.update(id, update);
    },
    onSuccess: (_, { id, data, oldData }) => {
      qc.invalidateQueries(["user-accounts"]);
      const action = oldData?.role !== data.role ? "ASSIGN_ROLE" : oldData?.account_status !== data.account_status ? "UPDATE_ACCOUNT_STATUS" : "UPDATE_ACCOUNT";
      logAudit(currentUser, { action, module: "Accounts", entity_type: "UserAccount", entity_id: id, summary: `${action.replace(/_/g, " ")}: ${data.user_email}`, old_values: oldData ? { role: oldData.role, account_status: oldData.account_status } : null, new_values: { role: data.role, account_status: data.account_status } });
      setEditAccount(null);
    },
  });

  const deleteMut = useMutation({
    mutationFn: ({ id }) => base44.entities.UserAccount.delete(id),
    onSuccess: (_, { id, record }) => {
      qc.invalidateQueries(["user-accounts"]);
      logAudit(currentUser, { action: "DELETE_ACCOUNT", module: "Accounts", entity_type: "UserAccount", entity_id: id, summary: `Deleted account: ${record?.user_email} (${record?.role})`, old_values: record ? { user_email: record.user_email, role: record.role } : null });
    },
  });

  const filtered = accounts.filter(a => {
    const matchSearch = !search || a.user_email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === "all" || a.role === filterRole;
    const matchStatus = filterStatus === "all" || a.account_status === filterStatus;
    return matchSearch && matchRole && matchStatus;
  });

  const allowedRoles = isProprietor
    ? ["admin", "teacher", "parent", "student", "accountant", "store_manager"]
    : ["teacher", "parent", "accountant", "store_manager"];

  const stats = [
    { label: "Total", value: accounts.length, icon: Shield, color: "text-gray-600" },
    { label: "Active", value: accounts.filter(a => a.account_status === "active").length, icon: CheckCircle, color: "text-green-600" },
    { label: "Pending", value: accounts.filter(a => a.account_status === "pending_activation").length, icon: Clock, color: "text-yellow-600" },
    { label: "Suspended", value: accounts.filter(a => a.account_status === "suspended").length, icon: XCircle, color: "text-red-500" },
  ];

  const eventIcons = { login: "🔐", logout: "👋", password_changed: "🔑", account_suspended: "🚫", account_activated: "✅", invite_sent: "📧" };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Onboarding</h2>
          <p className="text-gray-500 text-sm">Invitation-based account management with role-based access</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowBulk(true)} className="gap-2 text-sm">
            <Upload className="w-4 h-4" /> Bulk Import
          </Button>
          <Button onClick={() => setShowInvite(true)} className="bg-gradient-to-r from-orange-500 to-pink-500 border-0 text-white gap-2">
            <UserPlus className="w-4 h-4" /> Invite User
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
            <s.icon className={`w-7 h-7 ${s.color}`} />
            <div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <Tabs defaultValue="accounts">
        <TabsList className="bg-gray-100 rounded-xl p-1">
          <TabsTrigger value="accounts" className="rounded-lg text-sm">Accounts</TabsTrigger>
          <TabsTrigger value="logs" className="rounded-lg text-sm">
            <History className="w-3.5 h-3.5 mr-1" /> Activity Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="mt-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input className="pl-9 rounded-xl" placeholder="Search by email..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-36 rounded-xl"><SelectValue placeholder="Role" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {["proprietor","admin","teacher","parent","student","accountant","store_manager"].map(r => (
                  <SelectItem key={r} value={r} className="capitalize">{r.replace("_"," ")}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-44 rounded-xl"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending_activation">Pending</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Email</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Role</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Invited By</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Verified</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i}><td colSpan={6} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td></tr>
                  ))
                ) : filtered.map(a => (
                  <tr key={a.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-100 to-pink-100 flex items-center justify-center text-orange-600 font-bold text-xs flex-shrink-0">
                          {a.user_email?.[0]?.toUpperCase()}
                        </div>
                        <span className="text-sm text-gray-900 font-medium">{a.user_email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium capitalize ${ROLE_COLORS[a.role] || "bg-gray-100 text-gray-600"}`}>
                        {a.role === "proprietor" && <Crown className="w-3 h-3" />}
                        {a.role?.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3"><AccountStatusBadge status={a.account_status} /></td>
                    <td className="px-4 py-3 text-xs text-gray-500 hidden md:table-cell">{a.invited_by || "—"}</td>
                    <td className="px-4 py-3 text-xs hidden lg:table-cell">
                      {a.email_verified
                        ? <span className="inline-flex items-center gap-1 text-green-600"><CheckCircle className="w-3 h-3" /> Verified</span>
                        : <span className="text-gray-400">Not yet</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {a.role !== "proprietor" && (
                        <Button size="sm" variant="ghost" onClick={() => setEditAccount(a)} className="text-xs gap-1 h-7">
                          Manage
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
                {!isLoading && filtered.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-12 text-gray-400 text-sm">No accounts found</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {/* Unregistered platform users */}
          {unregisteredUsers.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl overflow-hidden">
              <div className="px-4 py-3 border-b border-yellow-200 flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-semibold text-yellow-800">
                  {unregisteredUsers.length} user{unregisteredUsers.length > 1 ? "s" : ""} signed up without an account record
                </span>
                <span className="text-xs text-yellow-600 ml-1">— assign a role to activate them</span>
              </div>
              <table className="w-full">
                <tbody className="divide-y divide-yellow-100">
                  {unregisteredUsers.map(u => (
                    <tr key={u.id} className="hover:bg-yellow-100/40">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-yellow-200 flex items-center justify-center text-yellow-700 font-bold text-xs flex-shrink-0">
                            {u.email?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{u.full_name || "—"}</p>
                            <p className="text-xs text-gray-500">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button size="sm" onClick={() => { setRegisteringUser(u); setRegisterRole("teacher"); }}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs gap-1 h-7">
                          <UserPlus className="w-3 h-3" /> Assign Role & Activate
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="logs" className="mt-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-50">
            {logs.length === 0 && <p className="text-center text-gray-400 py-12 text-sm">No activity logs yet</p>}
            {logs.map(log => (
              <div key={log.id} className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50/50">
                <span className="text-lg mt-0.5">{eventIcons[log.event] || "📋"}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">{log.user_email}</span>
                    <span className="text-gray-500"> — {log.event?.replace("_", " ")}</span>
                  </p>
                  {log.notes && <p className="text-xs text-gray-400 mt-0.5">{log.notes}</p>}
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">
                  {log.created_date ? format(new Date(log.created_date), "MMM d, HH:mm") : ""}
                </span>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Account Dialog */}
      <Dialog open={!!editAccount} onOpenChange={() => setEditAccount(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Manage Account</DialogTitle></DialogHeader>
          {editAccount && (
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-xl text-sm">
                <p className="font-medium text-gray-900">{editAccount.user_email}</p>
                <p className="text-gray-400 capitalize">{editAccount.role?.replace("_", " ")}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Account Status</label>
                <Select value={editAccount.account_status}
                  onValueChange={v => setEditAccount({ ...editAccount, account_status: v })}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending_activation">Pending Activation</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Role</label>
                <Select value={editAccount.role}
                  onValueChange={v => setEditAccount({ ...editAccount, role: v })}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {allowedRoles.map(r => (
                      <SelectItem key={r} value={r} className="capitalize">{r.replace("_", " ")}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <input type="checkbox" id="mcp" checked={!!editAccount.must_change_password}
                  onChange={e => setEditAccount({ ...editAccount, must_change_password: e.target.checked })}
                  className="rounded" />
                <label htmlFor="mcp" className="text-gray-700">Force password change on next login</label>
              </div>
              <div className="flex gap-2 justify-between pt-1">
                <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700 text-xs"
                  onClick={() => { if (confirm("Delete this account record?")) deleteMut.mutate({ id: editAccount.id, record: editAccount }); setEditAccount(null); }}>
                  Delete
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setEditAccount(null)}>Cancel</Button>
                  <Button onClick={() => updateMut.mutate({ id: editAccount.id, data: editAccount, oldData: accounts.find(a => a.id === editAccount.id), prevStatus: accounts.find(a => a.id === editAccount.id)?.account_status })}
                    className="bg-gradient-to-r from-orange-500 to-pink-500 border-0 text-white">
                    Save
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <InviteUserDialog open={showInvite} onClose={() => setShowInvite(false)} allowedRoles={allowedRoles} currentUser={currentUser} />
      <BulkImportDialog open={showBulk} onClose={() => setShowBulk(false)} classes={classes} />

      {/* Assign role & activate dialog for self-registered users */}
      <Dialog open={!!registeringUser} onOpenChange={() => setRegisteringUser(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Assign Role & Activate</DialogTitle></DialogHeader>
          {registeringUser && (
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-xl text-sm">
                <p className="font-medium text-gray-900">{registeringUser.full_name || registeringUser.email}</p>
                <p className="text-gray-400 text-xs">{registeringUser.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Assign Role</label>
                <Select value={registerRole} onValueChange={setRegisterRole}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["proprietor","admin","teacher","parent","student","accountant","store_manager"].map(r => (
                      <SelectItem key={r} value={r} className="capitalize">{r.replace("_", " ")}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-gray-500">This will create an active account record for this user.</p>
              <div className="flex gap-2 justify-end pt-1">
                <Button variant="outline" onClick={() => setRegisteringUser(null)}>Cancel</Button>
                <Button
                  onClick={() => createAccountMut.mutate({ email: registeringUser.email, role: registerRole })}
                  disabled={createAccountMut.isPending}
                  className="bg-gradient-to-r from-orange-500 to-pink-500 border-0 text-white gap-1">
                  {createAccountMut.isPending && <Loader2 className="w-3 h-3 animate-spin" />}
                  Activate
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}