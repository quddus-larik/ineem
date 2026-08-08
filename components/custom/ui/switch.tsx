"use client";

import { type CSSProperties, type ReactNode, useCallback, useState } from "react";

type SwitchSize = "sm" | "md" | "lg";
type SwitchColor = "primary" | "danger" | "warning" | "success" | "secondary";

export interface SwitchProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  size?: SwitchSize;
  color?: SwitchColor;
  startIcon?: ReactNode;
  className?: string;
  "aria-label"?: string;
}

const TOGGLE_STYLES = `
.toggle-track-fill {
  position: absolute;
  inset: 0;
  border-radius: 9999px;
  background: var(--switch-color, var(--primary, #2979ff));
  transform: scaleX(0);
  transform-origin: left center;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.toggle-track-fill.is-on {
  transform: scaleX(1);
}

.toggle-thumb {
  position: absolute;
  top: 50%;
  left: var(--switch-pad, 7px);
  width: var(--switch-thumb, 46px);
  height: var(--switch-thumb, 46px);
  border-radius: 9999px;
  background: #fff;
  transform: translateY(-50%) translateX(0);
  transition:
    transform 0.42s cubic-bezier(0.34, 1.4, 0.64, 1),
    width 0.22s cubic-bezier(0.4, 0, 0.2, 1),
    border-radius 0.22s ease;
  will-change: transform, width, border-radius;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.18);
  z-index: 2;
}
.toggle-thumb.pressing-off {
  width: calc(var(--switch-thumb, 46px) + var(--switch-stretch, 12px));
  border-radius: 30px;
}
.toggle-thumb.is-on {
  transform: translateY(-50%) translateX(var(--switch-move, 50px));
  width: var(--switch-thumb, 46px);
  border-radius: 9999px;
}
.toggle-thumb.is-on.pressing-on {
  transform: translateY(-50%) translateX(var(--switch-move-press, 38px));
  width: calc(var(--switch-thumb, 46px) + var(--switch-stretch, 12px));
  border-radius: 30px;
}

.toggle-ring {
  position: absolute;
  inset: 0;
  border-radius: 9999px;
  border: 2px solid rgba(0, 0, 0, 0.06);
  pointer-events: none;
  z-index: 3;
  transition: border-color 0.4s ease;
}
.toggle-ring.is-on {
  border-color: color-mix(
    in srgb,
    var(--switch-color, var(--primary, #2979ff)) 30%,
    transparent
  );
}
`;

let stylesInjected = false;
function injectStyles() {
  if (stylesInjected || typeof document === "undefined") return;
  const tag = document.createElement("style");
  tag.textContent = TOGGLE_STYLES;
  document.head.appendChild(tag);
  stylesInjected = true;
}

const SIZE_CONFIG: Record<
  SwitchSize,
  {
    width: number;
    height: number;
    thumb: number;
    pad: number;
    move: number;
    movePress: number;
    stretch: number;
    icon: number;
  }
> = {
  sm: { width: 40, height: 24, thumb: 16, pad: 4, move: 16, movePress: 12, stretch: 5, icon: 12 },
  md: { width: 48, height: 28, thumb: 20, pad: 4, move: 20, movePress: 15, stretch: 6, icon: 16 },
  lg: { width: 56, height: 32, thumb: 24, pad: 4, move: 24, movePress: 18, stretch: 7, icon: 16 },
};

const COLOR_VARS: Record<SwitchColor, string> = {
  primary: "var(--accent)",
  danger: "var(--danger)",
  warning: "var(--warning)",
  success: "var(--success)",
  secondary: "var(--secondary)",
};

export function Switch({
  checked,
  defaultChecked = false,
  onChange,
  disabled = false,
  size = "md",
  color = "primary",
  startIcon,
  className = "",
  "aria-label": ariaLabel = "Toggle switch",
}: SwitchProps) {
  injectStyles();

  const isControlled = checked !== undefined;
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const isOn = isControlled ? checked : internalChecked;
  const [pressing, setPressing] = useState(false);
  const sizeConfig = SIZE_CONFIG[size];

  const handleChange = useCallback(() => {
    if (disabled) return;
    const next = !isOn;
    if (!isControlled) setInternalChecked(next);
    onChange?.(next);
  }, [disabled, isOn, isControlled, onChange]);

  const handlePressStart = useCallback(() => {
    if (!disabled) setPressing(true);
  }, [disabled]);

  const handlePressEnd = useCallback(() => setPressing(false), []);

  const thumbClass = [
    "toggle-thumb",
    isOn ? "is-on" : "",
    pressing && !isOn ? "pressing-off" : "",
    pressing && isOn ? "pressing-on" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <label
        className={[
          "relative flex items-center justify-center text-accent",
          disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer",
        ].join(" ")}
        aria-label={ariaLabel}
        onMouseDown={handlePressStart}
        onMouseUp={handlePressEnd}
        onMouseLeave={handlePressEnd}
        onTouchStart={handlePressStart}
        onTouchEnd={handlePressEnd}
      >
        <input
          type="checkbox"
          className="sr-only"
          checked={isOn}
          disabled={disabled}
          onChange={handleChange}
          aria-checked={isOn}
        />

        <span
          className="relative block overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700"
          style={
            {
              width: `${sizeConfig.width}px`,
              height: `${sizeConfig.height}px`,
              "--switch-color": COLOR_VARS[color],
              "--switch-thumb": `${sizeConfig.thumb}px`,
              "--switch-pad": `${sizeConfig.pad}px`,
              "--switch-move": `${sizeConfig.move}px`,
              "--switch-move-press": `${sizeConfig.movePress}px`,
              "--switch-stretch": `${sizeConfig.stretch}px`,
            } as CSSProperties
          }
        >
          <span className={`toggle-track-fill ${isOn ? "is-on" : ""}`} />
          <span className={thumbClass}>
            {startIcon ? (
              <span
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  color: "var(--switch-color)",
                  width: `${sizeConfig.icon}px`,
                  height: `${sizeConfig.icon}px`,
                  margin: "auto",
                }}
              >
                {startIcon}
              </span>
            ) : null}
          </span>
          <span className={`toggle-ring ${isOn ? "is-on" : ""}`} />
        </span>
      </label>
    </div>
  );
}
