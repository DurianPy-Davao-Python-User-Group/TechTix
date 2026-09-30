import * as React from 'react';
import { Collapsible as BaseCollapsible } from '@base-ui/react/collapsible';

const CollapsibleContainer = BaseCollapsible.Root;

const CollapsibleTrigger = ({
  asChild,
  children,
  ref,
  nativeButton,
  ...props
}: React.ComponentPropsWithoutRef<typeof BaseCollapsible.Trigger> & {
  asChild?: boolean;
  ref?: React.Ref<React.ComponentRef<typeof BaseCollapsible.Trigger>>;
}) => {
  if (asChild && React.isValidElement(children)) {
    const isButton = nativeButton !== undefined ? nativeButton : children.type === 'button';
    return <BaseCollapsible.Trigger ref={ref} render={children} nativeButton={isButton} {...props} />;
  }
  return (
    <BaseCollapsible.Trigger ref={ref} nativeButton={nativeButton} {...props}>
      {children}
    </BaseCollapsible.Trigger>
  );
};
CollapsibleTrigger.displayName = 'CollapsibleTrigger';

const CollapsibleContent = BaseCollapsible.Panel;

export { CollapsibleContainer, CollapsibleTrigger, CollapsibleContent };

interface CollapsibleProps extends React.ComponentProps<typeof BaseCollapsible.Root> {
  collapsibleTrigger?: React.ReactNode;
}

const Collapsible = ({ open = false, onOpenChange, collapsibleTrigger, children, ...props }: CollapsibleProps) => {
  return (
    <CollapsibleContainer open={open} onOpenChange={onOpenChange} {...props}>
      <CollapsibleTrigger asChild>{collapsibleTrigger}</CollapsibleTrigger>
      <CollapsibleContent>{children}</CollapsibleContent>
    </CollapsibleContainer>
  );
};

export default Collapsible;
