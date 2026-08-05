import { Button } from "heroui-native";
import { View } from "react-native";
import { router } from "expo-router";
import type { JSX } from "react";
import { Uniwind, useUniwind } from "uniwind";

export default function HomeScreen(): JSX.Element {
  const { theme } = useUniwind();
  return (
    <View className="flex-1 bg-background flex-col items-center justify-center gap-4 pt-8">
      <Button onPress={() => router.push("/sign-in")}>Signin</Button>
      <Button onPress={() => router.push("/view")}>Views</Button>
      <Button onPress={() => router.push("/main")}>Main</Button>
      <Button onPress={() => Uniwind.setTheme(theme === "light" ? "dark" : "light")}>
        <Button.Label>Toggle {theme === "light" ? "Dark" : "Light"} Mode</Button.Label>
      </Button>
    </View>
  );
}
