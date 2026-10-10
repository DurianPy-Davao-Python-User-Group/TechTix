import * as React from 'react';
import { cn } from '@/utils/classes';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: 'default' | 'custard';
  pyconStyles?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, variant = 'default', pyconStyles = false, ...props }, ref) => {
  const variantClass = variant === 'custard' && !pyconStyles ? 'bg-[#feefdb] text-[#312541] placeholder:text-gray-600' : 'bg-input';

  return (
    <textarea
      ref={ref}
      className={cn(
        'flex min-h-[100px] w-full rounded-md border border-border px-3 py-1 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        variantClass,
        pyconStyles &&
          'bg-pycon-dirty-white text-pycon-dark-blue font-inter text-base md:text-lg px-5 py-3.5 rounded-2xl border-2 border-transparent focus-visible:border-pycon-teal/40 focus-visible:ring-2 focus-visible:ring-pycon-teal/10 placeholder:text-pycon-lavender/60 placeholder:font-normal placeholder:font-inter shadow-xs resize-y min-h-[120px]',
        className
      )}
      {...props}
    />
  );
});

Textarea.displayName = 'Textarea';

export { Textarea };
