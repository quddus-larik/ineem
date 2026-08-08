import {
  Button,
  Checkbox,
  Label,
  Link,
  Separator,
  Tooltip,
  Typography,
} from "@heroui/react";
import { Github, Google, X } from "@thesvg/react";

import {
  handleGithubSignIn,
  handleGoogleSignIn,
  handleXSignIn,
} from "@/components/pages/auth/sigin.oauth";

const Socials = [
  {
    name: "Google",
    Icon: Google,
    handler: handleGoogleSignIn,
    isPopular: true,
  },
  {
    name: "X / Twitter",
    Icon: X,
    handler: handleXSignIn,
  },
  {
    name: "Github",
    Icon: Github,
    handler: handleGithubSignIn,
    isPopular: false,
  },
];

export function SocialAccounts({
  type = "login",
  onCheckedChange,
  checked,
}: {
  type?: "login" | "signup";
  onCheckedChange?: (checked: boolean) => void;
  checked?: boolean;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-1 items-center w-full">
        <Separator className="flex-1" />
        <span className="text-sm">OR</span>
        <Separator className="flex-1" />
      </div>
      <div className="flex flex-col gap-1">
        <Label>Sign in with social accounts</Label>
        <div className="flex gap-2 w-full">
          {Socials.map((itm) => (
            <Tooltip key={itm.name}>
              <Button
                size="lg"
                variant={"outline"}
                onClick={itm.handler}
                className="w-full rounded-lg"
              >
                <itm.Icon />
              </Button>
              <Tooltip.Content showArrow>
                <Tooltip.Arrow />
                <p>{itm.name}</p>
              </Tooltip.Content>
            </Tooltip>
          ))}
        </div>
      </div>
      <div>
        {type == "login" ? (
          <Checkbox name="basic-terms">
            <Checkbox.Content
              className={"flex flex-row justify-center gap-2 items-center"}
            >
              <Checkbox.Control>
                <Checkbox.Indicator />
              </Checkbox.Control>
              <span className="text-sm cursor-pointer">
                Remember for 30 days
              </span>
            </Checkbox.Content>
          </Checkbox>
        ) : (
          <Checkbox
            name="terms"
            isSelected={checked}
            onChange={onCheckedChange}
          >
            <Checkbox.Content
              className={"flex flex-row justify-center gap-2 items-center"}
            >
              <Checkbox.Control>
                <Checkbox.Indicator />
              </Checkbox.Control>
              <span className="text-sm cursor-pointer">
                Accept <Link href="/terms">terms</Link> and{" "}
                <Link href="/conditions">conditions</Link>
              </span>
            </Checkbox.Content>
          </Checkbox>
        )}
      </div>
    </div>
  );
}
