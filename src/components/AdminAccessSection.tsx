"use client";

import { useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { createTestAdmins, deleteTestAdmin } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Trash2, Eye, Edit3, Copy, Check, AlertTriangle, X, Loader2, ShieldCheck } from "lucide-react";

type AdminUser = {
  id: string;
  name: string;
  username: string;
  adminPermission: "READ_ONLY" | "READ_WRITE" | null;
};

type CreatedUser = { name: string; username: string; password: string; permission: string };

export function AdminAccessSection({ admins }: { admins: AdminUser[] }) {
  const [isPending, startTransition] = useTransition();
  const [newCreds, setNewCreds] = useState<CreatedUser[]>([]);
  const [showCreds, setShowCreds] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [isDeleting, startDeleting] = useTransition();

  const testAdmins = admins.filter((a) => a.adminPermission !== null);
  const allExist = testAdmins.length >= 4;

  function handleCreate() {
    startTransition(async () => {
      const result = await createTestAdmins();
      if (result.created.length > 0) {
        setNewCreds(result.created);
        setShowCreds(true);
      }
    });
  }

  function handleCopy(text: string, idx: number) {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
  }

  function handleDelete(admin: AdminUser) {
    setDeleteTarget(admin);
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
          <p className="text-white/40 text-sm mt-0.5">Manage test admin accounts for observers and staff</p>
        </div>
        {!allExist && (
          <Button
            onClick={handleCreate}
            disabled={isPending}
            size="sm"
            className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white"
          >
            {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
            {isPending ? "Creating…" : "Create Test Admins"}
          </Button>
        )}
      </div>

      {testAdmins.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center text-white/30 text-sm">
          No test admin accounts yet. Click "Create Test Admins" to add 4 preset accounts.
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="text-left py-2.5 px-4 text-white/40 font-medium text-xs uppercase tracking-wider">Name</th>
                <th className="text-left py-2.5 px-4 text-white/40 font-medium text-xs uppercase tracking-wider">Username</th>
                <th className="text-left py-2.5 px-4 text-white/40 font-medium text-xs uppercase tracking-wider">Access</th>
                <th className="py-2.5 px-4" />
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
                      onClick={() => handleDelete(a)}
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

      {/* Credentials reveal modal */}
      {showCreds && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative z-10 w-full max-w-md bg-[#1a0f2e] border border-white/15 rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/8">
              <div>
                <h3 className="text-white font-bold">Test Admins Created</h3>
                <p className="text-white/40 text-xs mt-0.5">Save these credentials — passwords shown once only</p>
              </div>
              <button onClick={() => setShowCreds(false)} className="text-white/30 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-5 py-4 space-y-3">
              {newCreds.map((c, i) => (
                <div key={c.username} className="glass rounded-xl p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-white font-medium text-sm">{c.name}</span>
                    {c.permission === "READ_ONLY"
                      ? <Badge variant="secondary" className="text-xs gap-1"><Eye className="w-3 h-3" />Read Only</Badge>
                      : <Badge variant="warning" className="text-xs gap-1"><Edit3 className="w-3 h-3" />Read & Write</Badge>
                    }
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/40">
                      <span className="text-white/60">user:</span> <span className="font-mono text-amber-300">{c.username}</span>
                      {"  "}
                      <span className="text-white/60">pass:</span> <span className="font-mono text-fuchsia-300">{c.password}</span>
                    </span>
                    <button
                      onClick={() => handleCopy(`${c.username} / ${c.password}`, i)}
                      className="text-white/30 hover:text-white ml-2 flex-shrink-0"
                    >
                      {copiedIdx === i ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-5 pb-5">
              <Button className="w-full" onClick={() => setShowCreds(false)}>
                Done — I've saved the credentials
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
                Delete <span className="text-white font-medium">{deleteTarget.name}</span> (@{deleteTarget.username})?
              </p>
            </div>
            <div className="flex gap-3 px-5 pb-5">
              <Button variant="outline" className="flex-1" onClick={() => setDeleteTarget(null)} disabled={isDeleting}>Cancel</Button>
              <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white shadow-none" onClick={confirmDelete} disabled={isDeleting}>
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
