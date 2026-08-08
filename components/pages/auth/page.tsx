"use client";

import { Button, Description, Separator, Tabs } from "@heroui/react";
import { SignUpForm } from "@/components/pages/auth/siginup";
import { LoginForm } from "@/components/pages/auth/login";
import { ArrowLeftIcon } from "@phosphor-icons/react";
import { CollaricIcon } from "@/components/icons/collaric";
import { LlabsicIcon } from "@/components/icons/llabsic";

function AuthComponent() {
    return (
        <Tabs className="w-full">
            <Tabs.ListContainer>
                <Tabs.List aria-label="Authentication options" className="w-full">
                    <Tabs.Tab id="login" className="flex-1 justify-center font-bold">
                        Log In
                        <Tabs.Indicator />
                    </Tabs.Tab>
                    <Tabs.Tab id="signup" className="flex-1 justify-center font-bold">
                        Sign Up
                        <Tabs.Indicator />
                    </Tabs.Tab>
                </Tabs.List>
            </Tabs.ListContainer>

            <Tabs.Panel id="login" className="pt-6">
                <LoginForm />
            </Tabs.Panel>

            <Tabs.Panel id="signup" className="pt-6">
                <SignUpForm />
            </Tabs.Panel>
        </Tabs>
    );
}

export default function AuthPage() {
    return (
        <div className="flex w-full min-h-svh">
            <div className="flex justify-center w-full lg:max-w-md p-3 lg:p-8 bg-background">
                <AuthComponent />
            </div>
            <div className="hidden lg:flex relative flex-1 items-center justify-center bg-accent-soft-hover text-accent-foreground p-8 w-full">
                <div className="flex gap-4 items-center justify-start absolute top-6 left-6">
                    <CollaricIcon className="w-8 h-8" mono="black" />
                    <Separator orientation="vertical" className="bg-default-foreground" />
                    <LlabsicIcon className="w-10 h-10" mono="black" />
                </div>
                <Button variant="primary" className={"absolute top-3 right-3"}>
                    <ArrowLeftIcon />
                    Back
                </Button>
                <div className="flex flex-col absolute bottom-6 left-6 *:text-default-foreground">
                    <h1 className="text-5xl font-stack-sans-notch font-bold">
                        Management become Ease
                    </h1>
                    <h1 className="text-2xl font-stack-sans-notch">
                        for eductional institutes{" "}
                    </h1>
                    <h1 className="text-sm">
                        Students, Teachers, Resources, Reports, Attendance and Management in
                        one platform
                    </h1>
                </div>
                <Description className="absolute bottom-6 right-6">Copyright © 2026 llabsic</Description>
            </div>
        </div>
    );
}
