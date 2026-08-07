import { Stack } from "expo-router";
import { HeroUINativeProvider, Surface, Button, Avatar } from "heroui-native";
import type { JSX } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "../global.css";
import { useUniwind } from "uniwind";
import { BottomMenu } from "../../components/layout/menu";
import { StatusBar, View } from "react-native";
import { ChevronLeft, User, Search } from "lucide-react-native";
import { useRouter } from "expo-router";

export default function RootLayout(): JSX.Element {
  const { theme } = useUniwind();
  const router = useRouter();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <HeroUINativeProvider>
        <View className={"bg-surface-secondary h-8 w-full"}></View>
        <Surface
          variant={"secondary"}
          className={"w-full p-2 flex-row justify-between items-center rounded-none"}
        >
          <Button onPress={() => router.back()} isIconOnly variant={"ghost"}>
            <ChevronLeft color={"#FFFFFF"} />
          </Button>

          <View className={"flex-row items-center gap-2"}>
            <Button isIconOnly>
              <Search color={"#FFFFFF"} />
            </Button>
            <Avatar className={"self-end"} color={"accent"} variant={"soft"}>
              <Avatar.Fallback>
                <User color={"#000000"} />
              </Avatar.Fallback>
            </Avatar>
          </View>
        </Surface>
        <Stack screenOptions={{ headerShown: false }} />
        <BottomMenu />
      </HeroUINativeProvider>
    </GestureHandlerRootView>
  );
}
