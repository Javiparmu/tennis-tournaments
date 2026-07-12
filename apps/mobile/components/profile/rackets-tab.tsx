import { type RacketSummary, type RacketVisibility, VISIBILITY_LABEL } from "@courtrank/core";
import { Trash2 } from "lucide-react-native";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useCreateRacketMutation, useDeleteRacketMutation, useMyRacketsQuery, usePublicRacketsQuery } from "../../data/queries/rackets";
import { colors } from "../../theme/tokens";
import { Button, Card, Chip, EmptyState, Field, SegmentedTabs, Sheet, Skeleton } from "../ui";

const VISIBILITY_TABS = [
  { key: "PUBLIC" as const, label: VISIBILITY_LABEL.PUBLIC },
  { key: "PRIVATE" as const, label: VISIBILITY_LABEL.PRIVATE },
];

export function RacketsTab({ userId, isOwner }: { userId: number; isOwner: boolean }) {
  const publicQuery = usePublicRacketsQuery(userId, !isOwner);
  const myQuery = useMyRacketsQuery(isOwner);
  const rackets = isOwner ? myQuery.data : publicQuery.data;
  const isLoading = isOwner ? myQuery.isLoading : publicQuery.isLoading;

  const createRacket = useCreateRacketMutation();
  const deleteRacket = useDeleteRacketMutation();

  const [open, setOpen] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [visibility, setVisibility] = useState<RacketVisibility>("PUBLIC");

  function submit() {
    if (!displayName.trim()) return;
    createRacket.mutate({
      displayName: displayName.trim(),
      brand: brand.trim() || null,
      model: model.trim() || null,
      visibility,
    });
    setDisplayName("");
    setBrand("");
    setModel("");
    setVisibility("PUBLIC");
    setOpen(false);
  }

  return (
    <View className="gap-2">
      {isOwner ? <Button label="Añadir raqueta" variant="secondary" onPress={() => setOpen(true)} /> : null}

      {isLoading ? (
        <Skeleton className="h-20 w-full" />
      ) : !rackets || rackets.length === 0 ? (
        <EmptyState title="Sin raquetas" description={isOwner ? "Añade tu primera raqueta." : undefined} />
      ) : (
        rackets.map((racket) => (
          <RacketCard
            key={racket.id}
            racket={racket}
            onDelete={isOwner ? () => deleteRacket.mutate({ racketId: racket.id }) : undefined}
          />
        ))
      )}

      <Sheet visible={open} onClose={() => setOpen(false)}>
        <Text className="mb-4 text-lg font-semibold text-paper">Nueva raqueta</Text>
        <Field label="Nombre" value={displayName} onChangeText={setDisplayName} className="mb-3" />
        <Field label="Marca" value={brand} onChangeText={setBrand} className="mb-3" />
        <Field label="Modelo" value={model} onChangeText={setModel} className="mb-3" />
        <Text className="mb-1.5 text-sm font-medium text-paper/70">Visibilidad</Text>
        <View className="mb-4">
          <SegmentedTabs tabs={VISIBILITY_TABS} value={visibility} onChange={setVisibility} />
        </View>
        <Button label="Guardar" loading={createRacket.isPending} onPress={submit} />
      </Sheet>
    </View>
  );
}

function RacketCard({ racket, onDelete }: { racket: RacketSummary; onDelete?: () => void }) {
  return (
    <Card>
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text className="text-base font-semibold text-paper">{racket.displayName}</Text>
          {racket.brand || racket.model ? (
            <Text className="mt-0.5 text-sm text-paper/60">{[racket.brand, racket.model].filter(Boolean).join(" · ")}</Text>
          ) : null}
          {racket.latestStringing ? (
            <Text className="mt-1 text-xs text-paper/50">
              {racket.latestStringing.mainsTensionKg}/{racket.latestStringing.crossesTensionKg} kg
            </Text>
          ) : null}
        </View>
        <View className="items-end gap-2">
          <Chip label={VISIBILITY_LABEL[racket.visibility]} tone="muted" />
          {onDelete ? (
            <Pressable onPress={onDelete} className="p-1 active:opacity-70">
              <Trash2 color={colors.clay} size={18} />
            </Pressable>
          ) : null}
        </View>
      </View>
    </Card>
  );
}
