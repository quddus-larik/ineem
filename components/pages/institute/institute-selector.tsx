import { useEffect } from "react";
import {
  Select,
  Label,
  ListBox,
  Avatar,
  Separator,
  Description,
} from "@heroui/react";
import { Plus } from "lucide-react";
import { CaretUpDownIcon } from "@phosphor-icons/react";
import { useRouter, usePathname } from "next/navigation";

export function InstituteSelector({ type }: { type?: "sm" | string }) {



  return (
    <Select
      className={type == "sm" ? "w-full" : "w-52"}
      placeholder="Select institute"
      value={selected}
      onChange={handleSelect}
    >
      <Select.Trigger>
        <Select.Value className={"flex items-center gap-2"} />
        <Select.Indicator className="size-4">
          <CaretUpDownIcon />
        </Select.Indicator>
      </Select.Trigger>
      <Select.Popover className="rounded-xl">
        <ListBox>
          <Separator />
          <ListBox.Item key="create">
            <Avatar variant="soft" color="success" size="sm">
              <Avatar.Fallback>
                <Plus />
              </Avatar.Fallback>
            </Avatar>
            <div className="flex flex-col">
              <Label>Create</Label>
              <Description>New institute</Description>
            </div>
            <ListBox.ItemIndicator />
          </ListBox.Item>
        </ListBox>
      </Select.Popover>
    </Select>
  );
}
