import {Button, Label, Separator, Surface} from "@heroui/react";

export function EmailSidebar() {

    return(
        <Surface variant={"default"} className={"h-full w-44 rounded-2xl flex p-4 flex-col gap-2 *:rounded-xl *:w-full *:justify-start"}>
            <Button size={"sm"} variant={"outline"}>Inbox</Button>
            <Button size={"sm"} variant={"outline"}>Started</Button>
            <Button size={"sm"} variant={"outline"}>Sent</Button>
            <Button size={"sm"} variant={"outline"}>Snoozed</Button>
            <Button size={"sm"} variant={"outline"}>Archived</Button>
            <div className={"my-1"}>
                <Label>Filters</Label>
                <Separator />
            </div>
            <Button size={"sm"} variant={"outline"}>Promotions</Button>
            <Button size={"sm"} variant={"outline"}>Spam</Button>
            <div className={"my-1 px-1"}>
                <Label>Labels</Label>
                <Separator />
            </div>
            <Button size={"sm"} variant={"outline"}>Important</Button>
            <Button size={"sm"} variant={"outline"}>VIP</Button>
            <Button size={"sm"} variant={"outline"}>Design</Button>
            <Button size={"sm"} variant={"outline"}>Offices</Button>
        </Surface>
    )
}