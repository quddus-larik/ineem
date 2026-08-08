import type { ReactNode } from "react";
import { Providers } from "../providers";
import { MinimaDashboard } from "@/components/layouts/minimal.layout";
import { Toast } from "@heroui/react";
export default function DashboardLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <Providers>
      <Toast.Provider />
      <MinimaDashboard>{children}</MinimaDashboard>
    </Providers>
  );
}
