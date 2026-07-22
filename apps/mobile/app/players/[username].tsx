import { useLocalSearchParams, useRouter } from "expo-router";
import { PlayerProfile } from "../../components/profile/player-profile";
import { useMeQuery, useUserByUsernameQuery } from "../../data/queries/users";

// Public player profile reached from the ranking and tournament rosters. Identity is
// looked up by the route's username; the shared PlayerProfile renders it and derives
// the rest. Owner-only tools (edit, Entrenos) light up when `me` matches the user.
export default function PlayerProfileScreen() {
  const router = useRouter();
  const { username } = useLocalSearchParams<{ username: string }>();

  const { data: user, isLoading, isError } = useUserByUsernameQuery(username);
  const { data: me } = useMeQuery();

  return (
    <PlayerProfile user={user} me={me} isLoading={isLoading} isError={isError} onBack={() => router.back()} />
  );
}
