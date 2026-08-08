import { Avatar, Button, ButtonGroup, Popover } from "@heroui/react";
import { DribbbleLogoIcon, ThreadsLogoIcon } from "@phosphor-icons/react";

export function AvaterProfile() {
  return (
    <Popover>
      <Button isIconOnly>
        <Avatar>
          <Avatar.Fallback className="bg-accent dark:bg-accent text-background">
            AQ
          </Avatar.Fallback>
        </Avatar>
      </Button>
      <Popover.Content className="w-[320px] mt-3" placement="left">
        <Popover.Dialog>
          <Popover.Arrow />
          <Popover.Heading>
            <div className="flex items-center justify-between">
              <div className="flex items-start flex-col">
                <div className="rounded-lg h-12 overflow-hidden">
                  <img
                    className="object-cover object-top w-full"
                    src="https://images.unsplash.com/photo-1549880338-65ddcdfd017b?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max&ixid=eyJhcHBfaWQiOjE0NTg5fQ"
                    alt="Mountain"
                  />
                </div>
                <Avatar size="lg" className="-mt-6 ml-4 ring-2 ring-white">
                  <Avatar.Image
                    alt="Sarah Johnson"
                    src="https://img.heroui.chat/image/avatar?w=400&h=400&u=1"
                  />
                  <Avatar.Fallback>SJ</Avatar.Fallback>
                </Avatar>
                <div className="mt-2">
                  <p className="text-base">Alex John</p>
                  <p className="text-muted text-sm">alex.co@ins.edu</p>
                </div>
              </div>
            </div>
          </Popover.Heading>
          <p className="mt-3 text-sm text-muted">
            Product designer and creative director. Building beautiful
            experiences that matter.
          </p>
          <div className="mt-2 flex justify-end">
            <ButtonGroup variant="tertiary">
              <Button isIconOnly>
                <DribbbleLogoIcon />
              </Button>
              <Button isIconOnly>
                <ThreadsLogoIcon />
              </Button>
            </ButtonGroup>
          </div>
        </Popover.Dialog>
      </Popover.Content>
    </Popover>
  );
}
