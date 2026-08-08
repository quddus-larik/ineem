import { notifications } from "@/config/notifications";
import {
  Button,
  Description,
  Drawer,
  Header,
  Kbd,
  Label,
  Separator,
  ListBox,
  Avatar,
  Surface,
  ButtonGroup,
} from "@heroui/react";
import { Bell } from "@mynaui/icons-react";
import { CaretRightIcon, WarningCircleIcon } from "@phosphor-icons/react";

export function NotificationButton() {
  return (
    <Drawer>
      <Button variant="tertiary" isIconOnly size="lg">
        <Bell />
      </Button>
      <Drawer.Backdrop>
        <Drawer.Content placement="right">
          <Drawer.Dialog>
            <Drawer.Header>
              <Drawer.Heading>Notifications</Drawer.Heading>
            </Drawer.Header>
            <Drawer.Body className="px-0">
              <ButtonGroup orientation="vertical" fullWidth variant="tertiary">
                {notifications.map((itm, idx) => (
                  <Button fullWidth className="py-8 group">
                    <div className="flex items-center justify-between w-full transition-all duration-200 ease-in-out group-active:scale-95 group-active:opacity-80">
                      <div className="flex flex-row items-center gap-3 flex-1">
                        <itm.Icon className="size-6" />
                        <div className="flex flex-col items-start">
                          <span className="flex flex-row gap-1 items-center">
                            <Label>{itm.title}</Label>
                            {itm.seen && (
                              <div className="bg-accent h-2 w-2 rounded-full" />
                            )}
                          </span>
                          <Description className="text-left line-clamp-1">
                            {itm.description}
                          </Description>
                        </div>
                      </div>
                      <CaretRightIcon />
                    </div>
                  </Button>
                ))}
              </ButtonGroup>
            </Drawer.Body>
            <Drawer.Footer>
              <Button slot="close" variant="secondary">
                Cancel
              </Button>
              <Button slot="close">Confirm</Button>
            </Drawer.Footer>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </Drawer>
  );
}
