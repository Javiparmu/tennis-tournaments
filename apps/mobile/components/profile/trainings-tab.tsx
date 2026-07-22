import { errorMessage, type TrainingVisibility, VISIBILITY_LABEL } from "@courtrank/core";
import { CalendarDays, Dumbbell, Plus, Trash2 } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import {
  useCreateTrainingMutation,
  useDeleteTrainingMutation,
  useMyTrainingsQuery,
} from "../../data/queries/trainings";
import { todayIso, trainingRange } from "../../lib/date-range";
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

// Owner-only trainings list + create/delete. Dates default to today (a full date
// picker + calendar is a follow-up).
export function TrainingsTab() {
  const range = useMemo(trainingRange, []);
  const { data, isLoading } = useMyTrainingsQuery(range.from, range.to);
  const createTraining = useCreateTrainingMutation();
  const deleteTraining = useDeleteTrainingMutation();

  const [open, setOpen] = useState(false);
  const [duration, setDuration] = useState("");
  const [notes, setNotes] = useState("");
  const [visibility, setVisibility] = useState<TrainingVisibility>("PUBLIC");

  const trainings = data?.trainings ?? [];

  // Await the create so a rejected entry keeps the sheet open with the error shown,
  // and the fields only clear once it actually persists.
  async function submit() {
    try {
      await createTraining.mutateAsync({
        trainingDate: todayIso(),
        durationMinutes: duration ? Number(duration) : null,
        notes: notes.trim() || null,
        visibility,
      });
      setDuration("");
      setNotes("");
      setVisibility("PUBLIC");
      setOpen(false);
    } catch {
      // Surfaced by FormError in the sheet.
    }
  }

  return (
    <View className="gap-2">
      {trainings.length > 0 ? (
        <Button
          label="Registrar entreno de hoy"
          variant="secondary"
          icon={<Plus color={colors.ink} size={18} />}
          onPress={() => setOpen(true)}
        />
      ) : null}

      {isLoading ? (
        <ListCardSkeleton rows={2} rowClassName="h-16" />
      ) : trainings.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title="Sin entrenos"
          description="Registra tu primer entrenamiento."
          action={
            <Button
              label="Registrar entreno de hoy"
              variant="secondary"
              icon={<Plus color={colors.ink} size={18} />}
              onPress={() => setOpen(true)}
            />
          }
        />
      ) : (
        <ListCard>
          {trainings.map((training) => (
            // `items-start` only when notes push the row to a second line.
            <ListRow key={training.id} className={training.notes ? "items-start" : undefined}>
              <View className="flex-1 gap-0.5">
                <View className="flex-row items-center gap-1.5">
                  <CalendarDays color={colors.inkFaint} size={12} />
                  <Text className="font-mono-medium text-sm text-ink">{training.trainingDate}</Text>
                  {training.durationMinutes ? (
                    <Text className="font-mono text-xs text-ink-muted">{` · ${training.durationMinutes} min`}</Text>
                  ) : null}
                </View>
                {training.notes ? (
                  <Text className="mt-0.5 font-sans text-sm text-ink-muted">{training.notes}</Text>
                ) : null}
              </View>
              <View className="items-end gap-1">
                <Chip label={VISIBILITY_LABEL[training.visibility]} tone="neutral" />
                <Pressable
                  onPress={() => deleteTraining.mutate({ trainingId: training.id })}
                  accessibilityRole="button"
                  accessibilityLabel="Eliminar entreno"
                  className="-mr-2 h-11 w-11 items-center justify-center rounded-full active:opacity-70"
                >
                  <Trash2 color={colors.danger} size={18} />
                </Pressable>
              </View>
            </ListRow>
          ))}
        </ListCard>
      )}

      <Sheet visible={open} onClose={() => setOpen(false)} title="Nuevo entreno">
        <View className="gap-3">
          <Text className="font-sans text-sm text-ink-muted">
            Fecha: <Text className="font-mono text-ink">{todayIso()}</Text>
          </Text>
          <Field inSheet label="Duración (min)" value={duration} onChangeText={setDuration} keyboardType="number-pad" />
          <Field inSheet label="Notas" value={notes} onChangeText={setNotes} multiline />
          <View className="gap-1.5">
            <Text className="font-sans-medium text-sm text-ink-muted">Visibilidad</Text>
            <SegmentedTabs tabs={VISIBILITY_TABS} value={visibility} onChange={setVisibility} />
          </View>
          <FormError message={createTraining.isError ? errorMessage(createTraining.error, "training.save") : null} />
          <Button label="Guardar" loading={createTraining.isPending} onPress={submit} />
        </View>
      </Sheet>
    </View>
  );
}
