import type { User } from "@courtrank/core";
import { useRouter } from "expo-router";
import {
  Activity,
  Award,
  Building2,
  CircleAlert,
  LogOut,
  Pencil,
  ShieldCheck,
  TrendingUp,
  Trophy,
} from "lucide-react-native";
import { type ReactNode, useState } from "react";
import { Pressable, Text, useWindowDimensions, View } from "react-native";
import { useUserRatingHistoryQuery, useUserTournamentsQuery } from "../../data/queries/users";
import { colors } from "../../theme/tokens";
import { RatingChart } from "../rating-chart";
import { TournamentRow } from "../tournament-row";
import {
  Avatar,
  Button,
  Card,
  ConfirmSheet,
  EmptyState,
  Hero,
  ListCard,
  ListRow,
  Screen,
  Section,
  SectionHeader,
  SegmentedTabs,
  Skeleton,
  Stat,
} from "../ui";
import { ProfileEditSheet } from "./profile-edit-sheet";
import { RacketsTab } from "./rackets-tab";
import { TrainingsTab } from "./trainings-tab";

type Tab = "resumen" | "raquetas" | "entrenos";

// Avatar 56 + its 2px ring on each side. The skeleton has to match to the pixel or
// the hero reflows when the profile lands.
const AVATAR_BOX = "h-[60px] w-[60px] rounded-[19px]";

