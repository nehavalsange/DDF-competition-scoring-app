"use client";

import { useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { createTestAdmin, deleteTestAdmin } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  UserPlus, Trash2, Eye, Edit3, AlertTriangle, X,
  Loader2, ShieldCheck, AlertCircle, Eye as EyeIcon, EyeOff,
} from "lucide-react";

type AdminUser = {
  id: string;
  name: string;
  username: string;
  adminPermission: "READ_ONLY" | "READ_WRITE" | null;
};

export function AdminAccessSection({ admins }: { admins: AdminUser[] }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);

  // Add form state
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [permission, setPermission] = useState("READ_ONLY");
  const [formError, setFormError] = useState<string | null>(null);
  const [isCreating, startCreating] = useTransition();
  const [isDeleting, startDeleting] = useTransition();

  const testAdmins = admins.filter((a) => a.adminPermission !== null);

  function openAddForm() {
    setName(""); setUsername(""); setPassword(""); setPermission("READ_ONLY");
    setFormError(null); setShowPw(false);
    setShowAddForm(true);
  }

  function handleCreate() {
    if (!name.trim() || !username.trim() || !password) {
      setFormError("All fields are required.");
      return;
    }
    if (password.length < 6) {
      setFormError("Password must be at least 6 characters.");
      return;
    }
    setFormError(null);
    startCreating(async () => {
      const result = await createTestAdmin(
        name.trim(),
        username.trim(),
        password,
        permission as "READ_ONLY" | "READ_WRITE"
      );
      if (result?.error) {
        setFormError(result.error);
      } else {
        setShowAddForm(false);
      }
    });
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    startDeleting(async () => {
      await deleteTestAdmin(deleteTarget.id);
      setDeleteTarget(null);
    });
  }

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-fuchsia-400" />
            Admin Access
          </h2>
          <p className="text-white/40 text-sm mt-0.5">Manage admin accounts for observers and staff</p>
        </div>
        <Button
          onClick={openAddForm}
          size="sm"
          className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white"
        >
          <UserPlus className="w-3.5 h-3.5" />
          Add Admin
        </Button>
      </div>

      {testAdmins.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center text-white/30 text-sm">
          No additional admin accounts yet. Click "Add Admin" to create one.
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="text-left py-2.5 px-4 text-white/40 font-medium text-xs uppercase tracking-wider">Name</th>
                <th className="text-left py-2.5 px-4 text-white/40 font-medium text-xs uppercase tracking-wider">Username</th>
                <th className="text-left py-2.5 px-4 text-white/40 font-medium text-xs uppercase tracking-wider">Access</th>
                <th className="py-2.5 px-4 w-10" />
              </tr>
            </thead>
            <tbody>
              {testAdmins.map((a) => (
                <tr key={a.id} className="border-b border-white/5 hover:bg-white/3">
                  <td className="py-3 px-4 text-white">{a.name}</td>
                  <td className="py-3 px-4 text-white/50 font-mono text-xs">{a.username}</td>
                  <td className="py-3 px-4">
                    {a.adminPermission === "READ_ONLY" ? (
                      <Badge variant="secondary" className="text-xs gap-1">
                        <Eye className="w-3 h-3" /> Read Only
                      </Badge>
                    ) : (
                      <Badge variant="warning" className="text-xs gap-1">
                        <Edit3 className="w-3 h-3" /> Read & Write
                      </Badge>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setDeleteTarget(a)}
                      className="text-white/30 hover:text-red-400 transition-colors"
                      title="Delete account"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add admin modal */}
      {showAddForm && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isCreating && setShowAddForm(false)} />
          <div
            className="relative z-10 w-full max-w-sm bg-[#1a0f2e] border border-white/15 rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/8">
              <div>
                <h3 className="text-white font-bold">Add Admin Account</h3>
                <p className="text-white/40 text-xs mt-0.5">Create a new admin with custom access</p>
              </div>
              <button onClick={() => setShowAddForm(false)} disabled={isCreating} className="text-white/30 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-5 py-4 space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-white/50">Full Name *</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Stage Monitor"
                  className="h-9 text-sm"
                  disabled={isCreating}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-white/50">Username *</Label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. stagemonitor"
                  className="h-9 text-sm"
                  disabled={isCreating}
                  autoComplete="off"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-white/50">Password *</Label>
                <div className="relative">
                  <Input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="h-9 text-sm pr-9"
                    disabled={isCreating}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-white/50">Access Level *</Label>
                <Select value={permission} onValueChange={setPermission}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="READ_ONLY">Read Only — can view, cannot modify</SelectItem>
                    <SelectItem value="READ_WRITE">Read & Write — full access</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formError && (
                <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  {formError}
                </div>
              )}
            </div>

            <div className="flex gap-3 px-5 pb-5">
              <Button variant="ghost" className="flex-1 text-white/60" onClick={() => setShowAddForm(false)} disabled={isCreating}>
                Cancel
              </Button>
              <Button
                className="flex-1 bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-semibold"
                onClick={handleCreate}
                disabled={isCreating}
              >
                {isCreating ? <><Loader2 className="w-4 h-4 animate-spin mr-1.5" />Creating…</> : "Create Admin"}
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Delete confirm modal */}
      {deleteTarget && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isDeleting && setDeleteTarget(null)} />
          <div
            className="relative z-10 w-full max-w-sm bg-[#130824] border border-white/15 rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-white/8">
              <div className="w-9 h-9 rounded-full bg-red-500/15 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-4 h-4 text-red-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">Delete Admin Account</h3>
                <p className="text-white/40 text-xs">This cannot be undone</p>
              </div>
            </div>
            <div className="px-5 py-4">
              <p className="text-white/60 text-sm">
                Delete <span className="text-white font-medium">{deleteTarget.name}</span>{" "}
                <span className="text-white/40">(@{deleteTarget.username})</span>?
                They will immediately lose access to the admin dashboard.
              </p>
            </div>
            <div className="flex gap-3 px-5 pb-5">
              <Button variant="outline" className="flex-1" onClick={() => setDeleteTarget(null)} disabled={isDeleting}>
                Cancel
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700 text-white shadow-none"
                onClick={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? <><Loader2 className="w-4 h-4 animate-spin mr-1.5" />Deleting…</> : "Delete"}
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
