import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Users, Search, Shield, Lock, Unlock, Mail, UserCog, Crown } from "lucide-react";

const ROLES = ["admin", "teacher", "parent", "student", "accountant", "store_manager", "proprietor"];
const roleColors = {
  proprietor: "bg-gradient-to-r from-orange-500 to-pink-500 text-white",
  admin: "bg-purple-100 text-purple-700",
  teacher: "bg-blue-100 text-blue-700",
  parent: "bg-green-100 text-green-700",
  student: "bg-yellow-100 text-yellow-700",
  accountant: "bg-indigo-100 text-indigo-700",
  store_manager: "bg-pink-100 text-pink-700",
  user: "bg-gray-100 text-gray-600",
};

export default function ProprietorUsers({ currentUser }) {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [editUser, setEditUser] = useState(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("teacher");

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["all-users"],
    queryFn: () => base44.entities.User.list("-created_date", 200),
  });

  const updateRole = useMutation({
    mutationFn: ({ id, role }) => base44.entities.User.update(id, { role }),
    onSuccess: () => { qc.invalidateQueries(["all-users"]); setEditUser(null); },
  });

  const handleInvite = async () => {
    await base44.users.inviteUser(inviteEmail, inviteRole === "proprietor" ? "admin" : inviteRole === "admin" ? "admin" : "user");
    setInviteOpen(false);
    setInviteEmail("");
  };

  const filtered = users.filter(u => {
    const matchSearch = !search || u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === "all" || u.role === filterRole;
    return matchSearch && matchRole;
  });

  const roleCounts = ROLES.reduce((acc, r) => ({ ...acc, [r]: users.filter(u => u.role === r).length }), {});

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Users & Permissions</h2>
          <p className="text-gray-500 text-sm mt-1">Manage all user accounts and role assignments</p>
        </div>
        <Button onClick={() => setInviteOpen(true)} className="bg-gradient-to-r from-orange-500 to-pink-500 border-0 text-white gap-2">
          <Mail className="w-4 h-4" /> Invite User
        </Button>
      </div>

      {/* Role Summary */}
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {ROLES.map(r => (
          <div key={r} onClick={() => setFilterRole(filterRole === r ? "all" : r)}
            className={`bg-white rounded-xl p-3 border cursor-pointer transition-all text-center ${filterRole === r ? "border-orange-400 shadow-md" : "border-gray-100 hover:border-orange-200"}`}>
            <p className="text-xl font-bold text-gray-900">{roleCounts[r] || 0}</p>
            <p className="text-[10px] text-gray-500 capitalize mt-0.5">{r.replace("_"," ")}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input className="pl-9" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={filterRole} onValueChange={setFilterRole}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {ROLES.map(r => <SelectItem key={r} value={r} className="capitalize">{r.replace("_"," ")}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Email</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Joined</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <tr key={i}><td colSpan={5} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td></tr>
              ))
            ) : filtered.map(u => (
              <tr key={u.id} className="hover:bg-gray-50/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-100 to-pink-100 flex items-center justify-center text-orange-600 font-semibold text-sm flex-shrink-0">
                      {u.full_name?.[0] || "?"}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
                        {u.full_name || "Unknown"}
                        {u.role === "proprietor" && <Crown className="w-3 h-3 text-orange-500" />}
                      </p>
                      <p className="text-xs text-gray-400 sm:hidden">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500 hidden sm:table-cell">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${roleColors[u.role] || roleColors.user}`}>
                    {u.role?.replace("_"," ") || "user"}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-400 hidden lg:table-cell">
                  {u.created_date ? new Date(u.created_date).toLocaleDateString() : "-"}
                </td>
                <td className="px-4 py-3 text-right">
                  {u.email !== currentUser?.email && (
                    <Button size="sm" variant="ghost" onClick={() => setEditUser(u)} className="text-xs gap-1">
                      <UserCog className="w-3.5 h-3.5" /> Edit Role
                    </Button>
                  )}
                </td>
              </tr>
            ))}
            {!isLoading && filtered.length === 0 && (
              <tr><td colSpan={5} className="text-center py-12 text-gray-400 text-sm">No users found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Role Dialog */}
      <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Edit User Role</DialogTitle></DialogHeader>
          {editUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-100 to-pink-100 flex items-center justify-center text-orange-600 font-semibold">
                  {editUser.full_name?.[0] || "?"}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{editUser.full_name}</p>
                  <p className="text-xs text-gray-400">{editUser.email}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Assign Role</label>
                <Select defaultValue={editUser.role || "user"} onValueChange={v => setEditUser({ ...editUser, role: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ROLES.map(r => <SelectItem key={r} value={r} className="capitalize">{r.replace("_"," ")}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setEditUser(null)}>Cancel</Button>
                <Button onClick={() => updateRole.mutate({ id: editUser.id, role: editUser.role })}
                  className="bg-gradient-to-r from-orange-500 to-pink-500 border-0 text-white">
                  Save Role
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Invite Dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Invite New User</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Email Address</label>
              <Input placeholder="user@example.com" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Role</label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ROLES.filter(r => r !== "proprietor").map(r => <SelectItem key={r} value={r} className="capitalize">{r.replace("_"," ")}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setInviteOpen(false)}>Cancel</Button>
              <Button onClick={handleInvite} disabled={!inviteEmail}
                className="bg-gradient-to-r from-orange-500 to-pink-500 border-0 text-white">
                Send Invite
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}