// The full player profile, shared by the stack route (`players/[username]`) and the
// Perfil tab (`(tabs)/profile`). The two differ only in chrome — a back button vs a
// "MI PERFIL" eyebrow, the floating-bar clearance, and (on the tab only) a sign-out
// action — so those are props and everything else lives here once. The tab is always
// the viewer's own profile, so it picks up inline edit and the Entrenos tab for free
// through the same `isOwner` path as an owner viewing their stack page.
//
// Identity comes from the parent (by-username for the stack, `me` for the tab); the
// rating and tournament feeds are derived here off the resolved user's id, so both
// callers share one wiring and one cache.
export function PlayerProfile({
  user,
  me,
  isLoading,
  isError,
  onBack,
  tabBar = false,
  onSignOut,
  onHost,
  onAdmin,
}: {
  user?: User;
  me?: User;
  isLoading: boolean;
  isError?: boolean;
  /** Back handler for the stack route. Omit on the tab — its presence also flips the
      header from the "MI PERFIL" eyebrow to a back button. */
  onBack?: () => void;
  /** Clear the floating tab bar. Set on the Perfil tab, never on the stack route. */
  tabBar?: boolean;
  /** Sign-out action. When set (the Perfil tab), a logout button appears beside the
      edit button and runs this after a confirmation. Omitted on the stack route. */
  onSignOut?: () => void;
  /** Host entry. When set (Perfil tab), a building button opens the host surface where
      the viewer manages or requests a club. Any signed-in user can request one. */
  onHost?: () => void;
  /** Admin entry. When set (Perfil tab, viewer is PLATFORM_ADMIN), a shield button
      appears in the hero and opens the admin console. Omitted otherwise. */
  onAdmin?: () => void;
}) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const ratingQuery = useUserRatingHistoryQuery(user?.id);
  const tournamentsQuery = useUserTournamentsQuery(user?.id);
  const ratingHistory = ratingQuery.data;
  const tournaments = tournamentsQuery.data;

  const [tab, setTab] = useState<Tab>("resumen");
  const [editOpen, setEditOpen] = useState(false);
  const [signOutOpen, setSignOutOpen] = useState(false);

  const isOwner = Boolean(me && user && me.id === user.id);
  const chartWidth = width - 72;
  const achievements = user?.achievements ?? [];
  const name = user?.name ?? user?.username ?? "Jugador";

  // The Resumen feeds are their own queries, so they can still be loading after the
  // user resolves. Gate the empty state on both having settled, or it flashes before
  // the chart/history land.
  const feedsLoading = ratingQuery.isLoading || tournamentsQuery.isLoading;
  const hasResumen = (ratingHistory?.length ?? 0) >= 2 || achievements.length > 0 || (tournaments?.length ?? 0) > 0;

  const tabs: Array<{ key: Tab; label: string }> = [
    { key: "resumen", label: "Resumen" },
    { key: "raquetas", label: "Raquetas" },
    ...(isOwner ? [{ key: "entrenos" as const, label: "Entrenos" }] : []),
  ];

  return (
    <Screen
      tabBar={tabBar}
      hero={
        <Hero
          compact
          onBack={onBack}
          eyebrow={onBack ? undefined : "MI PERFIL"}
          title={user ? name : " "}
          subtitle={user ? `@${user.username}` : " "}
          right={
            isOwner ? (
              <View className="flex-row items-center gap-2">
                {onHost ? (
                  <HeroAction label="Zona de organizador" onPress={onHost}>
                    <Building2 color={colors.ink} size={18} />
                  </HeroAction>
                ) : null}
                {onAdmin ? (
                  <HeroAction label="Panel de administración" onPress={onAdmin}>
                    <ShieldCheck color={colors.lime} size={18} />
                  </HeroAction>
                ) : null}
                {onSignOut ? (
                  <HeroAction label="Cerrar sesión" onPress={() => setSignOutOpen(true)}>
                    <LogOut color={colors.danger} size={18} />
                  </HeroAction>
                ) : null}
                <HeroAction label="Editar perfil" onPress={() => setEditOpen(true)}>
                  <Pencil color={colors.ink} size={18} />
                </HeroAction>
              </View>
            ) : undefined
          }
        >
          {user ? (
            <IdentityStrip avatar={<Avatar size={56} imageUrl={user.imageUrl} name={name} />}>
              <Stat accent value={user.rating ?? 1000} label="Puntos" />
              <Stat value={user.matchWins ?? 0} label="Victorias" />
              <Stat value={user.ratedMatches ?? 0} label="Partidos" />
            </IdentityStrip>
          ) : (
            <StatsSkeleton />
          )}
        </Hero>
      }
    >
      {isError ? (
        <EmptyState icon={CircleAlert} title="Perfil no disponible" description="No pudimos cargar este jugador." />
      ) : isLoading || !user ? (
        <>
          <Skeleton className="h-[52px] w-full rounded-full" />
          <Skeleton className="h-52 w-full rounded-2xl" />
        </>
      ) : (
        <>
          <SegmentedTabs tabs={tabs} value={tab} onChange={setTab} />

          {tab === "resumen" ? (
            feedsLoading ? (
              <Skeleton className="h-52 w-full rounded-2xl" />
            ) : !hasResumen ? (
              <EmptyState
                icon={Activity}
                title="Sin actividad todavía"
                description={
                  isOwner
                    ? "Inscríbete en un torneo y juega tus primeros partidos para ver aquí tu progreso, logros e historial."
                    : "Este jugador todavía no tiene partidos ni torneos."
                }
                action={
                  isOwner ? (
                    <Button label="Ver torneos" variant="secondary" onPress={() => router.push("/tournaments")} />
                  ) : undefined
                }
              />
            ) : (
              <>
                {ratingHistory && ratingHistory.length >= 2 ? (
                  <Card>
                    <SectionHeader icon={TrendingUp} eyebrow="ELO" title="Progreso de puntos" />
                    <View className="mt-3">
                      <RatingChart events={ratingHistory} width={chartWidth} />
                    </View>
                  </Card>
                ) : null}

                {achievements.length > 0 ? (
                  <Section icon={Award} eyebrow="TRAYECTORIA" title="Logros">
                    <ListCard>
                      {achievements.map((achievement) => (
                        <ListRow key={achievement.id}>
                          <View className="h-9 w-9 items-center justify-center rounded-lg bg-lime/15">
                            <Award color={colors.lime} size={18} />
                          </View>
                          <View className="flex-1">
                            <Text className="font-sans-semibold text-ink">{achievement.name}</Text>
                            {achievement.description ? (
                              <Text className="mt-0.5 font-sans text-sm text-ink-muted">{achievement.description}</Text>
                            ) : null}
                          </View>
                        </ListRow>
                      ))}
                    </ListCard>
                  </Section>
                ) : null}

                {tournaments && tournaments.length > 0 ? (
                  <Section icon={Trophy} eyebrow="HISTORIAL" title="Torneos">
                    {tournaments.map((tournament) => (
                      <TournamentRow
                        key={tournament.id}
                        tournament={tournament}
                        onPress={() => router.push(`/tournament/${tournament.id}`)}
                      />
                    ))}
                  </Section>
                ) : null}
              </>
            )
          ) : null}

          {tab === "raquetas" ? <RacketsTab userId={user.id} isOwner={isOwner} /> : null}
          {tab === "entrenos" && isOwner ? <TrainingsTab /> : null}
        </>
      )}

      {me && isOwner ? <ProfileEditSheet visible={editOpen} onClose={() => setEditOpen(false)} me={me} /> : null}

      {onSignOut ? (
        <ConfirmSheet
          visible={signOutOpen}
          onClose={() => setSignOutOpen(false)}
          onConfirm={onSignOut}
          title="Cerrar sesión"
          message="¿Seguro que quieres cerrar sesión?"
          confirmLabel="Cerrar sesión"
          danger
        />
      ) : null}
    </Screen>
  );
}

// The circular icon buttons in the hero (edit, sign out) share one treatment.
function HeroAction({ label, onPress, children }: { label: string; onPress: () => void; children: ReactNode }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="h-11 w-11 items-center justify-center rounded-full bg-surface-2 active:opacity-70"
    >
      {children}
    </Pressable>
  );
}

// The hero carries identity + stats; the `right` slot is a single node and the
// pencil owns it, so the avatar leads the stats row underneath instead.
function IdentityStrip({ children, avatar }: { children: ReactNode; avatar: ReactNode }) {
  return (
    <View className="flex-row items-center gap-3">
      {avatar}
      <View className="flex-1 flex-row justify-between">{children}</View>
    </View>
  );
}

function StatsSkeleton() {
  return (
    <IdentityStrip avatar={<Skeleton className={AVATAR_BOX} />}>
      {[0, 1, 2].map((i) => (
        <View key={i} className="gap-1">
          <Skeleton className="h-8 w-14 rounded-md" />
          <Skeleton className="h-3 w-12 rounded-md" />
        </View>
      ))}
    </IdentityStrip>
  );
}
