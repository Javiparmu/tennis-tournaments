import { type TrainingVisibility, VISIBILITY_LABEL } from "@courtrank/core";
import { Trash2 } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useCreateTrainingMutation, useDeleteTrainingMutation, useMyTrainingsQuery } from "../../data/queries/trainings";
import { todayIso, trainingRange } from "../../lib/date-range";
import { colors } from "../../theme/tokens";
import { Button, Card, Chip, EmptyState, Field, SegmentedTabs, Sheet, Skeleton } from "../ui";

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

  function submit() {
    createTraining.mutate({
      trainingDate: todayIso(),
      durationMinutes: duration ? Number(duration) : null,
      notes: notes.trim() || null,
      visibility,
    });
    setDuration("");
    setNotes("");
    setVisibility("PUBLIC");
    setOpen(false);
  }

  return (
    <View className="gap-2">
      <Button label="Registrar entreno de hoy" variant="secondary" onPress={() => setOpen(true)} />

      {isLoading ? (
        <Skeleton className="h-20 w-full" />
      ) : trainings.length === 0 ? (
        <EmptyState title="Sin entrenos" description="Registra tu primer entrenamiento." />
      ) : (
        trainings.map((training) => (
          <Card key={training.id}>
            <View className="flex-row items-start justify-between gap-3">
              <View className="flex-1">
                <Text className="text-base font-medium text-paper">{training.trainingDate}</Text>
                {training.durationMinutes ? (
                  <Text className="mt-0.5 text-sm text-paper/60">{training.durationMinutes} min</Text>
                ) : null}
                {training.notes ? <Text className="mt-1 text-sm text-paper/70">{training.notes}</Text> : null}
              </View>
              <View className="items-end gap-2">
                <Chip label={VISIBILITY_LABEL[training.visibility]} tone="muted" />
                <Pressable onPress={() => deleteTraining.mutate({ trainingId: training.id })} className="p-1 active:opacity-70">
                  <Trash2 color={colors.clay} size={18} />
                </Pressable>
              </View>
            </View>
          </Card>
        ))
      )}

      <Sheet visible={open} onClose={() => setOpen(false)}>
        <Text className="mb-1 text-lg font-semibold text-paper">Nuevo entreno</Text>
        <Text className="mb-4 text-sm text-paper/50">Fecha: {todayIso()}</Text>
        <Field label="Duración (min)" value={duration} onChangeText={setDuration} keyboardType="number-pad" className="mb-3" />
        <Field label="Notas" value={notes} onChangeText={setNotes} multiline className="mb-3" />
        <Text className="mb-1.5 text-sm font-medium text-paper/70">Visibilidad</Text>
        <View className="mb-4">
          <SegmentedTabs tabs={VISIBILITY_TABS} value={visibility} onChange={setVisibility} />
        </View>
        <Button label="Guardar" loading={createTraining.isPending} onPress={submit} />
      </Sheet>
    </View>
  );
}
