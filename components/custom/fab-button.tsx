import { Button, Description, Dropdown, Label } from "@heroui/react";
import { PlusIcon } from "@phosphor-icons/react";
import {
  BookPlusIcon,
  TicketPlusIcon,
  UserPlus2Icon,
  UserStarIcon,
} from "lucide-react";

const MenuContent = [
  {
    title: "Create Student",
    description: "create new student in institute",
    icon: UserPlus2Icon,
    action: () => console.log("Create Student"),
  },
  {
    title: "Create Teacher",
    description: "create new teacher in institute",
    icon: UserStarIcon,
    action: () => console.log("Create Teacher"),
  },
  {
    title: "Create Subject",
    description: "create new subject in institute",
    icon: BookPlusIcon,
    action: () => console.log("Create Subject"),
  },
  {
    title: "Create Invoice",
    description: "create new invoice in institute",
    icon: TicketPlusIcon,
    action: () => console.log("Create Invoice"),
  },
];

export function FabButton({ className }: { className: string }) {
  return (
    <Dropdown>
      <Button isIconOnly className={className}>
        <PlusIcon weight="bold" />
      </Button>
      <Dropdown.Popover className={"mr-6"}>
        <Dropdown.Menu onAction={(key) => console.log(`Selected: ${key}`)}>
          {MenuContent.map((item) => (
            <Dropdown.Item
              key={item.title}
              id={item.title.toLowerCase().replace(/\s+/g, "-")}
              textValue={item.title}
            >
              <div className="flex flex-col gap-1">
                <div className="flex flex-row justify-start items-center gap-2">
                  <item.icon size={18} />
                  <Label>{item.title}</Label>
                </div>
                <Description>{item.description}</Description>
              </div>
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}
