import { errorMessage, type User } from "@courtrank/core";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { useUpdateMeMutation } from "../../data/queries/users";
import { Button, Field, FormError, Sheet } from "../ui";

// Owner-only name/username edit.
//
// This used to fire-and-close: it painted optimistically and dismissed on tap with
// no error surface. A rejected username (already taken, invalid) then rolled the
// optimistic value back silently — so the edit looked like it did nothing at all.
// Now the save awaits the result, keeps the sheet open and shows the error on
// failure, and only closes once the change actually persists.
export function ProfileEditSheet({ visible, onClose, me }: { visible: boolean; onClose: () => void; me: User }) {
  const update = useUpdateMeMutation();
  const [name, setName] = useState(me.name ?? "");
  const [username, setUsername] = useState(me.username);

  // The sheet stays mounted between opens, so its fields would otherwise keep the
  // values from first mount — resync from `me` each time it opens (and whenever a
  // successful save updates `me` underneath it).
  useEffect(() => {
    if (visible) {
      setName(me.name ?? "");
      setUsername(me.username);
    }
  }, [visible, me.name, me.username]);

  const trimmedName = name.trim();
  const trimmedUsername = username.trim();
  const changed = trimmedName !== (me.name ?? "") || trimmedUsername !== me.username;
  const canSave = changed && trimmedUsername.length > 0;

  async function submit() {
    if (!canSave) return;
    try {
      await update.mutateAsync({ name: trimmedName || null, username: trimmedUsername });
      onClose();
    } catch {
      // Surfaced by FormError below; the sheet stays open so the user can retry.
    }
  }

  return (
    <Sheet visible={visible} onClose={onClose} title="Editar perfil">
      <View className="gap-3">
        <Field inSheet label="Nombre" value={name} onChangeText={setName} />
        <Field inSheet label="Usuario" value={username} onChangeText={setUsername} autoCapitalize="none" />
        <FormError message={update.isError ? errorMessage(update.error, "user.update") : null} />
        <Button label="Guardar" loading={update.isPending} disabled={!canSave} onPress={submit} />
      </View>
    </Sheet>
  );
}
