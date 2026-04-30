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
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/opening-video.mp4" type="video/mp4" />
        </video>
        {/* Dark overlay so text is readable */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
      </div>

      {/* DDF Nav */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 md:px-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/10 flex items-center justify-center">
            <span className="text-white font-black text-lg tracking-tight">DDF</span>
          </div>
          <div>
            <p className="text-white font-bold text-base leading-tight">Desi Dance & Fitness</p>
            <p className="text-white/50 text-xs">Judging Platform</p>
          </div>
        </div>
        <Link href="/login">
          <Button variant="outline" size="sm">Sign In</Button>
        </Link>
      </header>

      {/* Hero — center content */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 py-10">
        {/* MANCH 2026 Logo */}
        <div className="mb-8 animate-float">
          <Image
            src="/manch-logo.png"
            alt="MANCH 2026 - Arizona Dance Festival"
            width={320}
            height={320}
            className="mx-auto drop-shadow-2xl"
            priority
          />
        </div>

        <p className="text-white/70 text-lg md:text-xl max-w-xl mb-4 leading-relaxed">
          Arizona Dance Festival · May 9th
        </p>
        <p className="text-white/40 text-sm max-w-md mb-12">
          Official judging platform for MANCH 2026. Sign in with your credentials to begin.
        </p>

        {/* Login buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/login?role=judge">
            <Button size="xl" className="min-w-[200px] group">
              <Users className="w-5 h-5" />
              Judge Login
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href="/login?role=admin">
            <Button size="xl" variant="outline" className="min-w-[200px]">
              <Shield className="w-5 h-5" />
              Admin Login
            </Button>
          </Link>
        </div>
      </section>

      {/* Bottom tagline */}
      <footer className="relative z-10 text-center py-5 text-white/30 text-xs border-t border-white/10">
        <span className="italic">"Where Art Breathes Grandeur"</span>
        <span className="mx-3">·</span>
        DDF Desi Dance & Fitness © 2026
      </footer>
    </main>
  );
}
