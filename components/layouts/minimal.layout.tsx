"use client";

import {usePathname} from "next/navigation";
import {Button, ButtonGroup, Tooltip} from "@heroui/react";
import {Calendar, CalendarSolid, Layout, Search} from "@mynaui/icons-react";
import Link from "next/link";
import {useRouter} from "next/navigation"
import type {ReactNode} from "react";
import {NotificationButton} from "../custom/notification.minor";
import {ThemeSwitch} from "../custom/switch.theme";
import {InstituteSelector} from "../pages/institute/institute-selector";
import {MobileSidebar} from "../pages/main/mobile-sidebar";
import {getMenuItems} from "@/config/data";
import {FooterSidebar} from "../custom/footer-sidebar";
import {AvaterProfile} from "../custom/profile.minor";
import {BreadcrumbsMinor} from "../custom/breadcrumbs.minor";
import SettingDrawerButton from "../custom/setting-drawer.minor";
import {FabButton} from "../custom/fab-button";
import {EmailSidebar} from "@/components/custom/email-sidebar";

interface LUIProps {
    children: ReactNode;
}

export function MinimaDashboard({children}: LUIProps) {

    const pathname: string = usePathname();
    const router = useRouter();

    const icons = getMenuItems("/dashboard");

    return (
      <div className="w-full min-h-screen flex bg-background-secondary dark:bg-background-inverse/2">
        <FabButton className="bottom-5 right-5 z-10 p-6 rounded-2xl fixed" />
        <aside className="hidden lg:flex lg:w-20 lg:fixed lg:h-screen py-8 flex-col items-center justify-between">
          <Link href="/dashboard">
            <Layout
              className={`text-background-inverse cursor-pointer ${pathname === "/dashboard" ? "text-background-inverse" : "text-muted"}`}
            />
          </Link>
          <nav className="flex flex-col gap-6 w-full">
            {icons.map((Icon, i) => (
              <Tooltip delay={0} key={i}>
                <Tooltip.Trigger>
                  <Link href={Icon.url}>
                    <button
                      className="group relative w-full flex items-center justify-center py-3 cursor-pointer"
                      // disabled={Icon.url == "/institute"}
                    >
                      <div
                        className={`absolute left-0 h-full ${
                          pathname.includes(Icon.url) ? "w-1" : "w-[2px]"
                        } bg-background-inverse ${
                          pathname.includes(Icon.url)
                            ? "opacity-100"
                            : "opacity-0"
                        } group-hover:opacity-100 transition-all rounded-r-lg`}
                      />
                      <Icon.icon
                        className={
                          (pathname.includes(Icon.url) &&
                          pathname !== "/institute"
                            ? "text-background-inverse"
                            : "text-muted") + " transition-all"
                        }
                      />
                    </button>
                  </Link>
                </Tooltip.Trigger>
                <Tooltip.Content placement="right">
                  {Icon.title}
                </Tooltip.Content>
              </Tooltip>
            ))}
          </nav>

          <FooterSidebar />
        </aside>

        <main className="flex flex-1 min-w-0 flex-col min-h-[calc(100vh-1.5rem)] p-5 bg-background m-1 lg:m-3 rounded-3xl shadow-sm lg:ml-[92px] gap-2">
          <div className="w-full flex justify-between items-center h-10">
            <div className="flex gap-2 items-center justify-start">
              {/*<MobileSidebar />*/}
              <BreadcrumbsMinor />
            </div>
            <Button
              className={"w-auto lg:w-64 rounded-2xl ring-1 ring-muted/30"}
              variant={"secondary"}
            >
              <Search />
              Search Mails
            </Button>
            <div className="items-center justify-between gap-2 hidden lg:flex">
              {/*<InstituteSelector />*/}
              <ButtonGroup>
                <NotificationButton />
                <SettingDrawerButton />
              </ButtonGroup>
              <ThemeSwitch />
              <AvaterProfile />
            </div>
          </div>

          {children}
        </main>
      </div>
    );
}
