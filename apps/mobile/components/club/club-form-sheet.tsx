import { type Club, errorMessage } from "@courtrank/core";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { useUpdateClubMutation } from "../../data/queries/clubs";
import { Button, Field, FormError, Sheet } from "../ui";

// Edit-only club sheet — the mobile port of web's host/club-form-modal. Clubs are
// provisioned by the operator, so there is no create path here. Saves via
// useUpdateClubMutation (optimistic) and closes on success; kept open on failure.
export function ClubFormSheet({
  visible,
  club,
  onClose,
}: {
  visible: boolean;
  club: Club;
  onClose: () => void;
}) {
  const updateClub = useUpdateClubMutation();

  const [name, setName] = useState(club.name);
  const [phoneNumber, setPhoneNumber] = useState(club.phoneNumber ?? "");
  const [address, setAddress] = useState(club.address ?? "");
  const [formError, setFormError] = useState<string | null>(null);

  // The sheet stays mounted between opens; resync from the club each time it opens
  // (a different club can reuse the same sheet instance).
  useEffect(() => {
    if (visible) {
      setName(club.name);
      setPhoneNumber(club.phoneNumber ?? "");
      setAddress(club.address ?? "");
      setFormError(null);
      updateClub.reset();
    }
  }, [visible, club.name, club.phoneNumber, club.address, updateClub.reset]);

  async function submit() {
    setFormError(null);
    if (!name.trim()) {
      setFormError("El nombre del club es obligatorio.");
      return;
    }
    try {
      await updateClub.mutateAsync({
        id: club.id,
        name: name.trim(),
        phoneNumber: phoneNumber.trim() || null,
        address: address.trim() || null,
      });
      onClose();
    } catch {
      // surfaced via mutation error below; keep the sheet open to retry.
    }
  }

  return (
    <Sheet visible={visible} onClose={onClose} title="Editar club" snapPoints={["75%"]}>
      <View className="gap-3">
        <Field inSheet label="Nombre" value={name} onChangeText={setName} />
        <Field
          inSheet
          label="Teléfono (opcional)"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
        />
        <Field inSheet label="Dirección (opcional)" value={address} onChangeText={setAddress} />
        <FormError message={formError} />
        <FormError message={updateClub.isError ? errorMessage(updateClub.error, "club.update") : null} />
        <Button label="Guardar cambios" loading={updateClub.isPending} disabled={updateClub.isPending} onPress={submit} />
      </View>
    </Sheet>
  );
}
