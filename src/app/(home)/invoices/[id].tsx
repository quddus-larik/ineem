import { VIEWED_DATA } from "@/config/data";
import { useLocalSearchParams } from "expo-router";
import {
  Avatar,
  Button,
  Card,
  Chip,
  Description,
  Label,
  LinkButton,
  ListGroup,
  PressableFeedback,
  Separator,
} from "heroui-native";
import { Fragment } from "react";
import { View, Text } from "react-native";

export const InvoiceRow = ({ item, onPress, showDivider = false }: any) => (
  <Fragment>
    <PressableFeedback onPress={onPress}>
      <PressableFeedback.Ripple />
      <ListGroup.Item disabled>
        <ListGroup.ItemPrefix>
          <Avatar alt={item.name} size="lg" variant="soft">
            <Avatar.Fallback>{item.fallback}</Avatar.Fallback>
          </Avatar>
        </ListGroup.ItemPrefix>
        <ListGroup.ItemContent className="flex flex-row items-center justify-between">
          <View>
            <ListGroup.ItemTitle>{item.name}</ListGroup.ItemTitle>
            <ListGroup.ItemDescription>
              {item.invoice}
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

export default function App() {
  const { id } = useLocalSearchParams();
  const InvoiceData = VIEWED_DATA.filter((items) => items.id === id)[0];

  return (
    <View className="flex flex-col bg-background px-2 h-full">
      <InvoiceRow item={InvoiceData} />
      <Card className="w-full">
        <Card.Header className="w-full flex flex-row items-center justify-between">
          <View>
            <Card.Title>Items</Card.Title>
            <Card.Description>{InvoiceData.invoice}</Card.Description>
          </View>
          <Button size="sm">Edit</Button>
        </Card.Header>
        <Separator className="my-3" />
        <Card.Body className="flex flex-col gap-2">
          <View className="w-full flex-row items-center justify-between">
            <Label>Bill to</Label>
            <Label>{InvoiceData.name}</Label>
          </View>
          <View className="w-full flex-row items-center justify-between">
            <Label>Amount due</Label>
            <Label>{InvoiceData.amount}</Label>
          </View>
          <View className="w-full flex-row items-center justify-between">
            <Label>Payment due</Label>
            <Label>{InvoiceData.due}</Label>
          </View>
          <View className="w-full flex-row items-center justify-between mt-2">
            <Label className="text-lg uppercase">Items</Label>
            <Label className="text-lg uppercase">Amount</Label>
          </View>
          <Separator />
          <View className="w-full flex-col items-center justify-between gap-1">
            <View className="w-full flex-row items-center justify-between">
              <Label className="text-base">Web Design</Label>
              <Label className="text-base">{InvoiceData.amount}</Label>
            </View>
            <View className="w-full flex-row items-center justify-between">
              <Label className="text-base">UI Design</Label>
              <Label className="text-base">$24</Label>
            </View>
            <View className="w-full flex-row items-center justify-between">
              <Label className="text-base">Backend Setup</Label>
              <Label className="text-base">$21</Label>
            </View>
            <View className="w-full flex-row items-center justify-between">
              <Label className="text-base">Qty 3</Label>
              <LinkButton>
                <LinkButton.Label className="text-accent">
                  detail
                </LinkButton.Label>
              </LinkButton>
            </View>
          </View>
          <Separator />
          <View className="w-full flex-row items-center justify-between">
            <Label className="text-base">Discount</Label>
            <Chip className="text-base" variant="secondary">
              12%
            </Chip>
          </View>
          <Separator />
          <View className="w-full flex-row items-center justify-between">
            <Label className="text-base">Total (USD)</Label>
            <Label className="text-base">{InvoiceData.amount}</Label>
          </View>
        </Card.Body>
      </Card>
      <View className="w-full flex-row place-self-end items-center justify-center mt-5 px-1 gap-2">
        <Button className="w-1/2" size="lg">
          Print
        </Button>
        <Button className="w-1/2" size="lg">
          Send Invoice
        </Button>
      </View>
      <View className="w-full flex-row place-self-end items-center justify-center mt-5 px-1 gap-1">
        <LinkButton size="sm">
          <LinkButton.Label className="text-accent">
            Term of services
          </LinkButton.Label>
        </LinkButton>
        <Label>and</Label>
        <LinkButton size="sm">
          <LinkButton.Label className="text-accent">
            Privacy Policy
          </LinkButton.Label>
        </LinkButton>
      </View>
    </View>
  );
}
