import * as React from 'react';
import { cn } from '@/utils/classes';
import { Switch as BaseSwitch } from '@base-ui/react/switch';

export interface SwitchProps extends React.ComponentPropsWithoutRef<typeof BaseSwitch.Root> {
  onCheckedChange?: (checked: boolean) => void;
  ref?: React.Ref<React.ComponentRef<typeof BaseSwitch.Root>>;
}

const Switch = ({ checked, onCheckedChange, className, ref, ...props }: SwitchProps) => (
  <BaseSwitch.Root
    checked={checked}
    onCheckedChange={(c) => {
      onCheckedChange?.(c);
    }}
    className={cn(
      'peer inline-flex h-[20px] w-[36px] shrink-0 cursor-pointer items-center rounded-full border border-border shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted data-checked:bg-primary data-unchecked:bg-muted',
      className
    )}
    {...props}
    ref={ref}
  >
    <BaseSwitch.Thumb
      className={cn(
        'pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0 data-checked:translate-x-4 data-unchecked:translate-x-0'
      )}
    />
  </BaseSwitch.Root>
);
Switch.displayName = 'Switch';

export default Switch;
