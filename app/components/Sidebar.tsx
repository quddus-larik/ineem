"use client";

import {Button, Tooltip, Avatar} from "@heroui/react";
import {EditOne, Search, File, Album, CogTwo, ChatMessages, User as UserIcon} from "@mynaui/icons-react";
import type {User} from "@supabase/supabase-js";
import {supabase} from "@/lib/supabase/client";
import {handleLoginGithub} from "@/handlers/github.oauth";
import {useState, useEffect} from "react";

const SidebarButtons = [
    {label: "Chat", Icon: ChatMessages, disabled: false},
    // {label: "Search Chat", Icon: Search},
    // {label: "Files", Icon: File},
    {label: "Repositories", Icon: Album, disabled: true},
]

export default function Sidebar() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        (async () => {
            const {data: {user}, error} = await supabase.auth.getUser();
            if (user !== null) {
                setUser(user);
            }
        })();
    }, []);

    return (
        <div className="flex flex-col gap-2 justify-between p-3 *:flex *:flex-col *:gap-2 h-svh">
            <div>
                {
                    SidebarButtons.map((itm, idx) => (
                        <Tooltip delay={0} key={idx + 1}>
                            <Button size={"lg"} variant={"secondary"} isDisabled={itm.disabled} isIconOnly>
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
                <Tooltip delay={0}>
                    <Button isIconOnly size="lg" variant={"secondary"}><CogTwo/></Button>
                    <Tooltip.Content placement={"right"} offset={10}>
                        <p>Settings</p>
                    </Tooltip.Content>
                </Tooltip>
                <Button isIconOnly size="lg" onClick={handleLoginGithub}>
                    <Avatar>
                        <Avatar.Image src={user?.user_metadata.avatar_url ?? ""}/>
                        <Avatar.Fallback>
                            <UserIcon size={22}/>
                        </Avatar.Fallback>
                    </Avatar>
                </Button>
            </div>
        </div>
    );
}
