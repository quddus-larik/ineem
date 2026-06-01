import { Button, Input, Label, Separator, TextField } from "heroui-native";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useAppTheme } from "../contexts/app-theme-context";
import { Image } from "expo-image";
import { Link } from "expo-router";

export default function App() {
  const { isDark, toggleTheme } = useAppTheme();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, flexDirection: "column" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      
      <ScrollView
        className="flex-1 bg-background pt-20"
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 w-full">
          <View className="h-1/3 flex items-center justify-center p-4">
            <Text className="text-3xl font-sans mb-2 text-background-inverse">Login</Text>
            <Text className="text-sm font-sans">
              <Text className="text-background-inverse">Not a member?</Text>
              <Link href={"/register"}>
                <Text className="text-accent"> Register</Text>
              </Link>
            </Text>
          </View>
          <View className="w-full flex-col gap-4 p-5 flex-1 justify-center">
            <TextField className="w-full">
              <Label>Email address</Label>
              <Input
                value={form.email}
                onChangeText={(v) => handleChange("email", v)}
                keyboardType="email-address"
                placeholder="alex@example.com"
                returnKeyType="next"
              />
            </TextField>
            <TextField className="w-full">
              <Label>Password</Label>
              <Input
                value={form.password}
                onChangeText={(v) => handleChange("password", v)}
                secureTextEntry
                placeholder="••••••••"
                returnKeyType="done"
              />
            </TextField>
            <Button className="w-full mt-4">
              <Button.Label>LogIn</Button.Label>
            </Button>
          </View>
        </View>
        <View className="w-full px-6 mt-6">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 h-px bg-muted-foreground/50">
              <Separator /> {/* Or just use View as line */}
            </View>
            <Text className="px-4 text-muted-foreground text-sm font-medium">
              OR
            </Text>
            <View className="flex-1 h-px bg-muted-foreground/50">
              <Separator />
            </View>
          </View>
        </View>
        <View className="flex-row items-center justify-center mt-2">
          <Text className="text-muted">Join through social media apps</Text>
        </View>
        <View className="w-full flex-row gap-2 p-4 justify-between">
          <Button variant="secondary" isIconOnly size="lg">
            <Image
              source={{
                uri: "https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/google/color.svg",
              }}
              style={{ width: 24, height: 24 }}
            />
          </Button>
          <Button
            variant="secondary"
            onPress={() => toggleTheme()}
            isIconOnly
            size="lg"
          >
            <Image
              source={{
                uri: "https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/facebook/default.svg",
              }}
              style={{ width: 24, height: 24 }}
            />
          </Button>
          <Button
            variant="secondary"
            onPress={() => toggleTheme()}
            isIconOnly
            size="lg"
          >
            <Image
              source={{
                uri: "https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/github/default.svg",
              }}
              style={{ width: 24, height: 24 }}
            />
          </Button>
          <Button
            variant="secondary"
            onPress={() => toggleTheme()}
            isIconOnly
            size="lg"
          >
            <Image
              source={{
                uri: "https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/discord/default.svg",
              }}
              style={{ width: 24, height: 24 }}
            />
          </Button>
          <Button
            variant="secondary"
            onPress={() => toggleTheme()}
            isIconOnly
            size="lg"
          >
            <Image
              source={{
                uri: "https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/apple/mono.svg",
              }}
              style={{ width: 24, height: 24 }}
            />
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
