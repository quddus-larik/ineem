import { Avatar, Button, Drawer, Label, ListBox, Tooltip } from "@heroui/react";
import { DollarSign, LogOut, Sidebar } from "lucide-react";
import Link from "next/link";
import { InstituteSelector } from "../institute/institute-selector";
import { useInstituteStore } from "@/stores/institutes.store";
import { getMenuItems } from "@/config/data";
import { FooterSidebar } from "@/components/custom/footer-sidebar";
import { ThemeSwitch } from "@/components/custom/switch.theme";
import { AvaterProfile } from "@/components/custom/profile.minor";
import { CurrencyDollarIcon } from "@phosphor-icons/react/dist/ssr";

export function MobileSidebar() {
  const { selectedInstituteSlug } = useInstituteStore();
  const selected = selectedInstituteSlug();
  const menuItems = getMenuItems(selected);

  return (
    <Drawer>
      <Button size="sm" isIconOnly className={"lg:hidden"}>
        <Sidebar />
      </Button>
      <Drawer.Backdrop>
        <Drawer.Content placement="left">
          <Drawer.Dialog className="bg-background w-64">
            <Drawer.Header>
              <InstituteSelector type="sm" />
            </Drawer.Header>
            <Drawer.Body>
              <nav className="flex flex-col gap-2 mt-2">
                {menuItems.map((item) => (
                  <Link key={item.title} href={item.url}>
                    <Button
                      fullWidth
                      variant="outline"
                      className="rounded-xl justify-start"
                    >
                      <item.icon /> {item.title}
                    </Button>
                  </Link>
                ))}
              </nav>
            </Drawer.Body>
            <Drawer.Footer className="flex justify-center flex-col">
              <ListBox>
                <ListBox.Item  className="bg-muted/10">
                  <AvaterProfile />
                  <div className="flex flex-col">
                    <Label>AQ</Label>
                  </div>
                </ListBox.Item>
              </ListBox>
              <div className="flex w-full gap-2 px-1">
                <Button variant="tertiary" fullWidth>
                  <CurrencyDollarIcon /> Billing
                </Button>

                <Button variant="danger-soft" fullWidth>
                  <LogOut /> Logout
                </Button>
              </div>
            </Drawer.Footer>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </Drawer>
  );
}
