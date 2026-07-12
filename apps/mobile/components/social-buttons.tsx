import { useSSO } from "@clerk/clerk-expo";
import { errorMessage } from "@courtrank/core";
import * as AuthSession from "expo-auth-session";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useCallback, useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import { showToast } from "./ui";

WebBrowser.maybeCompleteAuthSession();

type OAuthStrategy = "oauth_google" | "oauth_apple";

// Google/Apple SSO via Clerk, mirroring the web social sign-in.
export function SocialButtons() {
  const router = useRouter();
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
        const { createdSessionId, setActive } = await startSSOFlow({
          strategy,
          redirectUrl: AuthSession.makeRedirectUri({ scheme: "courtrank" }),
        });
        if (createdSessionId && setActive) {
          await setActive({ session: createdSessionId });
          router.replace("/");
        }
      } catch (error) {
        showToast("danger", errorMessage(error));
      }
    },
    [router, startSSOFlow],
  );

  return (
    <View className="gap-3">
      <SocialButton label="Continuar con Google" onPress={() => onPress("oauth_google")} />
      <SocialButton label="Continuar con Apple" onPress={() => onPress("oauth_apple")} />
    </View>
  );
}

function SocialButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      className="items-center rounded-xl border border-paper/20 bg-paper/5 py-3 active:opacity-80"
      onPress={onPress}
    >
      <Text className="text-base font-semibold text-paper">{label}</Text>
    </Pressable>
  );
}
