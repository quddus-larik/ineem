"use client";

import {Button, Tooltip} from "@heroui/react";
import {EditOne, Search, File, Album, User, CogTwo} from "@mynaui/icons-react";
import {handleLoginGithub} from "@/handlers/github.oauth";

const SidebarButtons = [
    {label: "New Chat", Icon: EditOne},
    {label: "Search Chat", Icon: Search},
    {label: "Files", Icon: File},
    {label: "Repositories", Icon: Album},
]

export default function Sidebar() {
    return (
        <div className="flex flex-col gap-2 justify-between p-3 *:flex *:flex-col *:gap-2 h-svh">
            <div>
                {
                    SidebarButtons.map((itm, idx) => (
                        <Tooltip delay={0} key={idx + 1}>
                            <Button size={"lg"} variant={"secondary"} isIconOnly>
                                <itm.Icon/>
                            </Button>
                            <Tooltip.Content placement={"right"} offset={10}>
                                <p>{itm.label}</p>
                            </Tooltip.Content>
                        </Tooltip>
                    ))
                }
            </div>
            <div>
                <Button isIconOnly size="sm"><CogTwo/></Button>
                <Button isIconOnly size="sm" onClick={handleLoginGithub}><User/></Button>
            </div>
        </div>
    );
}
