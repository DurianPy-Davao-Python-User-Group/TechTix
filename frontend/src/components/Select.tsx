import * as React from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/utils/classes';
import { Select as BaseSelect } from '@base-ui/react/select';

const Select = BaseSelect.Root;
const SelectGroup = BaseSelect.Group;
const SelectValue = BaseSelect.Value;

const SelectTrigger = ({
  className,
  children,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof BaseSelect.Trigger> & {
  ref?: React.Ref<React.ComponentRef<typeof BaseSelect.Trigger>>;
}) => (
  <BaseSelect.Trigger
    ref={ref}
    className={cn(
      'translate-y-0 translate-x-0 flex h-9 w-full items-center justify-between rounded-md border border-border bg-input px-3 py-2 text-sm shadow-xs ring-offset-background hover:bg-accent hover:text-accent-foreground hover:border-border transition-colors placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
      className
    )}
    {...props}
  >
    {children}
    <BaseSelect.Icon className="h-4 w-4 opacity-50 flex items-center justify-center">
      <ChevronDown className="h-4 w-4" />
    </BaseSelect.Icon>
  </BaseSelect.Trigger>
);
SelectTrigger.displayName = 'SelectTrigger';

const SelectContent = ({
  className,
  children,
  sideOffset = 4,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof BaseSelect.Popup> & {
  sideOffset?: number;
  ref?: React.Ref<React.ComponentRef<typeof BaseSelect.Popup>>;
}) => (
  <BaseSelect.Portal>
    <BaseSelect.Positioner sideOffset={sideOffset} className="z-50 outline-none">
      <BaseSelect.Popup
        ref={ref}
        className={cn(
          'relative z-50 min-w-32 overflow-hidden rounded-md border bg-input text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-open:animate-in data-closed:animate-out p-1',
          className
        )}
        {...props}
      >
        {children}
      </BaseSelect.Popup>
    </BaseSelect.Positioner>
  </BaseSelect.Portal>
);
SelectContent.displayName = 'SelectContent';

const SelectLabel = ({
  className,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof BaseSelect.GroupLabel> & {
  ref?: React.Ref<React.ComponentRef<typeof BaseSelect.GroupLabel>>;
}) => <BaseSelect.GroupLabel ref={ref} className={cn('px-2 py-1.5 text-sm font-semibold', className)} {...props} />;
SelectLabel.displayName = 'SelectLabel';

const SelectItem = ({
  className,
  children,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof BaseSelect.Item> & {
  ref?: React.Ref<React.ComponentRef<typeof BaseSelect.Item>>;
}) => (
  <BaseSelect.Item
    ref={ref}
    className={cn(
      'relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-hidden focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className
    )}
    {...props}
  >
    <BaseSelect.ItemText>{children}</BaseSelect.ItemText>
    <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
      <BaseSelect.ItemIndicator>
        <Check className="h-4 w-4" />
      </BaseSelect.ItemIndicator>
    </span>
  </BaseSelect.Item>
);
SelectItem.displayName = 'SelectItem';

const SelectSeparator = ({
  className,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof BaseSelect.Separator> & {
  ref?: React.Ref<React.ComponentRef<typeof BaseSelect.Separator>>;
}) => <BaseSelect.Separator ref={ref} className={cn('-mx-1 my-1 h-px bg-muted', className)} {...props} />;
SelectSeparator.displayName = 'SelectSeparator';

export { Select, SelectGroup, SelectValue, SelectTrigger, SelectContent, SelectLabel, SelectItem, SelectSeparator };
