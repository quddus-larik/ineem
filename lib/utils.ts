import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function turnSlug(text: string): string {
  const slug = text.trim().toLowerCase().replaceAll(" ", "-");
  const random4 = Math.floor(1000 + Math.random() * 9000);
  return `${slug}-${random4}`;
}

export async function getRelativeDates(isoStr) {
  const base = new Date(isoStr);

  const formal = (d) => {
    const day = d.getUTCDate().toString().padStart(2, "0");
    const month = d.toLocaleString("en-US", {
      month: "short",
      timeZone: "UTC",
    });
    const year = d.getUTCFullYear();
    return `${day}, ${month}, ${year}`;
  };

  const addDays = (d, days) => {
    const nd = new Date(d);
    nd.setUTCDate(nd.getUTCDate() + days);
    return nd;
  };

  return {
    original: formal(base),
    yesterday: formal(addDays(base, -1)),
    today: formal(base),
    tomorrow: formal(addDays(base, 1)),
    lastWeek: formal(addDays(base, -7)),
    nextWeek: formal(addDays(base, 7)),
    lastMonthApprox: formal(addDays(base, -30)),
    nextMonthApprox: formal(addDays(base, 30)),
  };
}