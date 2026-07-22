import { errorMessage, type RacketSummary, type RacketVisibility, VISIBILITY_LABEL } from "@courtrank/core";
import { Gauge, Package, Plus, Trash2 } from "lucide-react-native";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import {
  useCreateRacketMutation,
  useDeleteRacketMutation,
  useMyRacketsQuery,
  usePublicRacketsQuery,
} from "../../data/queries/rackets";
import { colors } from "../../theme/tokens";
import {
  Button,
  Chip,
  EmptyState,
  Field,
  FormError,
  ListCard,
  ListCardSkeleton,
  ListRow,
  SegmentedTabs,
  Sheet,
} from "../ui";

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

  // Await the create so a rejected racket keeps the sheet open with the error shown,
  // and the fields only clear once it actually persists.
  async function submit() {
    if (!displayName.trim()) return;
    try {
      await createRacket.mutateAsync({
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
    } catch {
      // Surfaced by FormError in the sheet.
    }
  }

  return (
    <View className="gap-2">
      {isOwner && rackets && rackets.length > 0 ? (
        <Button
          label="Añadir raqueta"
          variant="secondary"
          icon={<Plus color={colors.ink} size={18} />}
          onPress={() => setOpen(true)}
        />
      ) : null}

      {isLoading ? (
        <ListCardSkeleton rows={2} rowClassName="h-16" />
      ) : !rackets || rackets.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Sin raquetas"
          description={isOwner ? "Añade tu primera raqueta." : undefined}
          action={
            isOwner ? (
              <Button
                label="Añadir raqueta"
                variant="secondary"
                icon={<Plus color={colors.ink} size={18} />}
                onPress={() => setOpen(true)}
              />
            ) : undefined
          }
        />
      ) : (
        <ListCard>
          {rackets.map((racket) => (
            <RacketRow
              key={racket.id}
              racket={racket}
              onDelete={isOwner ? () => deleteRacket.mutate({ racketId: racket.id }) : undefined}
            />
          ))}
        </ListCard>
      )}

      <Sheet visible={open} onClose={() => setOpen(false)} title="Nueva raqueta">
        <View className="gap-3">
          <Field inSheet label="Nombre" value={displayName} onChangeText={setDisplayName} />
          <Field inSheet label="Marca" value={brand} onChangeText={setBrand} />
          <Field inSheet label="Modelo" value={model} onChangeText={setModel} />
          <View className="gap-1.5">
            <Text className="font-sans-medium text-sm text-ink-muted">Visibilidad</Text>
            <SegmentedTabs tabs={VISIBILITY_TABS} value={visibility} onChange={setVisibility} />
          </View>
          <FormError message={createRacket.isError ? errorMessage(createRacket.error, "racket.save") : null} />
          <Button label="Guardar" loading={createRacket.isPending} disabled={!displayName.trim()} onPress={submit} />
        </View>
      </Sheet>
    </View>
  );
}

// `items-start` only when the stringing line makes the row multi-line, so a
// single-line racket still centres against its chip + delete column.
function RacketRow({ racket, onDelete }: { racket: RacketSummary; onDelete?: () => void }) {
  return (
    <ListRow className={racket.latestStringing ? "items-start" : undefined}>
      <View className="flex-1 gap-0.5">
        <Text className="font-sans-semibold text-base text-ink">{racket.displayName}</Text>
        {racket.brand || racket.model ? (
          <Text className="font-sans text-sm text-ink-muted">
            {[racket.brand, racket.model].filter(Boolean).join(" · ")}
          </Text>
        ) : null}
        {racket.latestStringing ? (
          <View className="mt-0.5 flex-row items-center gap-1.5">
            <Gauge color={colors.inkFaint} size={12} />
            <Text className="font-mono text-xs text-ink-muted">
              {racket.latestStringing.mainsTensionKg}/{racket.latestStringing.crossesTensionKg} kg
            </Text>
          </View>
        ) : null}
      </View>
      <View className="items-end gap-1">
        <Chip label={VISIBILITY_LABEL[racket.visibility]} tone="neutral" />
        {onDelete ? (
          <Pressable
            onPress={onDelete}
            accessibilityRole="button"
            accessibilityLabel="Eliminar raqueta"
            className="-mr-2 h-11 w-11 items-center justify-center rounded-full active:opacity-70"
          >
            <Trash2 color={colors.danger} size={18} />
          </Pressable>
        ) : null}
      </View>
    </ListRow>
  );
}
