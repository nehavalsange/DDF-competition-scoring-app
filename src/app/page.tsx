import Link from "next/link";
import { Trophy, Star, Users, Shield, ArrowRight, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await getSession();
  if (session) {
    redirect(session.role === "ADMIN" ? "/admin" : "/judge");
  }

  return (
    <main className="min-h-screen flex flex-col">
      {/* Background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-purple-600/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-3xl" />
      </div>

      {/* Nav */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 md:px-12">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Music className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-xl">Munch</span>
        </div>
        <Link href="/login">
          <Button variant="outline" size="sm">Sign In</Button>
        </Link>
      </header>

      {/* Hero */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 py-20 md:py-28">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-sm font-medium mb-8">
          <Star className="w-3.5 h-3.5" />
          Professional Dance Competition Platform
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-[1.1]">
          Score with{" "}
          <span className="gradient-text">Precision.</span>
          <br />
          Win with{" "}
          <span className="gradient-text">Grace.</span>
        </h1>

        <p className="text-white/60 text-lg md:text-xl max-w-2xl mb-12 leading-relaxed">
          A modern scoring platform built for dance competitions. Manage judges, track scores
          in real-time, and automatically calculate category winners with our smart algorithm.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-20">
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

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-3xl">
          {[
            { label: "Teams Supported", value: "30+" },
            { label: "Judges per Event", value: "4-5" },
            { label: "Age Categories", value: "3" },
            { label: "Awards Given", value: "6+" },
          ].map((stat) => (
            <div key={stat.label} className="glass rounded-2xl p-4 text-center">
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-xs text-white/50">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 px-6 py-16 md:px-12">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Everything you need to run a{" "}
            <span className="gradient-text">world-class competition</span>
          </h2>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
            {[
              { icon: "🎯", title: "Smart Scoring", desc: "Category-based scoring for Jr Kids, Sr Kids, and Adult divisions with real-time validation and autosave." },
              { icon: "🏆", title: "Auto Winners", desc: "Automatic winner calculation with tiebreaker rules across all award categories including Best Choreography." },
              { icon: "📊", title: "Live Dashboard", desc: "Admin sees judge progress, completion rates, and results in real-time as scoring happens." },
              { icon: "📱", title: "Mobile Ready", desc: "Judges score from any device. Fully responsive for phones, tablets, and desktops." },
              { icon: "🔒", title: "Secure", desc: "Role-based access control. Judges only see their assigned competition. Passwords are hashed." },
              { icon: "📄", title: "Export Results", desc: "Export final results as CSV or print a professional formatted results page." },
            ].map((f) => (
              <div key={f.title} className="glass rounded-2xl p-6 hover:bg-white/10 transition-colors duration-200">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="text-white font-semibold mb-2">{f.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-6 py-16 text-center">
        <div className="max-w-2xl mx-auto glass rounded-3xl p-10 md:p-14">
          <Trophy className="w-12 h-12 text-violet-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white mb-4">Ready to start scoring?</h2>
          <p className="text-white/60 mb-8">Sign in with your credentials provided by the competition organizer.</p>
          <Link href="/login">
            <Button size="lg">
              Get Started <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="relative z-10 text-center py-6 text-white/30 text-sm border-t border-white/10">
        © {new Date().getFullYear()} Munch Dance Competition · Built with Next.js
      </footer>
    </main>
  );
}
