import { requireAdmin } from "@/lib/auth";
import { logout } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();

  return (
    <div className="min-h-screen">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-purple-600/10 blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 rounded-full bg-fuchsia-600/10 blur-3xl" />
      </div>

      <nav className="sticky top-0 z-50 glass border-b border-amber-400/15">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg border border-amber-400/40 bg-amber-400/10 flex items-center justify-center">
                <span className="text-amber-300 font-black text-xs tracking-tight">DDF</span>
              </div>
              <span className="text-white font-bold hidden sm:block">DDF Admin</span>
            </Link>
            <div className="h-4 w-px bg-white/20 hidden sm:block" />
            <Link href="/admin" className="flex items-center gap-1.5 text-white/60 hover:text-white text-sm transition-colors">
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:block">Dashboard</span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-white/50 text-sm hidden md:block">
              Welcome, <span className="text-amber-200">{session.name}</span>
            </span>
            <form action={logout}>
              <Button type="submit" variant="ghost" size="sm" className="text-white/60 hover:text-white">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:block">Logout</span>
              </Button>
            </form>
          </div>
        </div>
      </nav>

      {/* MANCH 2026 stage banner */}
      <div className="relative h-28 md:h-40 overflow-hidden">
        <Image
          src="/manch-bg.png"
          alt="MANCH 2026 Stage"
          fill
          className="object-cover object-top"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/80" />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-8 -mt-4">
        {children}
      </main>
    </div>
  );
}
