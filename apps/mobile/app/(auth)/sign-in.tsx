import { useSignIn } from "@clerk/clerk-expo";
import { errorMessage } from "@courtrank/core";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Minimal email/password sign-in (Phase 5 adds Google/Apple SSO + polish).
export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit() {
    if (!isLoaded || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const attempt = await signIn.create({ identifier: email, password });
      if (attempt.status === "complete") {
        await setActive({ session: attempt.createdSessionId });
        router.replace("/");
      } else {
        setError("No se pudo completar el inicio de sesión.");
      }
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-ink">
      <View className="flex-1 justify-center gap-4 px-6">
        <Text className="mb-2 text-3xl font-bold text-paper">CourtRank</Text>
        <Text className="mb-4 text-base text-paper/60">Entra para inscribirte y seguir tu progreso.</Text>

        <TextInput
          className="rounded-xl border border-paper/20 bg-paper/5 px-4 py-3 text-paper"
          placeholder="Correo electrónico"
          placeholderTextColor="#9ca3af"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          className="rounded-xl border border-paper/20 bg-paper/5 px-4 py-3 text-paper"
          placeholder="Contraseña"
          placeholderTextColor="#9ca3af"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {error ? <Text className="text-sm text-clay">{error}</Text> : null}

        <Pressable
          className="mt-2 items-center rounded-xl bg-clay py-3 active:opacity-80"
          onPress={onSubmit}
          disabled={submitting}
        >
          {submitting ? <ActivityIndicator color="#fff" /> : <Text className="text-base font-semibold text-white">Entrar</Text>}
        </Pressable>

        <View className="mt-4 flex-row justify-center gap-1">
          <Text className="text-paper/60">¿No tienes cuenta?</Text>
          <Link href="/sign-up" className="font-semibold text-clay">
            Regístrate
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}
