import { useAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { PlayerProfile } from "../../components/profile/player-profile";
import { useMeQuery } from "../../data/queries/users";

// The Perfil tab is the viewer's own full profile — the same component the stack
// route renders, pointed at `me` instead of a looked-up username. Sign-out lives in
// the hero next to the edit button and runs through a confirmation; the stack route
// gets no sign-out because it can be someone else's profile. Platform admins also get
// a shield entry into the /admin console here (UI-only gate; the backend authorizes).
export default function ProfileScreen() {
  const { signOut } = useAuth();
  const router = useRouter();
  const { data: me, isLoading } = useMeQuery();
  const isAdmin = me?.role === "PLATFORM_ADMIN";

  return (
    <PlayerProfile
      user={me}
      me={me}
      isLoading={isLoading}
      tabBar
      onSignOut={() => signOut()}
      onHost={() => router.push("/host")}
      onAdmin={isAdmin ? () => router.push("/admin") : undefined}
    />
  );
}
