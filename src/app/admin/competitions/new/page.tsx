"use client";

import { useActionState } from "react";
import { createCompetition } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertCircle, Loader2, ArrowLeft, Trophy } from "lucide-react";
import Link from "next/link";

export default function NewCompetitionPage() {
  const [state, action, isPending] = useActionState(createCompetition, null);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin" className="text-white/40 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white">Create Competition</h1>
          <p className="text-white/50">Set up a new dance competition</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fuchsia-500 to-purple-700 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle>Competition Details</CardTitle>
              <CardDescription>Fill in the details for your competition</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form action={action} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Competition Name *</Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g. MANCH Dance Championship 2026"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="eventDate">Event Date *</Label>
                <Input id="eventDate" name="eventDate" type="date" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="venue">Venue *</Label>
                <Input id="venue" name="venue" placeholder="e.g. Grand Ballroom" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Optional description of the competition..."
                rows={3}
              />
            </div>

            {state?.error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 rounded-xl px-3 py-2 border border-red-500/20">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {state.error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Link href="/admin" className="flex-1">
                <Button type="button" variant="outline" className="w-full">Cancel</Button>
              </Link>
              <Button type="submit" className="flex-1" disabled={isPending}>
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                {isPending ? "Creating..." : "Create Competition"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
