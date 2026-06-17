// @AI-HINT: This is a reusable, theme-aware, and accessible toggle switch component for forms.
"use client";

import React, { useMemo } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

import commonStyles from "./ToggleSwitch.common.module.css";
import lightStyles from "./ToggleSwitch.light.module.css";
import darkStyles from "./ToggleSwitch.dark.module.css";

interface ToggleSwitchProps {
  label: string;
  id: string;
  defaultChecked?: boolean;
  checked?: boolean;
  onChange?: (val: boolean) => void;
  helpText?: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  label,
  id,
  defaultChecked = false,
  checked,
  onChange,
  helpText,
}) => {
  const { resolvedTheme } = useTheme();
  const [internalChecked, setInternalChecked] = React.useState(defaultChecked);

  const isChecked = checked !== undefined ? checked : internalChecked;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.checked;
    if (checked === undefined) {
      setInternalChecked(val);
    }
    onChange?.(val);
  };

  const styles = useMemo(() => {
    const themeStyles = resolvedTheme === "dark" ? darkStyles : lightStyles;
    return { ...commonStyles, ...themeStyles };
  }, [resolvedTheme]);

  return (
    <div className={cn(styles.wrapper)}>
      <div className={cn(styles.toggleWrapper)}>
        <label htmlFor={id} className={cn(styles.label)}>
          {label}
        </label>
        <div
          className={cn(
            styles.switchContainer,
            isChecked ? styles.switchChecked : styles.switchUnchecked,
          )}
        >
          <input
            type="checkbox"
            id={id}
            className={cn(styles.input)}
            checked={isChecked}
            onChange={handleChange}
            role="switch"
            aria-checked={isChecked}
          />
          {/*
            Use a plain div for the slider track so the CSS `transition: all`
            already on `.slider` handles the background change smoothly.
            Framer Motion previously tried to animate `backgroundColor` on top
            of the CSS `background: linear-gradient(...)` which caused them to
            fight each other and produce the visible flicker.
          */}
          <div
            className={cn(styles.slider)}
            style={{
              background: isChecked
                ? "var(--color-primary, #4573df)"
                : undefined,
            }}
          >
            {/*
              `initial={false}` prevents the spring from firing on first mount.
              `layout` is removed — position is already handled by `animate.x`;
              having both caused competing animations.
            */}
            <motion.div
              initial={false}
              transition={{ type: "spring", stiffness: 700, damping: 30 }}
              className={cn(styles.sliderKnob)}
              animate={{ x: isChecked ? 20 : 2 }}
            />
          </div>
        </div>
      </div>
      {helpText && <p className={cn(styles.helpText)}>{helpText}</p>}
    </div>
  );
};

export default ToggleSwitch;
