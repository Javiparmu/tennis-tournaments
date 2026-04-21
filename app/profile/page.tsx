"use client";

import { Show, useUser } from "@clerk/nextjs";
import { Card, Chip } from "@heroui/react";
import { Medal, Star, Target } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { useCurrentPlayerProfileQuery } from "@/lib/queries";

export default function ProfilePage() {
  const { user } = useUser();
  const { data: profile } = useCurrentPlayerProfileQuery(user?.username ?? undefined);
  if (!profile) {
    return (
      <div className="min-h-screen bg-[#f6faf8] text-zinc-900">
        <SiteHeader />
        <main className="mx-auto w-full max-w-5xl px-6 py-10">
          <Show when="signed-out">
            <p className="text-zinc-600">Sign in to view your profile.</p>
          </Show>
          <Show when="signed-in">
            <p className="text-zinc-600">Loading profile...</p>
          </Show>
        </main>
      </div>
    );
  }
  const initials = profile.displayName
    .split(" ")
    .map((part) => part[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");

  return (
    <div className="min-h-screen bg-[#f6faf8] text-zinc-900">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl px-6 py-10">
        <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
          <Card className="border border-zinc-200 bg-white shadow-sm">
            <Card.Content className="gap-5 p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-lg font-semibold text-emerald-700">
                  {initials}
                </div>
                <div>
                  <h1 className="text-2xl font-semibold">{profile.displayName}</h1>
                  <p className="text-sm text-zinc-500">Player profile synced from backend</p>
                </div>
              </div>
              <p className="text-zinc-600">{profile.bio}</p>
              <div className="flex flex-wrap gap-2">
                {profile.achievements.map((achievement) => (
                  <Chip key={achievement} variant="soft" color="success">
                    {achievement}
                  </Chip>
                ))}
              </div>
            </Card.Content>
          </Card>

          <Card className="border border-zinc-200 bg-white shadow-sm">
            <Card.Header>
              <p className="text-lg font-semibold">Stats</p>
            </Card.Header>
            <Card.Content className="space-y-4 pt-0">
              <p className="flex items-center gap-2">
                <Target className="h-4 w-4 text-emerald-700" />
                Elo: <strong>{profile.elo}</strong>
              </p>
              <p className="flex items-center gap-2">
                <Medal className="h-4 w-4 text-emerald-700" />
                Season points: <strong>{profile.points}</strong>
              </p>
              <p className="flex items-center gap-2">
                <Star className="h-4 w-4 text-emerald-700" />
                Favorite surface: <strong>{profile.favoriteSurface}</strong>
              </p>
            </Card.Content>
          </Card>
        </div>
      </main>
    </div>
  );
}
