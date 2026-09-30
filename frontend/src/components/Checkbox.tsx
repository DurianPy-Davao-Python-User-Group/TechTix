import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/utils/classes';
import { Checkbox as BaseCheckbox } from '@base-ui/react/checkbox';

export interface CheckboxProps extends React.ComponentPropsWithoutRef<typeof BaseCheckbox.Root> {
  pyconStyles?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  ref?: React.Ref<React.ComponentRef<typeof BaseCheckbox.Root>>;
}

const Checkbox = ({ className, pyconStyles = false, onCheckedChange, ref, ...props }: CheckboxProps) => (
  <BaseCheckbox.Root
    ref={ref}
    onCheckedChange={(checked) => {
      onCheckedChange?.(checked === true);
    }}
    className={cn(
      'peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow-sm focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-checked:bg-primary data-checked:text-primary-foreground',
      pyconStyles && 'data-checked:text-pycon-red data-checked:bg-pycon-orange border-pycon-orange',
      className
    )}
    {...props}
  >
    <BaseCheckbox.Indicator className={cn('flex items-center justify-center text-current')}>
      <Check stroke="currentColor" className="h-4 w-4" />
    </BaseCheckbox.Indicator>
  </BaseCheckbox.Root>
);
Checkbox.displayName = 'Checkbox';

export default Checkbox;
