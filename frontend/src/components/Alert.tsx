import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/classes';
import Icon, { IconName } from './Icon';

const alertVariants = cva(
  'relative w-full rounded-2xl border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-5 [&>svg]:translate-y-0.5 [&>svg]:text-current',
  {
    variants: {
      variant: {
        default: 'bg-white/90 backdrop-blur-xs text-pycon-dark-blue border-[#072E4714] shadow-xs',
        destructive: 'text-destructive bg-red-50/90 border-destructive/20 [&>svg]:text-current *:data-[slot=alert-description]:text-destructive/90'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
);

function AlertContainer({ className, variant, ...props }: React.ComponentProps<'div'> & VariantProps<typeof alertVariants>) {
  return <div data-slot="alert" role="alert" className={cn(alertVariants({ variant }), className)} {...props} />;
}

function AlertTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="alert-title" className={cn('col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight', className)} {...props} />;
}

function AlertDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-description"
      className={cn('text-muted-foreground col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed', className)}
      {...props}
    />
  );
}

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive';
  title?: string;
  description?: string;
  icon?: IconName;
  iconClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  closable?: boolean;
  ref?: React.RefObject<HTMLDivElement | null>;
  onClose?: () => void;
}

const Alert = ({
  ref,
  title,
  description,
  icon = 'Info',
  className,
  variant = 'default',
  closable = false,
  children,
  onClose,
  iconClassName,
  titleClassName,
  descriptionClassName
}: AlertProps) => {
  const alertRef = React.useRef<HTMLDivElement>(null);
  const r = ref ?? alertRef;

  const handleDelete = () => {
    r.current?.remove();
  };

  return (
    <AlertContainer variant={variant} className={cn('space-x-2', className)} ref={r}>
      <Icon name={icon} className={cn('h-4 w-4 text-pycon-teal', iconClassName)} />
      <AlertTitle className={cn('flex justify-between font-bold text-pycon-dark-blue font-inter', titleClassName)}>
        {title}
        {closable && (
          <Icon
            name="X"
            onClick={onClose ?? handleDelete}
            // absolute right-0 top-0
            className="size-6 rounded-md p-1 text-foreground/50 opacity-70 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-hidden focus:ring-1 group-hover:opacity-100 cursor-pointer"
          />
        )}
      </AlertTitle>
      {description && <AlertDescription className={cn('text-pycon-dark-blue/80 font-inter', descriptionClassName)}>{description}</AlertDescription>}
      {children}
    </AlertContainer>
  );
};

export default Alert;
export { Alert, AlertTitle, AlertDescription };
