import {
  Typography,
  Surface,
  Label,
  Description,
  Card,
  Button,
  PressableFeedback,
} from "heroui-native";
import type { JSX } from "react";
import { View, Image, Text, StyleSheet } from "react-native";

const demoImages = [
  "https://i0.wp.com/everyday.codes/wp-content/uploads/2019/06/react-native-1024x631-1024x631.png?resize=680%2C419&ssl=1",
  "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=400",
  "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400",
  "https://images.unsplash.com/photo-1477346611705-65d1883cee1e?w=400",
  "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400",
  "https://images.unsplash.com/photo-1521295121783-8a321d551ad2?w=400",
];

export default function HomeScreen(): JSX.Element {
  return (
    <View className="flex-1 bg-background flex flex-col pt-8 px-2">
      <View className="flex flex-col gap-1 justify-center items-center h-44">
        <Typography.Heading type="h2">Files</Typography.Heading>
        <Typography.Paragraph>Total {demoImages.length} files</Typography.Paragraph>
      </View>
      <View className="flex flex-row justify-between items-center py-3">
        <Button size="sm">Menu</Button>
        <Button size="sm">Search</Button>
      </View>
      <View className="flex flex-col px-0 gap-2">
        <View className="flex flex-row flex-wrap gap-2">
          {demoImages.map((src, index) => (
            <PressableFeedback
              key={index}
              className="flex-[1_1_45%] min-w-[150px]"
            >
              <Card className="aspect-square w-full rounded-xl">
                <Image
                  source={{
                    uri: "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/neo2.jpeg",
                  }}
                  style={StyleSheet.absoluteFill}
                  resizeMode="cover"
                />
                <PressableFeedback.Ripple
                  animation={{
                    backgroundColor: { value: "white" },
                    opacity: { value: [0, 0.3, 0] },
                  }}
                />
              </Card>
              <View className="flex flex-col">
                <Label>Resume.pdf</Label>
                <Description>23 March, 2026</Description>
              </View>
            </PressableFeedback>
          ))}
        </View>
      </View>
    </View>
  );
}
