import { useSSO } from "@clerk/clerk-expo";
import { errorMessage } from "@courtrank/core";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import type { ReactNode } from "react";
import { useCallback, useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import { AppleMark, GoogleMark } from "./brand-marks";
import { showToast } from "./ui";

WebBrowser.maybeCompleteAuthSession();

type OAuthStrategy = "oauth_google" | "oauth_apple";

// Google/Apple SSO via Clerk, mirroring the web social sign-in.
export function SocialButtons() {
  const { startSSOFlow } = useSSO();

  useEffect(() => {
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);

  const onPress = useCallback(
    async (strategy: OAuthStrategy) => {
      try {
        const { createdSessionId, setActive, signIn, signUp, authSessionResult } = await startSSOFlow({
          strategy,
          redirectUrl: AuthSession.makeRedirectUri({ scheme: "courtrank" }),
        });

        if (createdSessionId && setActive) {
          // No router.replace here: the root Stack.Protected guard swaps (auth) for
          // (tabs) as soon as Clerk flips isSignedIn, and racing it logs a nav warning.
          await setActive({ session: createdSessionId });
          return;
        }

        // The user closed the browser or the redirect never came back. Stay put silently.
        if (authSessionResult?.type !== "success") return;

        // Google verified but Clerk minted no session. startSSOFlow resolves instead of
        // throwing here, so without this branch the screen just sits there. The usual
        // cause is the transfer sign-up landing in missing_requirements.
        console.warn("[sso] provider verified but no session created", {
          strategy,
          signInStatus: signIn?.status,
          firstFactor: signIn?.firstFactorVerification?.status,
          signUpStatus: signUp?.status,
          missingFields: signUp?.missingFields,
          unverifiedFields: signUp?.unverifiedFields,
        });
        showToast("danger", "No pudimos completar el inicio de sesión con esa cuenta.");
      } catch (error) {
        showToast("danger", errorMessage(error));
      }
    },
    [startSSOFlow],
  );

  return (
    <View className="gap-3">
      <SocialButton label="Continuar con Google" icon={<GoogleMark />} onPress={() => onPress("oauth_google")} />
      <SocialButton label="Continuar con Apple" icon={<AppleMark />} onPress={() => onPress("oauth_apple")} />
    </View>
  );
}

// Solid white on the dark backdrop — the conventional SSO treatment, and the only
// one that keeps provider buttons from reading as disabled. Deliberately NOT the
// lime `Button`: lime is the app's own primary action, and Google/Apple sign-in
// should not wear it.
function SocialButton({ label, icon, onPress }: { label: string; icon?: ReactNode; onPress: () => void }) {
  return (
    <Pressable
      className="min-h-[48px] flex-row items-center justify-center gap-3 rounded-2xl bg-white active:opacity-90"
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {icon}
      <Text className="font-sans-semibold text-base text-canvas">{label}</Text>
    </Pressable>
  );
}
