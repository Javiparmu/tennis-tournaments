import { CLUB_CONTACT_EMAIL, errorMessage } from "@courtrank/core";
import { CheckCircle2 } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Linking, Text, View } from "react-native";
import { useClubContactRequestMutation } from "../../data/queries/clubs";
import { useMeQuery } from "../../data/queries/users";
import { colors } from "../../theme/tokens";
import { Button, Field, FormError, Sheet } from "../ui";

// Mobile port of web's club-contact-modal. A signed-in user asks for their club to be
// provisioned: the request lands in the admin queue and the operator creates the club
// (the requester becomes its owner). The whole app tree is signed-in-guarded, so this
// only gates on having a resolved username; anonymous handling is unnecessary here.
export function ClubContactSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const me = useMeQuery();
  const contactRequest = useClubContactRequestMutation();

  const [clubName, setClubName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const username = me.data?.username;

  // The sheet stays mounted between opens; resync each time it opens so a reopen after a
  // successful submit starts clean.
  useEffect(() => {
    if (visible) {
      setClubName("");
      setContactName(me.data?.name ?? "");
      setEmail("");
      setPhone("");
      setMessage("");
      setFormError(null);
      contactRequest.reset();
    }
  }, [visible, me.data?.name, contactRequest.reset]);

  async function submit() {
    setFormError(null);
    if (!clubName.trim() || !contactName.trim() || !email.trim()) {
      setFormError("Nombre del club, tu nombre y email son obligatorios.");
      return;
    }
    if (!username) {
      setFormError("No pudimos leer tu usuario. Inténtalo de nuevo en un momento.");
      return;
    }
    try {
      await contactRequest.mutateAsync({
        clubName: clubName.trim(),
        contactName: contactName.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
        message: message.trim() || null,
        ownerUsername: username,
      });
    } catch {
      // surfaced via mutation error below
    }
  }

  if (contactRequest.isSuccess) {
    return (
      <Sheet visible={visible} onClose={onClose} title="Solicitud enviada">
        <View className="items-center gap-3 py-4">
          <CheckCircle2 color={colors.lime} size={40} />
          <Text className="text-center font-display text-lg text-ink">¡Gracias por tu interés!</Text>
          <Text className="text-center font-sans text-sm text-ink-muted">
            Hemos recibido la solicitud de{" "}
            <Text className="font-sans-semibold text-ink">{clubName.trim()}</Text>. Te contactaremos en {email.trim()}{" "}
            para dar de alta tu club.
          </Text>
          <Button className="mt-2 w-full" label="Entendido" onPress={onClose} />
        </View>
      </Sheet>
    );
  }

  return (
    <Sheet visible={visible} onClose={onClose} title="Da de alta tu club" snapPoints={["90%"]}>
      <View className="gap-3">
        <Text className="font-sans text-sm text-ink-muted">
          Cuéntanos sobre tu club y te crearemos la cuenta personalmente. Tu cuenta será la propietaria del club.
        </Text>
        <Field
          inSheet
          label="Usuario propietario"
          value={username ? `@${username}` : "Cargando…"}
          editable={false}
        />
        <Field inSheet label="Nombre del club" value={clubName} onChangeText={setClubName} />
        <Field inSheet label="Tu nombre" value={contactName} onChangeText={setContactName} />
        <Field
          inSheet
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Field
          inSheet
          label="Teléfono (opcional)"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
        <Field
          inSheet
          label="Mensaje (opcional)"
          value={message}
          onChangeText={setMessage}
          multiline
        />
        <FormError message={formError} />
        <FormError message={contactRequest.isError ? errorMessage(contactRequest.error, "clubContact.create") : null} />
        <Button
          label="Enviar solicitud"
          loading={contactRequest.isPending}
          disabled={contactRequest.isPending}
          onPress={submit}
        />
        <Text
          className="text-center font-sans text-xs text-ink-faint"
          onPress={() => Linking.openURL(`mailto:${CLUB_CONTACT_EMAIL}`)}
        >
          O escríbenos a {CLUB_CONTACT_EMAIL}
        </Text>
      </View>
    </Sheet>
  );
}
