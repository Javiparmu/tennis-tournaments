import { useSignUp } from "@clerk/clerk-expo";
import { errorMessage } from "@courtrank/core";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";
import { AuthScreen } from "../../components/auth-screen";
import { SocialButtons } from "../../components/social-buttons";
import { Button, Field, FormError } from "../../components/ui";

// Email/password sign-up with email-code verification.
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
    <AuthScreen subtitle={pendingVerification ? "Introduce el código que enviamos a tu correo." : "Crea tu cuenta."}>
      {pendingVerification ? (
        <View className="gap-3">
          <Field placeholder="Código" keyboardType="number-pad" value={code} onChangeText={setCode} />
          <FormError message={error} />
          <Button label="Verificar" loading={submitting} onPress={onVerify} />
        </View>
      ) : (
        <>
          <View className="gap-3">
            <Field
              placeholder="Correo electrónico"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
            <Field placeholder="Contraseña" secureTextEntry value={password} onChangeText={setPassword} />
            <FormError message={error} />
            <Button label="Continuar" loading={submitting} onPress={onSubmit} />
          </View>

          <View className="flex-row items-center gap-3">
            <View className="h-px flex-1 bg-line-strong" />
            <Text className="font-sans text-xs text-ink-faint">o</Text>
            <View className="h-px flex-1 bg-line-strong" />
          </View>

          <SocialButtons />

          <View className="flex-row justify-center gap-1">
            <Text className="font-sans text-ink-muted">¿Ya tienes cuenta?</Text>
            {/* NativeWind has no interop for expo-router's Link, so the classes go on
                a nested Text — on the Link they would be dropped without a type error. */}
            <Link href="/sign-in">
              <Text className="font-sans-semibold text-lime">Entra</Text>
            </Link>
          </View>
        </>
      )}
    </AuthScreen>
  );
}
