import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { X } from "lucide-react-native";
import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../theme/tokens";

type SheetProps = {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Renders a title row with a close button. */
  title?: string;
  /** Detents for the native sheet. Defaults to a single ~55% panel — tune per sheet
      (e.g. ["75%"] for a long form). Ignored on web, which uses a max-height panel. */
  snapPoints?: string[];
};

// A fixed default detent, not content-measured. gorhom's `enableDynamicSizing`
// measures content height to size the sheet, and on Expo SDK 54's stack (React
// Native 0.81 New Architecture + Reanimated 4) that measurement resolves to 0 — so
// every dynamically-sized sheet "opened" at zero height and was invisible. Explicit
// snap points sidestep the broken measurement entirely.
// See gorhom/react-native-bottom-sheet#2528.
const DEFAULT_SNAP_POINTS = ["55%"];

// Bottom sheet for forms/confirmations (replaces web ModalShell).
//
// Two implementations behind one API. On native it is gorhom's BottomSheetModal
// (pan-to-close, keyboard tracking). On react-native-web gorhom's modal is
// unreliable — the imperative present() often renders nothing — so the web build
// falls back to a plain RN Modal with its own slide-up animation. Callers stay
// declarative on `visible` either way.
export function Sheet(props: SheetProps) {
  if (Platform.OS === "web") {
    return <WebSheet {...props} />;
  }
  return <NativeSheet {...props} />;
}

// Shared title + close row, so the two implementations can never drift apart.
function SheetHeader({ title, onClose }: { title?: string; onClose: () => void }) {
  if (!title) return null;
  return (
    <View className="mb-4 flex-row items-center justify-between gap-3">
      <Text className="flex-1 font-display text-lg text-ink">{title}</Text>
      <Pressable
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Cerrar"
        className="-mr-2 h-11 w-11 items-center justify-center rounded-full active:opacity-70"
      >
        <X color={colors.inkFaint} size={20} />
      </Pressable>
    </View>
  );
}

function NativeSheet({ visible, onClose, children, title, snapPoints }: SheetProps) {
  const ref = useRef<BottomSheetModal>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (visible) {
      ref.current?.present();
    } else {
      ref.current?.dismiss();
    }
  }, [visible]);

  const renderBackdrop = useCallback(
    (backdropProps: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...backdropProps}
        opacity={0.5}
        pressBehavior="close"
        appearsOnIndex={0}
        disappearsOnIndex={-1}
      />
    ),
    [],
  );

  return (
    <BottomSheetModal
      ref={ref}
      onDismiss={onClose}
      snapPoints={snapPoints ?? DEFAULT_SNAP_POINTS}
      // Off on purpose — see DEFAULT_SNAP_POINTS. Content-measured sizing is broken on
      // this RN/Reanimated version and leaves the sheet invisible.
      enableDynamicSizing={false}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
      handleIndicatorStyle={{ backgroundColor: colors.lineStrong }}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
    >
      {/* Always a scroll view so a form taller than its detent (or pushed up by the
          keyboard) can still reach its submit button; short forms just don't scroll.
          BottomSheetScrollView has no NativeWind interop, so the padding is inline. */}
      <BottomSheetScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 16 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <SheetHeader title={title} onClose={onClose} />
        {children}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
// A safe start/exit offset — larger than any panel, so at rest the panel is fully
// below the viewport. After the first open its real measured height takes over.
const OFFSCREEN = 1000;

function WebSheet({ visible, onClose, children, title }: SheetProps) {
  // Kept mounted through the close so the slide-down can play before it unmounts —
  // an RN Modal with `visible=false` would tear the panel out instantly.
  const [mounted, setMounted] = useState(visible);
  const translateY = useSharedValue(OFFSCREEN);
  const backdrop = useSharedValue(0);
  const panelHeight = useRef(OFFSCREEN);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      backdrop.value = withTiming(1, { duration: 200 });
      translateY.value = withSpring(0, { damping: 22, stiffness: 240, mass: 0.7 });
    } else {
      backdrop.value = withTiming(0, { duration: 180 });
      translateY.value = withTiming(panelHeight.current, { duration: 200 }, (finished) => {
        if (finished) runOnJS(setMounted)(false);
      });
    }
  }, [visible, backdrop, translateY]);

  const backdropStyle = useAnimatedStyle(() => ({ opacity: backdrop.value }));
  const panelStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));

  if (!mounted) return null;

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose}>
      <View className="flex-1 justify-end">
        {/* Backdrop sits behind the panel, so a tap on the panel never reaches it. */}
        <AnimatedPressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Cerrar"
          style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0,0,0,0.5)" }, backdropStyle]}
        />
        {/* className is dropped on Animated.*, so the wrapper is style-only (transform
            + the max-height cap) and the visual chrome lives on the inner View. */}
        <Animated.View style={[{ maxHeight: "88%" }, panelStyle]}>
          <View
            onLayout={(event) => {
              panelHeight.current = event.nativeEvent.layout.height;
            }}
            className="rounded-t-3xl border-t border-line bg-surface px-5 pb-8 pt-3"
          >
            <View className="mb-3 h-1 w-10 self-center rounded-full bg-line-strong" />
            <SheetHeader title={title} onClose={onClose} />
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              {children}
            </ScrollView>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
