import { type AdminClubContactRequest, errorMessage } from "@courtrank/core";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { useCreateAdminClubMutation, useDeleteAdminClubContactRequestMutation } from "../../data/queries/admin";
import { useUserByUsernameQuery } from "../../data/queries/users";
import { notifySuccess } from "../../lib/notify";
import { Button, Field, FormError, Sheet } from "../ui";

// Platform-admin club provisioning — the mobile port of web's ProvisionClubModal.
// Prefills from the contact request, resolves the owner handle to a user id, creates
// the club, then clears the attended request from the queue (fire-and-close) and
// toasts. Kept open on failure so the admin can retry.
export function ProvisionClubSheet({
  visible,
  request,
  onClose,
}: {
  visible: boolean;
  request: AdminClubContactRequest;
  onClose: () => void;
}) {
  const createClub = useCreateAdminClubMutation();
  const deleteRequest = useDeleteAdminClubContactRequestMutation();

  const [name, setName] = useState(request.clubName);
  const [phoneNumber, setPhoneNumber] = useState(request.phone ?? "");
  const [address, setAddress] = useState("");
  // The requester's handle rides along on the request (captured read-only at submit
  // time). Prefill + lock it so the admin never retypes it; fall back to a manual
  // input only for legacy requests that predate the field.
  const [formError, setFormError] = useState<string | null>(null);

  // The sheet stays mounted between opens, so resync from the request each time it
  // opens (a different request can reuse the same sheet instance).
  useEffect(() => {
    if (visible) {
      setName(request.clubName);
      setPhoneNumber(request.phone ?? "");
      setAddress("");
      setFormError(null);
    }
  }, [visible, request.clubName, request.phone]);

  // The requester's handle is always prefilled and read-only — the admin never types
  // it, since they may not know the owner's username.
  const ownerUsername = (request.ownerUsername ?? "").trim();
  const ownerUsernameValue = ownerUsername;
  const ownerQuery = useUserByUsernameQuery(ownerUsernameValue || undefined);

  const isPending = createClub.isPending || deleteRequest.isPending || ownerQuery.isFetching;

  async function submit() {
    setFormError(null);
    if (!name.trim() || !ownerUsernameValue) {
      setFormError("El nombre del club y el usuario propietario son obligatorios.");
      return;
    }
    try {
      const owner = ownerQuery.data ?? (await ownerQuery.refetch()).data;
      if (!owner) {
        setFormError("No existe ningún usuario con ese nombre. Pídele que se registre primero.");
        return;
      }
      const club = await createClub.mutateAsync({
        name: name.trim(),
        phoneNumber: phoneNumber.trim() || null,
        address: address.trim() || null,
        ownerUserId: owner.id,
      });
      // Club created: clear the attended request from the queue (fire-and-close — the
      // optimistic delete removes the row and toasts on error even after this sheet
      // unmounts) and confirm via toast.
      deleteRequest.mutate(request.id);
      notifySuccess(`Club "${club.name}" dado de alta`);
      onClose();
    } catch {
      // createClub.error is surfaced by FormError below; keep the sheet open to retry.
    }
  }

  return (
    <Sheet visible={visible} onClose={onClose} title="Dar de alta el club" snapPoints={["75%"]}>
      <View className="gap-3">
        <Field inSheet label="Nombre del club" value={name} onChangeText={setName} />
        <Field
          inSheet
          label="Usuario propietario"
          value={ownerUsername ? `@${ownerUsername}` : ""}
          placeholder="Sin usuario en la solicitud"
          editable={false}
        />
        <Field
          inSheet
          label="Teléfono (opcional)"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
        />
        <Field inSheet label="Dirección (opcional)" value={address} onChangeText={setAddress} />
        <FormError message={formError} />
        <FormError message={createClub.isError ? errorMessage(createClub.error, "club.create") : null} />
        <Button label="Crear club" loading={isPending} disabled={isPending} onPress={submit} />
      </View>
    </Sheet>
  );
}
