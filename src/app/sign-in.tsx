import { View } from "react-native";
import {
  Tabs,
  Label,
  Input,
  FieldError,
  TextField,
  Separator,
  Button,
  LinkButton,
  Checkbox,
} from "heroui-native";
import { useState } from "react";
import { useUniwind } from "uniwind";
import { GoogleIcon, GithubIcon, XIcon } from "../../components/icons";

export default function SignInInterface() {
  const { theme } = useUniwind();
  const [activeTab, setActiveTab] = useState<string>("tab2");
  const [isSelected, setIsSelected] = useState<boolean>(false);
  return (
    <View className="flex-1 bg-background flex flex-col pt-10 px-3">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <Tabs.List className="w-full">
          <Tabs.Indicator />
          <Tabs.Trigger value="tab1" className="flex-1 py-3">
            <Tabs.Label className="text-lg">Log In</Tabs.Label>
          </Tabs.Trigger>
          <Tabs.Trigger value="tab2" className="flex-1 py-3">
            <Tabs.Label className="text-lg">Sign Up</Tabs.Label>
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="tab1" className="flex flex-col gap-3 pt-32">
          <TextField isRequired isInvalid={false}>
            <Label>Email Address</Label>
            <Input keyboardType="email-address" placeholder="Enter your email" />
            {/* <FieldError>Please enter a valid email</FieldError> */}
          </TextField>
          <TextField isRequired isInvalid={false}>
            <Label>Password</Label>
            <Input  keyboardType="visible-password" placeholder="Enter your email" />
            {/* <FieldError>Please enter a valid email</FieldError> */}
          </TextField>
          <View className="flex flex-row justify-between items-center">
            <View className="flex flex-row gap-1 items-center">
              <Checkbox isSelected={isSelected} onSelectedChange={setIsSelected}>
                <Checkbox.Indicator />
              </Checkbox>
              <Label className="text-base">Remember me</Label>
            </View>
            <LinkButton>forgot password</LinkButton>
          </View>
          <Button className="w-full" size="lg">
            Login
          </Button>
          <View className="flex flex-row gap-2 items-center justify-center">
            <Separator className="flex-1 dark:bg-muted" />
            <Label>OR</Label>
            <Separator className="flex-1 dark:bg-muted" />
          </View>
          <Label>Sign in with accounts</Label>
          <View className="flex flex-row gap-2 w-full">
            <Button size="lg" variant="outline" className="flex-1 rounded-xl">
              <GoogleIcon width={24} height={24} />
            </Button>
            <Button size="lg" variant="outline" className="flex-1 rounded-xl">
              <GithubIcon width={24} height={24} theme={theme} />
            </Button>
            <Button size="lg" variant="outline" className="flex-1 rounded-xl">
              <XIcon width={22} height={22} theme={theme} />
            </Button>
          </View>
        </Tabs.Content>
        <Tabs.Content value="tab2"></Tabs.Content>
      </Tabs>
    </View>
  );
}
