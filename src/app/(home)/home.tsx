import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  Avatar,
  Button,
  Chip,
  Input,
  Label,
  ListGroup,
  PressableFeedback,
  Separator,
  Tabs,
  TextField,
} from "heroui-native";
import { useState, Fragment } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useAppTheme } from "../../contexts/app-theme-context";
import { Image } from "expo-image";
import { Link, useRouter } from "expo-router";

const OVERDUE_DATA = [
  { id: "1", name: "Akram", fallback: "AK", invoice: "#100024", amount: "$295", due: "Due 15 days ago" },
  { id: "2", name: "Rehan", fallback: "RH", invoice: "#100023", amount: "$290", due: "Due 15 days ago" },
  { id: "3", name: "Sara", fallback: "SA", invoice: "#100022", amount: "$150", due: "Due 20 days ago" },
];

const VIEWED_DATA = [
  { id: "1", name: "Akram", fallback: "AK", invoice: "#100024", amount: "$295", due: "Due 15 days ago" },
  { id: "2", name: "Rehan", fallback: "RH", invoice: "#100023", amount: "$290", due: "Due 15 days ago" },
  { id: "3", name: "Ali", fallback: "AL", invoice: "#100021", amount: "$420", due: "Due in 2 days" },
  { id: "4", name: "Zain", fallback: "ZN", invoice: "#100020", amount: "$110", due: "Due in 5 days" },
  { id: "5", name: "Sana", fallback: "SN", invoice: "#100019", amount: "$350", due: "Due in 6 days" },
  { id: "6", name: "Umer", fallback: "UM", invoice: "#100018", amount: "$95", due: "Due in 7 days" },
  { id: "7", name: "Hamza", fallback: "HZ", invoice: "#100017", amount: "$ Rail", due: "Due in 12 days" },
  { id: "8", name: "Bilal", fallback: "BL", invoice: "#100016", amount: "$210", due: "Due in 14 days" },
];

export default function App() {
  const { isDark, toggleTheme } = useAppTheme();
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [activeTab, setActiveTab] = useState("unpaid");

  const handleChange = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <View className="bg-background h-full flex-1 relative">
      <ScrollView className="px-4 py-2 h-full">
        <View className="flex items-center justify-between flex-row w-full mb-3">
          <Text className="text-4xl text-background-inverse">Invoices</Text>
          <Button isIconOnly variant="tertiary">
            <Image
              source={{
                uri: "https://unpkg.com/@mynaui/icons/icons/search.svg",
              }}
              style={{ height: 24, width: 24 }}
              alt="logo-back"
            />
          </Button>
        </View>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full h-14 mb-3"
        >
          <Tabs.List className="w-full flex-row h-full">
            <Tabs.Indicator />
            <Tabs.Trigger value="unpaid" className="flex-1 h-full">
              <Tabs.Label className="text-lg">Unpaid</Tabs.Label>
            </Tabs.Trigger>
            <Tabs.Trigger value="paid" className="flex-1 h-full">
              <Tabs.Label className="text-lg">Paid</Tabs.Label>
            </Tabs.Trigger>
          </Tabs.List>
        </Tabs>

        <View className="w-full mb-2 flex items-center justify-between flex-row">
          <Text className="text-muted">OVERDUE</Text>
          <Chip>
            <Chip.Label>{OVERDUE_DATA.length} items</Chip.Label>
          </Chip>
        </View>
        <ListGroup className="mb-4">
          {OVERDUE_DATA.map((item, index) => (
            <Fragment key={item.id}>
              <PressableFeedback 
                onPress={() => console.log(`Pressed overdue item ${item.id}`)}
              >
                <PressableFeedback.Ripple />
                <ListGroup.Item disabled>
                  <ListGroup.ItemPrefix>
                    <Avatar alt="AM" size="sm" variant="soft">
                      <Avatar.Fallback>{item.fallback}</Avatar.Fallback>
                    </Avatar>
                  </ListGroup.ItemPrefix>
                  <ListGroup.ItemContent className="flex flex-row items-center justify-between">
                    <View>
                      <ListGroup.ItemTitle>{item.name}</ListGroup.ItemTitle>
                      <ListGroup.ItemDescription>
                        invoice {item.invoice}
                      </ListGroup.ItemDescription>
                    </View>
                    <View>
                      <ListGroup.ItemTitle className="text-right">
                        {item.amount}
                      </ListGroup.ItemTitle>
                      <ListGroup.ItemDescription className="text-right">
                        {item.due}
                      </ListGroup.ItemDescription>
                    </View>
                  </ListGroup.ItemContent>
                </ListGroup.Item>
              </PressableFeedback>
              {index < OVERDUE_DATA.length - 1 && <Separator className="mx-4" />}
            </Fragment>
          ))}
        </ListGroup>

        <View className="w-full mb-2 flex items-center justify-between flex-row">
          <Text className="text-muted">VIEWED</Text>
          <Chip>
            <Chip.Label>{VIEWED_DATA.length} items</Chip.Label>
          </Chip>
        </View>
        <ListGroup className="mb-6">
          {VIEWED_DATA.map((item, index) => (
            <Fragment key={item.id}>
              <PressableFeedback 
                onPress={() => console.log(`Pressed viewed item ${item.id}`)}
              >
                <PressableFeedback.Ripple />
                <ListGroup.Item disabled>
                  <ListGroup.ItemPrefix>
                    <Avatar alt="AM" size="sm" variant="soft">
                      <Avatar.Fallback>{item.fallback}</Avatar.Fallback>
                    </Avatar>
                  </ListGroup.ItemPrefix>
                  <ListGroup.ItemContent className="flex flex-row items-center justify-between">
                    <View>
                      <ListGroup.ItemTitle>{item.name}</ListGroup.ItemTitle>
                      <ListGroup.ItemDescription>
                        invoice {item.invoice}
                      </ListGroup.ItemDescription>
                    </View>
                    <View>
                      <ListGroup.ItemTitle className="text-right">
                        {item.amount}
                      </ListGroup.ItemTitle>
                      <ListGroup.ItemDescription className="text-right">
                        {item.due}
                      </ListGroup.ItemDescription>
                    </View>
                  </ListGroup.ItemContent>
                </ListGroup.Item>
              </PressableFeedback>
              {index < VIEWED_DATA.length - 1 && <Separator className="mx-4" />}
            </Fragment>
          ))}
        </ListGroup>
        <View className="w-full h-24" />
      </ScrollView>

      <Button
        isIconOnly
        size="lg"
        className="absolute bottom-6 right-6 elevation-5 shadow-lg"
      >
        <Image
          source={{
            uri: "https://unpkg.com/@mynaui/icons/icons/plus.svg",
          }}
          style={{ height: 26, width: 26 }}
          alt="logo-back"
        />
      </Button>
    </View>
  );
}