"use client";

import { Breadcrumbs, Button, Dropdown } from "@heroui/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Ellipsis } from "lucide-react";
import { Home } from "@mynaui/icons-react";

function isSkippableSegment(segment: string) {
  const isNumeric = /^\d+$/.test(segment);
  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      segment,
    );

  return isNumeric || isUuid;
}

function formatSegmentLabel(segment: string) {
  return segment
    .replace(/[-_]+/g, " ")
    .replace(/\b\d+\b/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function BreadcrumbsMinor() {
  const pathname = usePathname();
  const rawSegments = pathname.split("/").filter(Boolean);
  const items = rawSegments
    .map((segment, index) => ({
      segment,
      href: `/${rawSegments.slice(0, index + 1).join("/")}`,
      label: formatSegmentLabel(decodeURIComponent(segment)),
    }))
    .filter((item) => !isSkippableSegment(item.segment));

  const isLongPath = items.length > 3;
  const firstItem = items[0];
  const lastItem = items[items.length - 1];
  const middleItems = isLongPath
    ? items.slice(1, -1)
    : items.slice(1, Math.max(items.length - 1, 1));

  return (
    <>
      <div className="hidden sm:block">
        <Breadcrumbs>
          <Breadcrumbs.Item href="/dashboard">
          <Button size="sm" isIconOnly variant="ghost">
            <Home />
          </Button>
          </Breadcrumbs.Item>
          {items.map((item, index) => {
            const isLast = index === items.length - 1;

            if (isLast) {
              return <Breadcrumbs.Item key={item.href}>{item.label}</Breadcrumbs.Item>;
            }

            return (
              <Breadcrumbs.Item key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </Breadcrumbs.Item>
            );
          })}
        </Breadcrumbs>
      </div>

      <div className="sm:hidden">
        <Breadcrumbs>
          <Breadcrumbs.Item href="/dashboard">Home</Breadcrumbs.Item>

          {isLongPath ? (
            <>
              {firstItem ? (
                <Breadcrumbs.Item>
                  <Link href={firstItem.href}>{firstItem.label}</Link>
                </Breadcrumbs.Item>
              ) : null}

              <Breadcrumbs.Item>
                <Dropdown>
                  <Button size="sm" variant="tertiary" isIconOnly>
                    <Ellipsis className="size-4" />
                  </Button>
                  <Dropdown.Popover>
                    <Dropdown.Menu>
                      {middleItems.map((item) => (
                        <Dropdown.Item key={item.href} textValue={item.label}>
                          <Link href={item.href} className="w-full block">
                            {item.label}
                          </Link>
                        </Dropdown.Item>
                      ))}
                    </Dropdown.Menu>
                  </Dropdown.Popover>
                </Dropdown>
              </Breadcrumbs.Item>

              {lastItem ? <Breadcrumbs.Item>{lastItem.label}</Breadcrumbs.Item> : null}
            </>
          ) : (
            items.map((item, index) => {
              const isLast = index === items.length - 1;
              if (isLast) {
                return <Breadcrumbs.Item key={item.href}>{item.label}</Breadcrumbs.Item>;
              }
              return (
                <Breadcrumbs.Item key={item.href}>
                  <Link href={item.href} className="text-wrap">{item.label}</Link>
                </Breadcrumbs.Item>
              );
            })
          )}
        </Breadcrumbs>
      </div>
    </>
  );
}
