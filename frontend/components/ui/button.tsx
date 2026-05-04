import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';
import common from './Button.common.module.css';
import light from './Button.light.module.css';
import dark from './Button.dark.module.css';

// @AI-HINT: This is a standardized, reusable Button component for the MegiLance platform.
// It is built with a per-component CSS module structure for theme-awareness (light/dark).
// It strictly follows the design specifications outlined in the MegiLance Brand Playbook.

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'destructive' | 'ghost' | 'link' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
  // Accept legacy prop silently (theme is handled globally)
  theme?: 'light' | 'dark';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'default',
      asChild = false,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        className={cn(
          common.button,
          common[size],
          common[variant],
          'light:' + light[variant],
          'dark:' + dark[variant],
          disabled && ('light:' + light.disabled, 'dark:' + dark.disabled),
          className
        )}
        ref={ref}
        disabled={disabled}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };