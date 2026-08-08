"use client";

import { handleLogOut } from "@/components/pages/auth/sigin.oauth";
import { AlertDialog, Button, Tooltip } from "@heroui/react";
import { WarningCircleIcon } from "@phosphor-icons/react";
import { CurrencyDollarIcon } from "@phosphor-icons/react/dist/ssr";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function FooterSidebar({ type }: { type?: "sm" | string }) {
  const pathname = usePathname();
  return (
    <div className="w-full flex flex-col items-center justify-between gap-2">
      <Tooltip delay={0}>
        <Link href={"/billing"}>
          <Button
            variant={pathname == "/billing" ? "primary" : "outline"}
            isIconOnly
            size="lg"
          >
            <CurrencyDollarIcon className="text-background-inverse" />
          </Button>
        </Link>
        <Tooltip.Content placement="left" offset={10}>
          <p>Billing</p>
        </Tooltip.Content>
      </Tooltip>

      <AlertDialog>
        <Tooltip delay={0}>
          <Button variant="danger-soft" isIconOnly size="lg">
            <LogOut />
          </Button>
          <Tooltip.Content placement="left" offset={10}>
            <p>Logout</p>
          </Tooltip.Content>
        </Tooltip>
        <AlertDialog.Backdrop>
          <AlertDialog.Container>
            <AlertDialog.Dialog className="sm:max-w-[400px]">
              <AlertDialog.CloseTrigger />
              <AlertDialog.Icon>
                <WarningCircleIcon size={23} />
              </AlertDialog.Icon>
              <AlertDialog.Heading>Are you sure</AlertDialog.Heading>
              <AlertDialog.Body>
                Whold you like to logout from Collaric?
              </AlertDialog.Body>
              <AlertDialog.Footer>
                <Button slot="close" variant="tertiary">
                  Cancel
                </Button>
                <Button slot="close" variant="danger" onClick={() => handleLogOut()}>
                  Logout
                </Button>
              </AlertDialog.Footer>
            </AlertDialog.Dialog>
          </AlertDialog.Container>
        </AlertDialog.Backdrop>
      </AlertDialog>
    </div>
  );
}
