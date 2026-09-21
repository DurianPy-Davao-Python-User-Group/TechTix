import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import Icon from '@/components/Icon';
import { cn } from '@/utils/classes';
import { Dialog as BaseDialog } from '@base-ui/react/dialog';

const SheetContainer = BaseDialog.Root;

const SheetTrigger = ({
  asChild,
  children,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof BaseDialog.Trigger> & {
  asChild?: boolean;
  ref?: React.Ref<HTMLButtonElement>;
}) => {
  if (asChild && React.isValidElement(children)) {
    return <BaseDialog.Trigger ref={ref} render={children} {...props} />;
  }
  return (
    <BaseDialog.Trigger ref={ref} {...props}>
      {children}
    </BaseDialog.Trigger>
  );
};
SheetTrigger.displayName = 'SheetTrigger';

const SheetClose = ({
  asChild,
  children,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof BaseDialog.Close> & {
  asChild?: boolean;
  ref?: React.Ref<HTMLButtonElement>;
}) => {
  if (asChild && React.isValidElement(children)) {
    return <BaseDialog.Close ref={ref} render={children} {...props} />;
  }
  return (
    <BaseDialog.Close ref={ref} {...props}>
      {children}
    </BaseDialog.Close>
  );
};
SheetClose.displayName = 'SheetClose';

const SheetPortal = BaseDialog.Portal;

const SheetOverlay = ({
  className,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof BaseDialog.Backdrop> & {
  ref?: React.Ref<React.ComponentRef<typeof BaseDialog.Backdrop>>;
}) => (
  <BaseDialog.Backdrop
    className={cn(
      'fixed inset-0 z-50 bg-background/80 backdrop-blur-xs data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-open:animate-in data-closed:animate-out',
      className
    )}
    {...props}
    ref={ref}
  />
);
SheetOverlay.displayName = 'SheetOverlay';

const sheetVariants = cva(
  'fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-open:animate-in data-closed:animate-out',
  {
    variants: {
      side: {
        top: 'inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top data-closed:slide-out-to-top data-open:slide-in-from-top',
        bottom:
          'inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom data-closed:slide-out-to-bottom data-open:slide-in-from-bottom',
        left: 'inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left data-closed:slide-out-to-left data-open:slide-in-from-left sm:max-w-sm',
        right:
          'inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right data-closed:slide-out-to-right data-open:slide-in-from-right sm:max-w-sm'
      }
    },
    defaultVariants: {
      side: 'right'
    }
  }
);

interface SheetContentProps extends React.ComponentPropsWithoutRef<typeof BaseDialog.Popup>, VariantProps<typeof sheetVariants> {
  closeIconClassName?: string;
  ref?: React.Ref<React.ComponentRef<typeof BaseDialog.Popup>>;
}

const SheetContent = ({ side = 'left', className, closeIconClassName, children, ref, ...props }: SheetContentProps) => (
  <SheetPortal>
    <SheetOverlay />
    <BaseDialog.Popup ref={ref} className={cn(sheetVariants({ side }), className)} {...props}>
      {children}
      <BaseDialog.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary data-open:bg-secondary">
        <Icon name="X" className={cn('w-4 h-4', closeIconClassName)} />
        <span className="sr-only">Close</span>
      </BaseDialog.Close>
    </BaseDialog.Popup>
  </SheetPortal>
);
SheetContent.displayName = 'SheetContent';

const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col space-y-2 text-center sm:text-left', className)} {...props} />
);
SheetHeader.displayName = 'SheetHeader';

const SheetFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)} {...props} />
);
SheetFooter.displayName = 'SheetFooter';

const SheetTitle = ({
  className,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof BaseDialog.Title> & {
  ref?: React.Ref<React.ComponentRef<typeof BaseDialog.Title>>;
}) => <BaseDialog.Title ref={ref} className={cn('text-lg font-semibold text-foreground', className)} {...props} />;
SheetTitle.displayName = 'SheetTitle';

const SheetDescription = ({
  className,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof BaseDialog.Description> & {
  ref?: React.Ref<React.ComponentRef<typeof BaseDialog.Description>>;
}) => <BaseDialog.Description ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />;
SheetDescription.displayName = 'SheetDescription';

export { SheetContainer, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription };

interface SheetProps extends React.ComponentPropsWithoutRef<typeof BaseDialog.Popup> {
  side?: 'left' | 'right' | 'top' | 'bottom';
  closeIconClassName?: string;
  trigger?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  description?: React.ReactNode;
  sheetClose?: React.ReactNode;
  defaultOpen?: boolean;
  visible?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const Sheet = ({
  side = 'left',
  trigger,
  header,
  description,
  footer,
  sheetClose,
  className,
  closeIconClassName,
  children,
  defaultOpen = false,
  visible = false,
  onOpenChange,
  ...props
}: SheetProps) => {
  return (
    <SheetContainer defaultOpen={defaultOpen} open={visible} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side={side} closeIconClassName={closeIconClassName} className={cn('h-max-screen overflow-y-auto', className)} {...props}>
        {(header || description) && (
          <SheetHeader>
            {header && <SheetTitle>{header}</SheetTitle>}
            {description && <SheetDescription>{description}</SheetDescription>}
          </SheetHeader>
        )}
        {children}
        {footer && <SheetFooter>{footer}</SheetFooter>}
      </SheetContent>
    </SheetContainer>
  );
};

export default Sheet;
