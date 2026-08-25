"use client";

import {Button, Surface} from "@heroui/react";
import {EditOne, Search, File, Album, User, CogTwo } from "@mynaui/icons-react"

export default function Home() {
    return (
        <div className={"flex h-svh bg-background"}>
            <div className={"flex flex-col gap-2 justify-between p-3 *:flex *:flex-col *:gap-2"}>
                <div>
                    <Button isIconOnly size={"sm"}><EditOne/></Button>
                    <Button isIconOnly size={"sm"}><Search/></Button>
                    <Button isIconOnly size={"sm"}><File/></Button>
                    <Button isIconOnly size={"sm"}><Album/></Button>
                </div>
                <div>
                    <Button isIconOnly size={"sm"}><CogTwo /></Button>
                    <Button isIconOnly size={"sm"}><User/></Button>
                </div>
            </div>
            <div className="w-full flex-1 flex flex-col overflow-hidden">
                {/* Chats Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-3xl w-full mx-auto">
                    <div className="flex justify-end">
                        <Surface
                            variant={"tertiary"}
                            className="p-2 rounded-xl max-w-[80%] text-sm leading-relaxed">
                            How do I handle Enter to send and Shift+Enter for newline in a React textarea?
                        </Surface>
                    </div>

                    <div className="flex justify-start">
                        {/* AI Response txt */}
                    </div>
                </div>

                {/* Input Area */}
                <div className="p-4 w-full max-w-3xl mx-auto">
                    <Surface
                        className="flex items-end rounded-2xl border p-2 transition-colors flex flex-col gap-2">
      <textarea
          rows={1}
          placeholder="Message AI..."
          onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  // trigger send logic
              }
          }}
          className="w-full resize-none bg-transparent text-sm  focus:outline-none max-h-48"
      />
                        <Button isIconOnly size={"sm"}>
                            A
                        </Button>
                    </Surface>
                </div>
            </div>
        </div>
    );
}
