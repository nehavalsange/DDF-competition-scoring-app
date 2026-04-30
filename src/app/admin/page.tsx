import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Trophy, Users, Calendar, MapPin, ArrowRight } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function AdminDashboard() {
  await requireAdmin();

  const competitions = await db.competition.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { teams: true, judgeAssignments: true } },
    },
  });

  const statusConfig = {
    DRAFT: { label: "Draft", variant: "secondary" as const },
    PUBLISHED: { label: "Published", variant: "success" as const },
    COMPLETED: { label: "Completed", variant: "info" as const },
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Competitions</h1>
          <p className="text-white/50">Manage your dance competitions</p>
        </div>
        <Link href="/admin/competitions/new">
          <Button>
            <Plus className="w-4 h-4" />
            New Competition
          </Button>
        </Link>
      </div>

      {competitions.length === 0 ? (
        <div className="text-center py-20 glass rounded-3xl">
          <Trophy className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <h3 className="text-white/60 font-semibold text-lg mb-2">No competitions yet</h3>
          <p className="text-white/30 text-sm mb-6">Create your first competition to get started.</p>
          <Link href="/admin/competitions/new">
            <Button>
              <Plus className="w-4 h-4" /> Create Competition
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {competitions.map((comp) => {
            const { label, variant } = statusConfig[comp.status];
            return (
              <Link key={comp.id} href={`/admin/competitions/${comp.id}`}>
                <Card className="hover:bg-white/10 transition-all duration-200 hover:shadow-2xl hover:shadow-violet-500/10 hover:-translate-y-0.5 cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base leading-snug">{comp.name}</CardTitle>
                      <Badge variant={variant}>{label}</Badge>
                    </div>
                    <CardDescription className="flex items-center gap-1.5 mt-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(comp.eventDate)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-1.5 text-white/50 text-sm mb-4">
                      <MapPin className="w-3.5 h-3.5" />
                      {comp.venue}
                    </div>
                    <div className="flex gap-4 text-sm">
                      <div className="flex items-center gap-1.5 text-white/60">
                        <Trophy className="w-3.5 h-3.5 text-violet-400" />
                        <span>{comp._count.teams} teams</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-white/60">
                        <Users className="w-3.5 h-3.5 text-violet-400" />
                        <span>{comp._count.judgeAssignments} judges</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-end mt-4 text-violet-400 text-sm font-medium">
                      View details <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
