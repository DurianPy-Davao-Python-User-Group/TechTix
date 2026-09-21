import * as React from 'react';
import { CircleIcon } from 'lucide-react';
import { cn } from '@/utils/classes';
import { Radio as BaseRadio } from '@base-ui/react/radio';
import { RadioGroup as BaseRadioGroup } from '@base-ui/react/radio-group';

function RadioGroup({ className, ...props }: React.ComponentProps<typeof BaseRadioGroup>) {
  return <BaseRadioGroup data-slot="radio-group" className={cn('grid gap-3', className)} {...props} />;
}

export interface RadioGroupItemProps extends React.ComponentProps<typeof BaseRadio.Root> {
  pyconStyles?: boolean;
  checked?: boolean;
}

function RadioGroupItem({ className, pyconStyles = false, checked, ...props }: RadioGroupItemProps) {
  return (
    <BaseRadio.Root
      data-slot="radio-group-item"
      className={cn(
        'border-input text-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 aspect-square size-4 shrink-0 rounded-full border shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
        pyconStyles && 'bg-pycon-beige!',
        className
      )}
      {...props}
    >
      <BaseRadio.Indicator data-slot="radio-group-indicator" className="relative flex items-center justify-center">
        <CircleIcon stroke="none" className="fill-pycon-orange absolute top-1/2 left-1/2 size-3 -translate-x-1/2 -translate-y-1/2" />
      </BaseRadio.Indicator>
    </BaseRadio.Root>
  );
}

export { RadioGroup, RadioGroupItem };
