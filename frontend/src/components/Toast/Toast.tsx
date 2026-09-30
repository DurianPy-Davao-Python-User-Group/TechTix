import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';
import { cn } from '@/utils/classes';

const ToastProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => <>{children}</>;

const ToastViewport = ({ className, ref, ...props }: React.HTMLAttributes<HTMLDivElement> & { ref?: React.Ref<HTMLDivElement> }) => (
  <div
    ref={ref}
    className={cn('fixed top-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:flex-col md:max-w-[420px]', className)}
    {...props}
  />
);
ToastViewport.displayName = 'ToastViewport';

const toastVariants = cva(
  'group pointer-events-auto relative flex w-full items-center justify-between space-x-2 overflow-hidden rounded-md border p-4 pr-6 shadow-lg transition-all data-open:animate-in data-closed:animate-out data-closed:fade-out-80 data-closed:slide-out-to-right-full data-open:slide-in-from-top-full data-open:sm:slide-in-from-bottom-full',
  {
    variants: {
      variant: {
        default: 'border-[#072E4714] bg-white/95 text-pycon-dark-blue backdrop-blur-md shadow-[0px_8px_30px_0px_rgba(7,46,71,0.12)]',
        destructive: 'destructive group border-destructive/20 bg-red-50 text-destructive shadow-[0px_8px_30px_0px_rgba(239,68,68,0.15)]'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
);

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof toastVariants> {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  duration?: number;
  ref?: React.Ref<HTMLDivElement>;
}

const Toast = ({ className, variant, open = true, ref, ...props }: ToastProps) => {
  return (
    <div ref={ref} data-open={open ? '' : undefined} data-closed={!open ? '' : undefined} className={cn(toastVariants({ variant }), className)} {...props} />
  );
};
Toast.displayName = 'Toast';

const ToastAction = ({ className, ref, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { ref?: React.Ref<HTMLButtonElement> }) => (
  <button
    ref={ref}
    className={cn(
      'inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium transition-colors hover:bg-secondary focus:outline-none focus:ring-1 focus:ring-ring disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive',
      className
    )}
    {...props}
  />
);
ToastAction.displayName = 'ToastAction';

const ToastClose = ({ className, ref, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { ref?: React.Ref<HTMLButtonElement> }) => (
  <button
    ref={ref}
    className={cn(
      'absolute right-2.5 top-2.5 rounded-lg p-1 text-pycon-dark-blue/40 opacity-70 transition-opacity hover:opacity-100 hover:text-pycon-dark-blue focus:opacity-100 focus:outline-none focus:ring-1 group-hover:opacity-100 group-[.destructive]:text-red-400 group-[.destructive]:hover:text-red-600',
      className
    )}
    {...props}
  >
    <X className="h-4 w-4" />
  </button>
);
ToastClose.displayName = 'ToastClose';

const ToastTitle = ({ className, ref, ...props }: React.HTMLAttributes<HTMLHeadingElement> & { ref?: React.Ref<HTMLHeadingElement> }) => (
  <h5 ref={ref} className={cn('text-sm font-semibold [&+div]:text-xs', className)} {...props} />
);
ToastTitle.displayName = 'ToastTitle';

const ToastDescription = ({ className, ref, ...props }: React.HTMLAttributes<HTMLParagraphElement> & { ref?: React.Ref<HTMLParagraphElement> }) => (
  <p ref={ref} className={cn('text-sm opacity-90', className)} {...props} />
);
ToastDescription.displayName = 'ToastDescription';

type ToastActionElement = React.ReactElement<typeof ToastAction>;

export { type ToastActionElement, ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription, ToastClose, ToastAction };
