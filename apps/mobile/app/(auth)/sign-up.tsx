import { useSignUp } from "@clerk/clerk-expo";
import { errorMessage } from "@courtrank/core";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SocialButtons } from "../../components/social-buttons";

// Minimal email/password sign-up with email-code verification (Phase 5 adds SSO
// + polish).
export default function SignUpScreen() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit() {
    if (!isLoaded || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await signUp.create({ emailAddress: email, password });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function onVerify() {
    if (!isLoaded || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const attempt = await signUp.attemptEmailAddressVerification({ code });
      if (attempt.status === "complete") {
        await setActive({ session: attempt.createdSessionId });
        router.replace("/");
      } else {
        setError("No se pudo verificar el código.");
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
        <Text className="mb-2 text-3xl font-bold text-paper">Crear cuenta</Text>

        {pendingVerification ? (
          <>
            <Text className="mb-2 text-base text-paper/60">Introduce el código que enviamos a tu correo.</Text>
            <TextInput
              className="rounded-xl border border-paper/20 bg-paper/5 px-4 py-3 text-paper"
              placeholder="Código"
              placeholderTextColor="#9ca3af"
              keyboardType="number-pad"
              value={code}
              onChangeText={setCode}
            />
            {error ? <Text className="text-sm text-clay">{error}</Text> : null}
            <Pressable className="mt-2 items-center rounded-xl bg-clay py-3 active:opacity-80" onPress={onVerify} disabled={submitting}>
              {submitting ? <ActivityIndicator color="#fff" /> : <Text className="text-base font-semibold text-white">Verificar</Text>}
            </Pressable>
          </>
        ) : (
          <>
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
            <Pressable className="mt-2 items-center rounded-xl bg-clay py-3 active:opacity-80" onPress={onSubmit} disabled={submitting}>
              {submitting ? <ActivityIndicator color="#fff" /> : <Text className="text-base font-semibold text-white">Continuar</Text>}
            </Pressable>
            <View className="my-2 flex-row items-center gap-3">
              <View className="h-px flex-1 bg-paper/15" />
              <Text className="text-xs text-paper/40">o</Text>
              <View className="h-px flex-1 bg-paper/15" />
            </View>
            <SocialButtons />
            <View className="mt-4 flex-row justify-center gap-1">
              <Text className="text-paper/60">¿Ya tienes cuenta?</Text>
              <Link href="/sign-in" className="font-semibold text-clay">
                Entra
              </Link>
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
