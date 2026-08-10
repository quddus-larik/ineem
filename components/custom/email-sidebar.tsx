import { Button, Label, Separator, Surface } from "@heroui/react";
import {
    Inbox,
    Star,
    Send,
    Clock8,
    Archive,
    Tag,
    DangerOctagon,
    Bookmark,
    ShootingStar ,
    Layout,
    Briefcase,
} from "@mynaui/icons-react";

// Structured data array defining categories, icons, and items
const SIDEBAR_SECTIONS = [
    {
        category: "main",
        items: [
            { label: "Inbox", icon: Inbox },
            { label: "Starred", icon: Star },
            { label: "Sent", icon: Send },
            { label: "Snoozed", icon: Clock8 },
            { label: "Archived", icon: Archive },
        ],
    },
    {
        category: "Filters",
        items: [
            { label: "Promotions", icon: Tag },
            { label: "Spam", icon: DangerOctagon },
        ],
    },
    {
        category: "Labels",
        items: [
            { label: "Important", icon: Bookmark },
            { label: "VIP", icon: ShootingStar  },
            { label: "Design", icon: Layout },
            { label: "Offices", icon: Briefcase },
        ],
    },
];

export function EmailSidebar() {
    return (
        <Surface
            variant={"default"}
            className={
                "h-full w-44 rounded-2xl flex p-4 flex-col gap-2 *:rounded-xl *:w-full *:justify-start"
            }
        >
            {SIDEBAR_SECTIONS.map((section, sectionIndex) => (
                <div key={section.category || sectionIndex} className="flex flex-col gap-2 w-full">
                    {/* Render section headers if it's not the main section */}
                    {section.category !== "main" && (
                        <div className={"my-1 px-1"}>
                            <Label>{section.category}</Label>
                            <Separator />
                        </div>
                    )}

                    {/* Render mapped items for each category */}
                    {section.items.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Button fullWidth className={"flex justify-start"} key={item.label} size={"sm"} variant={"outline"}>
                                <Icon className="w-4 h-4" />
                                {item.label}
                            </Button>
                        );
                    })}
                </div>
            ))}
        </Surface>
    );
}