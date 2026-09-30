import * as React from 'react';
import { VariantProps } from 'class-variance-authority';
import Button, { buttonVariants } from '@/components/Button';
import { cn } from '@/utils/classes';
import { Dialog as BaseDialog } from '@base-ui/react/dialog';

function AlertDialogContainer({ ...props }: React.ComponentProps<typeof BaseDialog.Root>) {
  return <BaseDialog.Root data-slot="alert-dialog" {...props} />;
}
function AlertDialogTrigger({ asChild, children, nativeButton, ...props }: React.ComponentProps<typeof BaseDialog.Trigger> & { asChild?: boolean }) {
  if (asChild && React.isValidElement(children)) {
    const isButton = nativeButton !== undefined ? nativeButton : children.type === 'button';
    return <BaseDialog.Trigger data-slot="alert-dialog-trigger" render={children} nativeButton={isButton} {...props} />;
  }
  return (
    <BaseDialog.Trigger data-slot="alert-dialog-trigger" nativeButton={nativeButton} {...props}>
      {children}
    </BaseDialog.Trigger>
  );
}
function AlertDialogPortal({ ...props }: React.ComponentProps<typeof BaseDialog.Portal>) {
  return <BaseDialog.Portal data-slot="alert-dialog-portal" {...props} />;
}
function AlertDialogOverlay({
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof BaseDialog.Backdrop> & {
  onClose?: () => void;
}) {
  return (
    <BaseDialog.Backdrop
      onClick={onClick}
      data-slot="alert-dialog-overlay"
      className={cn('data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 fixed inset-0 z-50 bg-black/50', className)}
      {...props}
    />
  );
}
function AlertDialogContent({
  className,
  onClose,
  ...props
}: React.ComponentProps<typeof BaseDialog.Popup> & {
  onClose?: () => void;
}) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay onClick={onClose} />
      <BaseDialog.Popup
        data-slot="alert-dialog-content"
        className={cn(
          'bg-background data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg',
          className
        )}
        {...props}
      />
    </AlertDialogPortal>
  );
}
function AlertDialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="alert-dialog-header" className={cn('flex flex-col gap-2 text-center sm:text-left', className)} {...props} />;
}
function AlertDialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="alert-dialog-footer" className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)} {...props} />;
}
function AlertDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof BaseDialog.Title> & {
  header?: React.ReactNode;
}) {
  return <BaseDialog.Title data-slot="alert-dialog-title" className={cn('text-lg font-semibold', className)} {...props} />;
}
function AlertDialogDescription({ className, ...props }: React.ComponentProps<typeof BaseDialog.Description>) {
  return <BaseDialog.Description data-slot="alert-dialog-description" className={cn('text-muted-foreground text-sm', className)} {...props} />;
}
function AlertDialogAction({
  className,
  asChild,
  children,
  nativeButton,
  onCompleteAction,
  ...props
}: React.ComponentProps<typeof BaseDialog.Close> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    onCompleteAction: (e: React.MouseEvent<HTMLButtonElement>) => void;
  }) {
  if (asChild && React.isValidElement(children)) {
    const isButton = nativeButton !== undefined ? nativeButton : children.type === 'button';
    return <BaseDialog.Close className={cn(buttonVariants(), className)} onClick={onCompleteAction} render={children} nativeButton={isButton} {...props} />;
  }
  return (
    <BaseDialog.Close className={cn(buttonVariants(), className)} onClick={onCompleteAction} nativeButton={nativeButton} {...props}>
      {children}
    </BaseDialog.Close>
  );
}
function AlertDialogCancel({
  className,
  asChild,
  children,
  nativeButton,
  onCancelAction,
  ...props
}: React.ComponentProps<typeof BaseDialog.Close> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    onCancelAction: () => void;
  }) {
  if (asChild && React.isValidElement(children)) {
    const isButton = nativeButton !== undefined ? nativeButton : children.type === 'button';
    return (
      <BaseDialog.Close
        className={cn(buttonVariants({ variant: 'outline' }), className)}
        onClick={onCancelAction}
        render={children}
        nativeButton={isButton}
        {...props}
      />
    );
  }
  return (
    <BaseDialog.Close className={cn(buttonVariants({ variant: 'outline' }), className)} onClick={onCancelAction} nativeButton={nativeButton} {...props}>
      {children}
    </BaseDialog.Close>
  );
}

export {
  AlertDialogContainer,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel
};

interface AlertDialogProps extends React.HTMLAttributes<HTMLDivElement> {
  alertModalTitle?: React.ReactNode;
  alertModalDescription?: React.ReactNode;
  trigger?: React.ReactNode;
  visible?: boolean;
  defaultOpen?: boolean;
  cancelText?: string;
  confirmText?: string;
  cancelVariant?: VariantProps<typeof buttonVariants>['variant'];
  confirmVariant?: VariantProps<typeof buttonVariants>['variant'];
  isLoading?: boolean;
  onClose?: () => void;
  onOpenChange?: (open: boolean) => void;
  onCancelAction?: () => void;
  onCompleteAction: () => void;
}

const AlertModal = ({
  alertModalTitle,
  alertModalDescription,
  trigger,
  visible,
  defaultOpen = false,
  cancelText,
  confirmText,
  cancelVariant,
  confirmVariant,
  isLoading,
  onClose,
  onOpenChange,
  onCancelAction,
  onCompleteAction
}: AlertDialogProps) => {
  const noLoading = isLoading === undefined;
  const defaultOnCancelAction = () => onOpenChange && onOpenChange(false);
  const onComplete = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!noLoading) {
      e.preventDefault();
    }
    onCompleteAction();
  };
  return (
    <AlertDialogContainer open={visible} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent onClose={noLoading || isLoading ? undefined : onClose || defaultOnCancelAction}>
        <AlertDialogHeader>
          <AlertDialogTitle>{alertModalTitle}</AlertDialogTitle>
          <AlertDialogDescription>{alertModalDescription}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading} variant={cancelVariant} onCancelAction={onCancelAction || defaultOnCancelAction}>
            {cancelText ? cancelText : 'Cancel'}
          </AlertDialogCancel>
          <AlertDialogAction variant={confirmVariant} onCompleteAction={onComplete} asChild>
            <Button loading={isLoading}>{confirmText ? confirmText : 'Confirm'}</Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialogContainer>
  );
};

export default AlertModal;
