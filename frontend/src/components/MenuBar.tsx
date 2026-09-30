import * as React from 'react';
import { cn } from '@/utils/classes';
import Icon from './Icon';
import { Menu as BaseMenu } from '@base-ui/react/menu';

const MenubarMenu = BaseMenu.Root;
const MenubarGroup = BaseMenu.Group;
const MenubarPortal = BaseMenu.Portal;
const MenubarSub = BaseMenu.SubmenuRoot;
const MenubarRadioGroup = BaseMenu.RadioGroup;

const Menubar = ({ className, ref, ...props }: React.HTMLAttributes<HTMLDivElement> & { ref?: React.Ref<HTMLDivElement> }) => (
  <div ref={ref} className={cn('flex h-10 items-center space-x-1 rounded-md border bg-background p-1', className)} {...props} />
);
Menubar.displayName = 'Menubar';

const MenubarTrigger = ({
  asChild,
  children,
  className,
  nativeButton,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof BaseMenu.Trigger> & {
  asChild?: boolean;
  ref?: React.Ref<HTMLButtonElement>;
}) => {
  if (asChild && React.isValidElement(children)) {
    const isButton = nativeButton !== undefined ? nativeButton : children.type === 'button';
    return <BaseMenu.Trigger ref={ref} render={children} nativeButton={isButton} {...props} />;
  }
  return (
    <BaseMenu.Trigger
      ref={ref}
      nativeButton={nativeButton}
      className={cn(
        'flex cursor-default select-none items-center rounded-sm px-3 py-1.5 text-sm font-medium outline-hidden focus:bg-accent focus:text-accent-foreground data-open:bg-accent data-open:text-accent-foreground aria-expanded:bg-accent aria-expanded:text-accent-foreground',
        className
      )}
      {...props}
    >
      {children}
    </BaseMenu.Trigger>
  );
};
MenubarTrigger.displayName = 'MenubarTrigger';

const MenubarSubTrigger = ({
  className,
  inset,
  children,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof BaseMenu.SubmenuTrigger> & {
  inset?: boolean;
  ref?: React.Ref<HTMLButtonElement>;
}) => (
  <BaseMenu.SubmenuTrigger
    ref={ref}
    className={cn(
      'flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-hidden focus:bg-accent focus:text-accent-foreground data-open:bg-accent data-open:text-accent-foreground aria-expanded:bg-accent aria-expanded:text-accent-foreground',
      inset && 'pl-8',
      className
    )}
    {...props}
  >
    {children}
    <Icon name="ChevronRight" size={16} className="ml-auto h-4 w-4" />
  </BaseMenu.SubmenuTrigger>
);
MenubarSubTrigger.displayName = 'MenubarSubTrigger';

const MenubarSubContent = ({
  className,
  sideOffset = 8,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof BaseMenu.Popup> & {
  sideOffset?: number;
  ref?: React.Ref<React.ComponentRef<typeof BaseMenu.Popup>>;
}) => (
  <BaseMenu.Positioner sideOffset={sideOffset} className="z-50 outline-none">
    <BaseMenu.Popup
      ref={ref}
      className={cn(
        'min-w-32 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95',
        className
      )}
      {...props}
    />
  </BaseMenu.Positioner>
);
MenubarSubContent.displayName = 'MenubarSubContent';

const MenubarContent = ({
  className,
  align = 'start',
  sideOffset = 8,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof BaseMenu.Popup> & {
  align?: 'start' | 'center' | 'end';
  alignOffset?: number;
  sideOffset?: number;
  ref?: React.Ref<React.ComponentRef<typeof BaseMenu.Popup>>;
}) => (
  <BaseMenu.Portal>
    <BaseMenu.Positioner align={align} sideOffset={sideOffset} className="z-50 outline-none">
      <BaseMenu.Popup
        ref={ref}
        className={cn(
          'min-w-48 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95',
          className
        )}
        {...props}
      />
    </BaseMenu.Positioner>
  </BaseMenu.Portal>
);
MenubarContent.displayName = 'MenubarContent';

const MenubarItem = ({
  className,
  inset,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof BaseMenu.Item> & {
  inset?: boolean;
  ref?: React.Ref<React.ComponentRef<typeof BaseMenu.Item>>;
}) => (
  <BaseMenu.Item
    ref={ref}
    className={cn(
      'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-hidden focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50',
      inset && 'pl-8',
      className
    )}
    {...props}
  />
);
MenubarItem.displayName = 'MenubarItem';

const MenubarCheckboxItem = ({
  className,
  children,
  checked,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof BaseMenu.CheckboxItem> & {
  ref?: React.Ref<React.ComponentRef<typeof BaseMenu.CheckboxItem>>;
}) => (
  <BaseMenu.CheckboxItem
    ref={ref}
    className={cn(
      'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-hidden focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50',
      className
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <BaseMenu.CheckboxItemIndicator>
        <Icon name="Check" size={16} className="h-4 w-4" />
      </BaseMenu.CheckboxItemIndicator>
    </span>
    {children}
  </BaseMenu.CheckboxItem>
);
MenubarCheckboxItem.displayName = 'MenubarCheckboxItem';

const MenubarRadioItem = ({
  className,
  children,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof BaseMenu.RadioItem> & {
  ref?: React.Ref<React.ComponentRef<typeof BaseMenu.RadioItem>>;
}) => (
  <BaseMenu.RadioItem
    ref={ref}
    className={cn(
      'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-hidden focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50',
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <BaseMenu.RadioItemIndicator>
        <Icon name="Circle" size={8} className="h-2 w-2" />
      </BaseMenu.RadioItemIndicator>
    </span>
    {children}
  </BaseMenu.RadioItem>
);
MenubarRadioItem.displayName = 'MenubarRadioItem';

const MenubarLabel = ({
  className,
  inset,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof BaseMenu.GroupLabel> & {
  inset?: boolean;
  ref?: React.Ref<React.ComponentRef<typeof BaseMenu.GroupLabel>>;
}) => <BaseMenu.GroupLabel ref={ref} className={cn('px-2 py-1.5 text-sm font-semibold', inset && 'pl-8', className)} {...props} />;
MenubarLabel.displayName = 'MenubarLabel';

const MenubarSeparator = ({
  className,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof BaseMenu.Separator> & {
  ref?: React.Ref<React.ComponentRef<typeof BaseMenu.Separator>>;
}) => <BaseMenu.Separator ref={ref} className={cn('-mx-1 my-1 h-px bg-muted', className)} {...props} />;
MenubarSeparator.displayName = 'MenubarSeparator';

const MenubarShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => {
  return <span className={cn('ml-auto text-xs tracking-widest text-muted-foreground', className)} {...props} />;
};
MenubarShortcut.displayName = 'MenubarShortcut';

export {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarLabel,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarPortal,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarGroup,
  MenubarSub,
  MenubarShortcut
};
