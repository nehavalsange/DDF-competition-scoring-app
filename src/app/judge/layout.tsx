import { requireJudge } from "@/lib/auth";
import { logout } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import Link from "next/link";

export default async function JudgeLayout({ children }: { children: React.ReactNode }) {
  const session = await requireJudge();

  return (
    <div className="min-h-screen">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-violet-600/15 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-purple-600/15 blur-3xl" />
      </div>

      <nav className="sticky top-0 z-50 glass border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/judge" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-black text-xs tracking-tight">DDF</span>
            </div>
            <span className="text-white font-bold hidden sm:block">DDF Judging</span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="text-white/50 text-sm hidden sm:block">
              <span className="text-white">{session.name}</span>
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

      <main className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
