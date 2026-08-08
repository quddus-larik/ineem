import { useEffect } from "react";
import {
  Select,
  Label,
  ListBox,
  Avatar,
  Separator,
  Description,
} from "@heroui/react";
import { useInstituteStore } from "@/stores/institutes.store";
import { Plus } from "lucide-react";
import { CaretUpDownIcon } from "@phosphor-icons/react";
import { useRouter, usePathname } from "next/navigation";

export function InstituteSelector({ type }: { type?: "sm" | string }) {
  const router = useRouter();
  const pathname = usePathname();
  const {
    institutes,
    setSelected,
    fetchInstitutes,
    selectedInstituteSlug,
  } = useInstituteStore();
  const selected = selectedInstituteSlug();

  useEffect(() => {
    void fetchInstitutes();
  }, [fetchInstitutes]);

  const handleSelect = (key: string | number | null) => {
    if (!key || Array.isArray(key)) return;
    const newSlug = String(key);

    // Replace old institute slug with new one in URL
    const segments = pathname.split("/").filter(Boolean);
    const institutesIndex = segments.indexOf("institutes");
    if (institutesIndex !== -1 && segments[institutesIndex + 1]) {
      segments[institutesIndex + 1] = newSlug;
      const newPath = "/" + segments.join("/");
      router.push(newPath);
    }

    setSelected(newSlug);
  };

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
          {institutes.map((itm) => (
            <ListBox.Item
              key={itm.slug}
              id={itm.slug}
              textValue={itm.title}
              className="rounded-xl"
            >
              <Avatar size="sm">
                <Avatar.Fallback>{itm.title[0]?.toUpperCase()}</Avatar.Fallback>
              </Avatar>
              <div className="flex flex-col">
                <Label>{itm.title}</Label>
                <Description>
                  {itm.description?.length > 14
                    ? itm.description?.slice(0, 14) + "..."
                    : itm.description}
                </Description>
              </div>
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
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
