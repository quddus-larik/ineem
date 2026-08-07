import React, { useState } from "react";
import { Home, Search, Bell, User, Grid2x2 } from "lucide-react-native";
import { Button, Surface, Label } from "heroui-native";
import { useUniwind } from "uniwind";

const NAV_ITEMS = [
  { id: "home", label: "Home", Icon: Home },
  { id: "files", label: "Files", Icon: Grid2x2 },
  { id: "search", label: "Search", Icon: Search },
  { id: "notifications", label: "Alerts", Icon: Bell },
];

export const BottomMenu = () => {
  const [activeTab, setActiveTab] = useState("home");

  const { theme } = useUniwind()

  return (
    <Surface
      variant={"transparent"}
      style={{ position: "absolute", left: 0, right: 0, bottom: 22, zIndex: 50 }}
      className="p-4 h-24 rounded-none flex-row items-center justify-center"
    >
      <Surface variant={"secondary"} className={"flex-row items-center gap-2 justify-between w-fit rounded-full p-2"}>
        {NAV_ITEMS.map(({ id, label, Icon }) => {
          const isActive = activeTab === id;

          return (
            <Button
              key={id}
              onPress={() => setActiveTab(id)}
              size={"lg"}
              className={`flex-row items-center justify-center gap-2 transition-all`}
              isIconOnly={!isActive}
              variant={isActive ? "primary" : "outline"}
              feedbackVariant="scale-ripple"
            >
              <Icon color={isActive ? "#FFFFFF" : theme == "dark" ? "#FFFFFF" : "#000000"} />
              {isActive && <Button.Label>{label}</Button.Label>}
            </Button>
          );
        })}
      </Surface>
    </Surface>
  );
};
