import type { User } from "@courtrank/core";
import { useState } from "react";
import { Text } from "react-native";
import { useUpdateMeMutation } from "../../data/queries/users";
import { Button, Field, Sheet } from "../ui";

// Owner-only name/username edit. Fire-and-close: the mutation paints optimistically
// and the sheet closes immediately (avatar upload is a follow-up).
export function ProfileEditSheet({ visible, onClose, me }: { visible: boolean; onClose: () => void; me: User }) {
  const update = useUpdateMeMutation();
  const [name, setName] = useState(me.name ?? "");
  const [username, setUsername] = useState(me.username);

  return (
    <Sheet visible={visible} onClose={onClose}>
      <Text className="mb-4 text-lg font-semibold text-paper">Editar perfil</Text>
      <Field label="Nombre" value={name} onChangeText={setName} className="mb-3" />
      <Field label="Usuario" value={username} onChangeText={setUsername} autoCapitalize="none" className="mb-4" />
      <Button
        label="Guardar"
        loading={update.isPending}
        onPress={() => {
          update.mutate({ name: name.trim() || null, username: username.trim() || undefined });
          onClose();
        }}
      />
    </Sheet>
  );
}
