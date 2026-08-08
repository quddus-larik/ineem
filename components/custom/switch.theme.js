"use client";

import { Button } from "@heroui/react";
import { useTheme } from "next-themes";
import { SunIcon, MoonIcon } from "@phosphor-icons/react"

export function ThemeSwitch() {
    const { theme, setTheme } = useTheme();

    return (
        <Button isIconOnly onClick={() => setTheme(theme === "dark" ? "light" : "dark")} size="lg" variant="tertiary">
            {theme === "dark" ? <SunIcon weight="fill" /> : <MoonIcon weight="fill" /> }
        </Button>
    );
}