import * as React from 'react';
import { cn } from '@/utils/classes';
import { Tabs as BaseTabs } from '@base-ui/react/tabs';

const Tabs = BaseTabs.Root;

const TabsList = ({
  className,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof BaseTabs.List> & {
  ref?: React.Ref<React.ComponentRef<typeof BaseTabs.List>>;
}) => (
  <BaseTabs.List ref={ref} className={cn('inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground', className)} {...props} />
);
TabsList.displayName = 'TabsList';

const TabsTrigger = ({
  className,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof BaseTabs.Tab> & {
  ref?: React.Ref<React.ComponentRef<typeof BaseTabs.Tab>>;
}) => (
  <BaseTabs.Tab
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-selected:bg-background data-selected:text-foreground data-selected:shadow-sm data-active:bg-background data-active:text-foreground data-active:shadow-sm',
      className
    )}
    {...props}
  />
);
TabsTrigger.displayName = 'TabsTrigger';

const TabsContent = ({
  className,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof BaseTabs.Panel> & {
  ref?: React.Ref<React.ComponentRef<typeof BaseTabs.Panel>>;
}) => (
  <BaseTabs.Panel
    ref={ref}
    className={cn(
      'mt-2 ring-offset-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      className
    )}
    {...props}
  />
);
TabsContent.displayName = 'TabsContent';

export { Tabs, TabsList, TabsTrigger, TabsContent };
