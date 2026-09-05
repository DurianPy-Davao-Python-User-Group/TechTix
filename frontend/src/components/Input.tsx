import * as React from 'react';
import { cn } from '@/utils/classes';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  pyconStyles?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, pyconStyles = false, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        'text-foreground flex h-9 w-full rounded-md border border-border bg-input px-3 py-1 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        pyconStyles &&
        'bg-pycon-dirty-white text-pycon-dark-blue font-inter text-base md:text-lg h-13 md:h-14 px-5 py-3.5 rounded-2xl border-2 border-transparent focus-visible:border-pycon-teal/40 focus-visible:ring-2 focus-visible:ring-pycon-teal/10 placeholder:text-pycon-lavender/60 placeholder:font-normal placeholder:font-inter shadow-xs',
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = 'Input';

export default Input;
