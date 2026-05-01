import Link from "next/link";
import { Users, Shield, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import Image from "next/image";

export default async function HomePage() {
  const session = await getSession();
  if (session) {
    redirect(session.role === "ADMIN" ? "/admin" : "/judge");
  }

  return (
    <main className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Full-screen video background */}
      <div className="fixed inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover object-top"
        >
          <source src="/opening-video.mp4" type="video/mp4" />
        </video>
        {/* Lighter at top so MANCH letters show through; darker at bottom for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/50 to-purple-950/85" />
      </div>

      {/* DDF Nav */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 md:px-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl border border-amber-400/40 bg-amber-400/10 flex items-center justify-center">
            <span className="text-amber-300 font-black text-sm tracking-tight">DDF</span>
          </div>
          <div>
            <p className="text-white font-bold text-base leading-tight">Desi Dance & Fitness</p>
            <p className="text-amber-300/60 text-xs">Judging Platform</p>
          </div>
        </div>
        <Link href="/login">
          <Button
            variant="outline"
            size="sm"
            className="border-amber-400/40 text-amber-200 hover:bg-amber-400/10"
          >
            Sign In
          </Button>
        </Link>
      </header>

      {/* Hero */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 py-10">

        {/* Logo — rounded-full clips the white rectangular background, only circle shows */}
        <div className="mb-8 animate-float">
          <div className="w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden mx-auto shadow-2xl shadow-amber-500/30 ring-4 ring-amber-400/20">
            <Image
              src="/manch-logo.png"
              alt="MANCH 2026 - Arizona Dance Festival"
              width={320}
              height={320}
              className="w-full h-full object-cover scale-[1.02]"
              priority
            />
          </div>
        </div>

        <p className="text-amber-200/80 text-lg md:text-xl max-w-xl mb-10 font-medium">
          Arizona Dance Festival · May 9th
        </p>

        {/* Login buttons — gold + purple theme */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/login?role=judge">
            <Button
              size="xl"
              className="min-w-[200px] group bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 hover:scale-[1.02]"
            >
              <Users className="w-5 h-5" />
              Judge Login
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href="/login?role=admin">
            <Button
              size="xl"
              variant="outline"
              className="min-w-[200px] border-amber-400/40 text-amber-200 hover:bg-amber-400/10"
            >
              <Shield className="w-5 h-5" />
              Admin Login
            </Button>
          </Link>
        </div>

        <p className="text-white/40 text-sm mt-6 whitespace-nowrap">
          Official judging platform for MANCH 2026 · Sign in with your credentials to begin
        </p>
      </section>

      {/* Tagline footer */}
      <footer className="relative z-10 text-center py-5 text-white/60 text-xs border-t border-white/10">
        <span className="italic">"Art is not what you see, but what you make others see." — Edgar Degas</span>
        <span className="mx-3">·</span>
        DDF Desi Dance &amp; Fitness © 2026
      </footer>
    </main>
  );
}
