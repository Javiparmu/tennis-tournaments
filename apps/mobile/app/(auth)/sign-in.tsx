import { useSignIn } from "@clerk/clerk-expo";
import { errorMessage } from "@courtrank/core";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";
import { AuthScreen } from "../../components/auth-screen";
import { SocialButtons } from "../../components/social-buttons";
import { Button, Field, FormError } from "../../components/ui";

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
    <AuthScreen subtitle="Entra para inscribirte y seguir tu progreso.">
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
        <Button label="Entrar" loading={submitting} onPress={onSubmit} />
      </View>

      <View className="flex-row items-center gap-3">
        <View className="h-px flex-1 bg-line-strong" />
        <Text className="font-sans text-xs text-ink-faint">o</Text>
        <View className="h-px flex-1 bg-line-strong" />
      </View>

      <SocialButtons />

      <View className="flex-row justify-center gap-1">
        <Text className="font-sans text-ink-muted">¿No tienes cuenta?</Text>
        {/* NativeWind has no interop for expo-router's Link, so the classes go on a
            nested Text — on the Link they would be dropped without a type error. */}
        <Link href="/sign-up">
          <Text className="font-sans-semibold text-lime">Regístrate</Text>
        </Link>
      </View>
    </AuthScreen>
  );
}
