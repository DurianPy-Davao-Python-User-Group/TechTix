import * as React from 'react';
import { Collapsible as BaseCollapsible } from '@base-ui/react/collapsible';

const CollapsibleContainer = BaseCollapsible.Root;

const CollapsibleTrigger = ({
  asChild,
  children,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof BaseCollapsible.Trigger> & {
  asChild?: boolean;
  ref?: React.Ref<React.ComponentRef<typeof BaseCollapsible.Trigger>>;
}) => {
  if (asChild && React.isValidElement(children)) {
    return <BaseCollapsible.Trigger ref={ref} render={children} {...props} />;
  }
  return (
    <BaseCollapsible.Trigger ref={ref} {...props}>
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
