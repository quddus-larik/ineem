import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import {
  Avatar,
  BottomSheet,
  Button,
  Chip,
  InputGroup,
  ListGroup,
  PressableFeedback,
  Separator,
  Tabs,
  useBottomSheetAwareHandlers,
} from "heroui-native";
import { Fragment, useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { Image } from "expo-image";
import {
  InvoiceGroup,
  InvoiceItem,
  InvoiceRowProps,
  OVERDUE_DATA,
  VIEWED_DATA,
} from "@/config/data";
import { router } from "expo-router";

export const InvoiceRow = ({
  item,
  onPress,
  showDivider = false,
}: InvoiceRowProps) => (
  <Fragment>
    <PressableFeedback onPress={onPress}>
      <PressableFeedback.Ripple />
      <ListGroup.Item disabled>
        <ListGroup.ItemPrefix>
          <Avatar alt={item.name} size="sm" variant="soft">
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
    {showDivider && <Separator className="mx-4" />}
  </Fragment>
);



const InvoiceSection = ({ title, items }: any) => (
  <View className="mb-4">
    <View className="w-full mb-2 flex items-center justify-between flex-row">
      <Text className="text-muted">{title.toUpperCase()}</Text>
      <Chip>
        <Chip.Label>{items.length} items</Chip.Label>
      </Chip>
    </View>
    <ListGroup>
      {items.map((item: any, index: any) => (
        <InvoiceRow
          key={`${title}-${item.id}`}
          item={item}
          onPress={() => router.push(`/invoices/${item.id}`)}
          showDivider={index < items.length - 1}
        />
      ))}
    </ListGroup>
  </View>
);

export default function App() {
  const [activeTab, setActiveTab] = useState("unpaid");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { onFocus, onBlur } = useBottomSheetAwareHandlers();

  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filterItems = (items: InvoiceItem[]) => {
      if (!query) {
        return items;
      }

      return items.filter((item) =>
        [item.name, item.invoice, item.amount, item.due]
          .join(" ")
          .toLowerCase()
          .includes(query),
      );
    };

    return {
      overdue: filterItems(OVERDUE_DATA),
      viewed: filterItems(VIEWED_DATA),
    };
  }, [searchQuery]);

  const hasSearchResults =
    searchResults.overdue.length > 0 || searchResults.viewed.length > 0;

  return (
    <View className="bg-background h-full flex-1 relative">
      <ScrollView className="px-4 py-2 h-full">
        <View className="flex items-center justify-between flex-row w-full mb-3">
          <Text className="text-4xl text-background-inverse">Invoices</Text>
          <BottomSheet isOpen={isSearchOpen} onOpenChange={setIsSearchOpen}>
            <BottomSheet.Trigger asChild>
              <Button isIconOnly variant="tertiary" isDisabled={isSearchOpen}>
                <Image
                  source={{
                    uri: "https://unpkg.com/@mynaui/icons/icons/search.svg",
                  }}
                  style={{ height: 24, width: 24 }}
                  alt="logo-back"
                />
              </Button>
            </BottomSheet.Trigger>
            <BottomSheet.Portal>
              <BottomSheet.Overlay />
              <BottomSheet.Content
                snapPoints={["75%"]}
                handleComponent={() => null}
                contentContainerClassName="h-full px-0 pt-2"
                keyboardBehavior="fillParent"
              >
                <View className="px-5 my-3">
                  <InputGroup>
                    <InputGroup.Prefix>
                      <Image
                        source={{
                          uri: "https://unpkg.com/@mynaui/icons/icons/search.svg",
                        }}
                        style={{ height: 20, width: 20 }}
                        alt="search-icon"
                      />
                    </InputGroup.Prefix>
                    <InputGroup.Input
                      onChangeText={setSearchQuery}
                      onFocus={onFocus}
                      onBlur={onBlur}
                      placeholder="Search invoice data"
                      autoCapitalize="none"
                      autoCorrect={false}
                      returnKeyType="search"
                    />
                  </InputGroup>
                </View>
                <BottomSheetScrollView
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  contentContainerClassName="px-4 pb-safe-offset-8"
                >
                  <View className="items-center justify-center py-12 px-6">
                    <Text className="text-muted text-center">
                      No invoices match
                    </Text>
                  </View>
                </BottomSheetScrollView>
              </BottomSheet.Content>
            </BottomSheet.Portal>
          </BottomSheet>
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

        <InvoiceSection title="Overdue" items={OVERDUE_DATA} />
        <InvoiceSection title="Viewed" items={VIEWED_DATA} />
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
