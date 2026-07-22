import { errorMessage } from "@courtrank/core";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { useAddClubAdminMutation } from "../../data/queries/clubs";
import { useUserByUsernameQuery } from "../../data/queries/users";
import { notifySuccess } from "../../lib/notify";
import { Button, Field, FormError, Sheet } from "../ui";

// Add a club admin by @username. Resolves the handle to a user id via the existing
// getUserByUsername (same resolve-then-mutate idiom as provision-club-sheet), then
// calls the existing addClubAdmin endpoint — no email/id typing, no backend change.
export function AddAdminSheet({
  visible,
  clubId,
  onClose,
}: {
  visible: boolean;
  clubId: number;
  onClose: () => void;
}) {
  const addAdmin = useAddClubAdminMutation();
  const [username, setUsername] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  // Handle typed without the leading @, trimmed; drives the lookup query.
  const handle = username.trim().replace(/^@+/, "");
  const userQuery = useUserByUsernameQuery(handle || undefined);

  useEffect(() => {
    if (visible) {
      setUsername("");
      setFormError(null);
      addAdmin.reset();
    }
  }, [visible, addAdmin.reset]);

  const isPending = addAdmin.isPending || userQuery.isFetching;

  async function submit() {
    setFormError(null);
    if (!handle) {
      setFormError("Escribe el nombre de usuario del jugador.");
      return;
    }
    try {
      const user = userQuery.data ?? (await userQuery.refetch()).data;
      if (!user) {
        setFormError("No existe ningún jugador con ese nombre de usuario.");
        return;
      }
      await addAdmin.mutateAsync({ clubId, userId: user.id });
      notifySuccess(`@${user.username} añadido como administrador`);
      onClose();
    } catch {
      // addAdmin.error surfaced below; keep the sheet open to retry.
    }
  }

  return (
    <Sheet visible={visible} onClose={onClose} title="Añadir administrador">
      <View className="gap-3">
        <Field
          inSheet
          label="Nombre de usuario"
          placeholder="jugador"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <FormError message={formError} />
        <FormError message={addAdmin.isError ? errorMessage(addAdmin.error, "club.update") : null} />
        <Button label="Añadir" loading={isPending} disabled={isPending} onPress={submit} />
      </View>
    </Sheet>
  );
}
