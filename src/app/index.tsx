import FontAwesome from "@expo/vector-icons/FontAwesome";
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
import { Link, useRouter } from "expo-router";

export default function App() {
  const { isDark, toggleTheme } = useAppTheme();
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const handleChange = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };
  

  return (
    <View className="bg-background h-full flex items-start justify-end px-3 py-20 gap-3">
      <View className="h-80 w-80 bg-accent self-center mb-20 rounded-full">

      </View>

      <Text className="text-2xl text-background-inverse">✧ Nivoice</Text>
      <Text className="text-4xl text-background-inverse">Proof Your Product throuht Invoices</Text>
      <Text className="text-lg text-muted">Generate invoices in easy way with full control and security</Text>
      <Button className="w-full" onPress={()=> router.push("/register")}>Join Now</Button>
    </View>
  );
}
