"use client";

import { useActionState, useEffect } from "react";
import { login } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginForm() {
  const searchParams = useSearchParams();
  const role = searchParams.get("role");
  const [state, action, isPending] = useActionState(login, null);

  const isJudge = role === "judge";
  const isAdmin = role === "admin";

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      {/* Background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-purple-600/20 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <Image
              src="/manch-logo.png"
              alt="MANCH 2026"
              width={140}
              height={140}
              className="mx-auto drop-shadow-2xl"
            />
          </Link>
          <p className="text-white font-bold text-lg mt-3">DDF Judging Platform</p>
          <p className="text-white/50 text-sm">MANCH 2026 · Arizona Dance Festival</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">
              {isJudge ? "Judge Sign In" : isAdmin ? "Admin Sign In" : "Sign In"}
            </CardTitle>
            <CardDescription>
              {isJudge
                ? "Sign in to start scoring teams."
                : isAdmin
                ? "Sign in to manage the competition."
                : "Enter your credentials to continue."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={action} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Enter your username"
                  required
                  autoComplete="username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
              </div>

              {state?.error && (
                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 rounded-xl px-3 py-2 border border-red-500/20">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {state.error}
                </div>
              )}

              <Button type="submit" className="w-full" size="lg" disabled={isPending}>
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                {isPending ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 flex gap-3">
              <Link
                href="/login?role=judge"
                className={`flex-1 text-center text-xs py-2 rounded-lg border transition-colors ${
                  isJudge
                    ? "border-violet-500/50 bg-violet-500/10 text-violet-300"
                    : "border-white/10 text-white/40 hover:text-white/60"
                }`}
              >
                Judge
              </Link>
              <Link
                href="/login?role=admin"
                className={`flex-1 text-center text-xs py-2 rounded-lg border transition-colors ${
                  isAdmin
                    ? "border-violet-500/50 bg-violet-500/10 text-violet-300"
                    : "border-white/10 text-white/40 hover:text-white/60"
                }`}
              >
                Admin
              </Link>
            </div>

            <p className="text-center text-white/30 text-xs mt-4">
              <Link href="/" className="hover:text-white/50">← Back to home</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-white">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
