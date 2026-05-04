import * as React from 'react';
import { cn } from '@/lib/utils';
import common from './Input.common.module.css';
import light from './Input.light.module.css';
import dark from './Input.dark.module.css';

// @AI-HINT: This is a standardized, reusable Input component for the MegiLance platform.
// It is built with a per-component CSS module structure for theme-awareness (light/dark).
// It strictly follows the design specifications outlined in the MegiLance Brand Playbook.

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          common.input,
          `theme-light:${light.input}`,
          `theme-dark:${dark.input}`,
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
