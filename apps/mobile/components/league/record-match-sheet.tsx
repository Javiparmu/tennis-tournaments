import { errorMessage, type LeagueMember, type SetScore } from "@courtrank/core";
import { Check, Plus, X } from "lucide-react-native";
import { useRef, useState } from "react";
import { Pressable, Text, type TextStyle, View } from "react-native";
import { useRecordLeagueMatchMutation } from "../../data/queries/leagues";
import { colors } from "../../theme/tokens";
import { Avatar, Button, Field, FormError, SegmentedTabs, Sheet } from "../ui";

const TABULAR: TextStyle = { fontVariant: ["tabular-nums"] };
const MICRO = "font-mono text-[11px] uppercase tracking-[1.8px] text-ink-faint";
// Best-of-five is out of scope for a league ladder; three sets covers every format
// the backend rates.
const MAX_SETS = 3;
const MAX_GAMES = 7;

type SetRow = { id: number; player1: string; player2: string };

const emptySet = (id: number): SetRow => ({ id, player1: "", player2: "" });

// Score columns are only unambiguous if they're named, but a full name won't fit a
// 64px cell — the given name is what people call each other in a league anyway.
const firstName = (name: string): string => name.trim().split(/\s+/)[0] ?? name;

type ParsedSets = { sets: SetScore[] } | { error: string };

// A row counts as touched when either cell has a digit in it, so a half-typed set
// fails loudly instead of being silently dropped from the score.
function parseSets(rows: SetRow[]): ParsedSets {
  const sets: SetScore[] = [];

  for (const row of rows) {
    const player1 = row.player1.trim();
    const player2 = row.player2.trim();
    if (player1 === "" && player2 === "") continue;
    if (player1 === "" || player2 === "") {
      return { error: "Completa los juegos de los dos jugadores en cada set." };
    }
    const player1Games = Number(player1);
    const player2Games = Number(player2);
    if (!Number.isInteger(player1Games) || !Number.isInteger(player2Games)) {
      return { error: `Los juegos deben ser un número entre 0 y ${MAX_GAMES}.` };
    }
    if (player1Games > MAX_GAMES || player2Games > MAX_GAMES) {
      return { error: `Los juegos deben ser un número entre 0 y ${MAX_GAMES}.` };
    }
    // Tiebreak points have no cell in this form yet; the backend accepts a null.
    sets.push({ player1Games, player2Games, tiebreak: null });
  }

  return { sets };
}

type RecordMatchSheetProps = {
  visible: boolean;
  onClose: () => void;
  leagueId: number;
  /** Roster from the screen's already-fetched useLeagueMembersQuery. */
  members: LeagueMember[];
};

// Record a league result from the roster rather than from raw player IDs: pick two
// members, name the winner, optionally type the sets.
export function RecordMatchSheet({ visible, onClose, leagueId, members }: RecordMatchSheetProps) {
  const recordMatch = useRecordLeagueMatchMutation();
  const [selected, setSelected] = useState<number[]>([]);
  const [winnerId, setWinnerId] = useState<number | null>(null);
  const [sets, setSets] = useState<SetRow[]>([emptySet(0)]);
  const [problem, setProblem] = useState<string | null>(null);
  const nextSetId = useRef(1);

  const pair = selected
    .map((playerId) => members.find((member) => member.playerId === playerId))
    .filter((member): member is LeagueMember => member != null);

  function reset() {
    setSelected([]);
    setWinnerId(null);
    setSets([emptySet(0)]);
    setProblem(null);
    recordMatch.reset();
  }

  // Two slots, oldest out: tapping a third player replaces the first pick rather
  // than doing nothing, which is what people expect from a two-up picker.
  function toggle(playerId: number) {
    const next = selected.includes(playerId)
      ? selected.filter((id) => id !== playerId)
      : selected.length >= 2
        ? [selected[1], playerId]
        : [...selected, playerId];
    setSelected(next);
    if (winnerId != null && !next.includes(winnerId)) setWinnerId(null);
  }

  function updateSet(id: number, side: "player1" | "player2", value: string) {
    // number-pad still offers a decimal key on iOS — keep the cell to digits.
    const digits = value.replace(/[^0-9]/g, "");
    setSets((prev) => prev.map((row) => (row.id === id ? { ...row, [side]: digits } : row)));
  }

  async function submit() {
    if (selected.length !== 2) {
      setProblem("Selecciona dos jugadores.");
      return;
    }
    if (winnerId == null || !selected.includes(winnerId)) {
      setProblem("Elige el ganador del partido.");
      return;
    }
    const parsed = parseSets(sets);
    if ("error" in parsed) {
      setProblem(parsed.error);
      return;
    }
    setProblem(null);

    try {
      await recordMatch.mutateAsync({
        id: leagueId,
        payload: {
          player1Id: selected[0],
          player2Id: selected[1],
          winnerId,
          score: parsed.sets.length > 0 ? { sets: parsed.sets } : null,
          playedAt: null,
        },
      });
      reset();
      onClose();
    } catch {
      // Surfaced by the FormError below and the shared mutation toast; swallowed
      // here only so mutateAsync's rejection doesn't escape the press handler.
    }
  }

  return (
    <Sheet visible={visible} onClose={onClose} title="Registrar resultado" snapPoints={["75%"]}>
      <View className="gap-5">
        <View className="gap-2">
          <Text className={MICRO}>Jugadores</Text>
          {members.length === 0 ? (
            <Text className="font-sans text-sm text-ink-muted">Esta liga todavía no tiene miembros.</Text>
          ) : (
            members.map((member) => {
              const isSelected = selected.includes(member.playerId);
              return (
                <Pressable
                  key={member.playerId}
                  onPress={() => toggle(member.playerId)}
                  accessibilityRole="button"
                  accessibilityLabel={member.name}
                  accessibilityState={{ selected: isSelected }}
                  className={`min-h-[56px] flex-row items-center gap-3 rounded-xl border px-3 py-2 ${
                    isSelected ? "border-lime bg-lime/10" : "border-line bg-surface active:bg-surface-2"
                  }`}
                >
                  <Avatar name={member.name} size={36} />
                  <Text className="flex-1 font-sans-semibold text-ink" numberOfLines={1}>
                    {member.name}
                  </Text>
                  <Text className="font-mono-bold text-ink" style={TABULAR}>
                    {member.rating}
                  </Text>
                  {/* Fixed box so the rows don't reflow as picks change. */}
                  <View className="h-5 w-5 items-center justify-center">
                    {isSelected ? <Check color={colors.lime} size={18} /> : null}
                  </View>
                </Pressable>
              );
            })
          )}
        </View>

        <View className="gap-2">
          <Text className={MICRO}>Ganador</Text>
          {pair.length === 2 ? (
            <SegmentedTabs
              tabs={pair.map((member) => ({ key: String(member.playerId), label: member.name }))}
              value={winnerId != null ? String(winnerId) : ""}
              onChange={(key) => setWinnerId(Number(key))}
            />
          ) : (
            // Same footprint as the segmented control it replaces.
            <View className="min-h-[54px] items-center justify-center rounded-xl border border-line bg-surface px-4">
              <Text className="text-center font-sans text-sm text-ink-faint">
                Elige dos jugadores para marcar el ganador.
              </Text>
            </View>
          )}
        </View>

        <View className="gap-2">
          <View className="flex-row items-center justify-between gap-3">
            <Text className={MICRO}>Marcador (opcional)</Text>
            {sets.length < MAX_SETS ? (
              <Button
                variant="ghost"
                label="Añadir set"
                icon={<Plus color={colors.lime} size={16} />}
                onPress={() => {
                  setSets((prev) => [...prev, emptySet(nextSetId.current++)]);
                }}
              />
            ) : null}
          </View>
          {pair.length === 2 ? (
            <View className="flex-row items-center gap-2">
              <View className="w-12" />
              <Text className={`w-16 text-center ${MICRO}`} numberOfLines={1}>
                {firstName(pair[0].name)}
              </Text>
              {/* Mirrors the dash between the cells so the names sit over them. */}
              <Text className="font-mono text-transparent">–</Text>
              <Text className={`w-16 text-center ${MICRO}`} numberOfLines={1}>
                {firstName(pair[1].name)}
              </Text>
            </View>
          ) : null}
          {sets.map((row, index) => (
            <View key={row.id} className="flex-row items-center gap-2">
              <Text className="w-12 font-mono text-xs uppercase tracking-[1px] text-ink-muted">Set {index + 1}</Text>
              <View className="w-16">
                <Field
                  inSheet
                  value={row.player1}
                  onChangeText={(value) => updateSet(row.id, "player1", value)}
                  keyboardType="number-pad"
                  maxLength={2}
                  placeholder="0"
                  accessibilityLabel={`Juegos de ${pair[0]?.name ?? "jugador 1"} en el set ${index + 1}`}
                  className="px-2 text-center font-mono"
                />
              </View>
              <Text className="font-mono text-ink-faint">–</Text>
              <View className="w-16">
                <Field
                  inSheet
                  value={row.player2}
                  onChangeText={(value) => updateSet(row.id, "player2", value)}
                  keyboardType="number-pad"
                  maxLength={2}
                  placeholder="0"
                  accessibilityLabel={`Juegos de ${pair[1]?.name ?? "jugador 2"} en el set ${index + 1}`}
                  className="px-2 text-center font-mono"
                />
              </View>
              {sets.length > 1 ? (
                <Pressable
                  onPress={() => setSets((prev) => prev.filter((existing) => existing.id !== row.id))}
                  accessibilityRole="button"
                  accessibilityLabel={`Quitar el set ${index + 1}`}
                  className="ml-auto h-11 w-11 items-center justify-center rounded-full active:opacity-70"
                >
                  <X color={colors.inkFaint} size={18} />
                </Pressable>
              ) : null}
            </View>
          ))}
        </View>

        <FormError
          message={problem ?? (recordMatch.error ? errorMessage(recordMatch.error, "league.recordResult") : null)}
        />
        <Button label="Guardar resultado" loading={recordMatch.isPending} onPress={submit} />
      </View>
    </Sheet>
  );
}
