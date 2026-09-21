import * as React from 'react';
import { cn } from '@/utils/classes';
import { Popover as BasePopover } from '@base-ui/react/popover';

const Popover = BasePopover.Root;

const PopoverTrigger = ({
  asChild,
  children,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof BasePopover.Trigger> & {
  asChild?: boolean;
  ref?: React.Ref<HTMLButtonElement>;
}) => {
  if (asChild && React.isValidElement(children)) {
    return <BasePopover.Trigger ref={ref} render={children} {...props} />;
  }
  return (
    <BasePopover.Trigger ref={ref} {...props}>
      {children}
    </BasePopover.Trigger>
  );
};
PopoverTrigger.displayName = 'PopoverTrigger';

interface PopoverContentProps extends React.ComponentPropsWithoutRef<typeof BasePopover.Popup> {
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
  onInteractOutside?: () => void;
  ref?: React.Ref<React.ComponentRef<typeof BasePopover.Popup>>;
}

const PopoverContent = ({ className, align = 'center', sideOffset = 4, ref, ...props }: PopoverContentProps) => (
  <BasePopover.Portal>
    <BasePopover.Positioner align={align} sideOffset={sideOffset} className="z-50 outline-none">
      <BasePopover.Popup
        ref={ref}
        className={cn(
          'z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-open:animate-in data-closed:animate-out',
          className
        )}
        {...props}
      />
    </BasePopover.Positioner>
  </BasePopover.Portal>
);
PopoverContent.displayName = 'PopoverContent';

export { Popover, PopoverTrigger, PopoverContent };
