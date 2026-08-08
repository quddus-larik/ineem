import { settings } from "@/config/settings";
import {
  Avatar,
  Button,
  ButtonGroup,
  Card,
  Description,
  Drawer,
  Header,
  Kbd,
  ListBox,
  Separator,
  Surface,
  Label,
} from "@heroui/react";
import { CogTwo, Pencil, PlusSquare, Trash, User } from "@mynaui/icons-react";
import { CaretRightIcon } from "@phosphor-icons/react";

export default function SettingDrawerButton() {
  return (
    <Drawer>
      <Button variant="tertiary" size="lg" isIconOnly>
        <CogTwo />
      </Button>
      <Drawer.Backdrop>
        <Drawer.Content placement="right">
          <Drawer.Dialog>
            <Drawer.Header>
              <Drawer.Heading>Settings</Drawer.Heading>
              <Description>
                Configure your setting update and change it.
              </Description>
            </Drawer.Header>
            <Drawer.Body className="px-0">

              {settings.map((itm, idx) => (
                <>
                  <Header>{itm.title}</Header>
                  {itm.menu.length > 0 && (
                    <ButtonGroup
                      orientation="vertical"
                      fullWidth
                      variant="tertiary"
                    >
                      {itm.menu.map((itm, idx) => (
                        <Button key={`${itm.href}-${idx}`} fullWidth className="py-8 group">
                          <div className="flex items-center justify-between w-full transition-all duration-200 ease-in-out group-active:scale-95 group-active:opacity-80">
                            <div className="flex flex-col items-start flex-1">
                              <Label>{itm.title}</Label>
                              <Description className="text-left line-clamp-1">
                                {itm.description}
                              </Description>
                            </div>
                            <CaretRightIcon />
                          </div>
                        </Button>
                      ))}
                    </ButtonGroup>
                  )}
                </>
              ))}
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
