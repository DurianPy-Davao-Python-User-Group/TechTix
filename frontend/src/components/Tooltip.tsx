import * as React from 'react';
import Icon from '@/components/Icon';
import { cn } from '@/utils/classes';
import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';

const TooltipProvider = BaseTooltip.Provider;
const TooltipContainer = BaseTooltip.Root;

const TooltipTrigger = ({
  asChild,
  children,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof BaseTooltip.Trigger> & {
  asChild?: boolean;
  ref?: React.Ref<HTMLButtonElement>;
}) => {
  if (asChild && React.isValidElement(children)) {
    return <BaseTooltip.Trigger ref={ref} render={children} {...props} />;
  }
  return (
    <BaseTooltip.Trigger ref={ref} {...props}>
      {children}
    </BaseTooltip.Trigger>
  );
};
TooltipTrigger.displayName = 'TooltipTrigger';

const TooltipContent = ({
  className,
  sideOffset = 4,
  side = 'top',
  align = 'center',
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof BaseTooltip.Popup> & {
  sideOffset?: number;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  ref?: React.Ref<React.ComponentRef<typeof BaseTooltip.Popup>>;
}) => (
  <BaseTooltip.Portal>
    <BaseTooltip.Positioner side={side} align={align} sideOffset={sideOffset} className="z-50 outline-none">
      <BaseTooltip.Popup
        ref={ref}
        className={cn(
          'z-50 overflow-hidden rounded-md bg-card text-card-foreground border border-border px-3 py-1.5 text-xs animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-closed:animate-out data-open:animate-in',
          className
        )}
        {...props}
      />
    </BaseTooltip.Positioner>
  </BaseTooltip.Portal>
);
TooltipContent.displayName = 'TooltipContent';

export { TooltipContainer, TooltipTrigger, TooltipContent, TooltipProvider };

interface TooltipProps extends React.ComponentPropsWithoutRef<typeof BaseTooltip.Popup> {
  toolTipContent: React.ReactNode;
  delayDuration?: number;
  skipDelayDuration?: number;
  defaultOpen?: boolean;
  side?: 'top' | 'right' | 'bottom' | 'left';
  children?: React.ReactNode;
}

const Tooltip = ({ children, toolTipContent, delayDuration = 300, defaultOpen = false, side = 'top', ...props }: TooltipProps) => {
  return (
    <TooltipProvider delay={delayDuration}>
      <TooltipContainer defaultOpen={defaultOpen}>
        <TooltipTrigger asChild>
          <div>{children}</div>
        </TooltipTrigger>
        <TooltipContent side={side} {...props} sideOffset={8}>
          {toolTipContent}
        </TooltipContent>
      </TooltipContainer>
    </TooltipProvider>
  );
};

export default Tooltip;

export const InfoToolTip = ({ toolTipContent, ...props }: TooltipProps) => {
  return (
    <Tooltip toolTipContent={toolTipContent} {...props}>
      <Icon name="Info" className="text-primary" />
    </Tooltip>
  );
};
