import { HeadingProps } from "@/types/main";
import { Chip } from "@heroui/react";

const DEFAULT_DESCRIPTION =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation";

export function TextHeader({
  title = "Lorem",
  description = DEFAULT_DESCRIPTION,
  label = "",
}: HeadingProps) {
  return (
    <div>
      <h1 className="text-xl font-bold flex items-center justify-start gap-2">
        {title}{" "}
        {label.length > 0 && (
          <Chip variant="primary" color="accent">
            {label}
          </Chip>
        )}
      </h1>
      <p className="text-muted line-clamp-2">{description}</p>
    </div>
  );
}
