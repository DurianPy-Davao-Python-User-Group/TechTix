import * as React from 'react';
import { cn } from '@/utils/classes';
import { Separator as BaseSeparator } from '@base-ui/react/separator';

const Separator = ({
  className,
  orientation = 'horizontal',
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof BaseSeparator> & {
  ref?: React.Ref<React.ComponentRef<typeof BaseSeparator>>;
}) => (
  <BaseSeparator
    ref={ref}
    orientation={orientation}
    className={cn('shrink-0 bg-border', orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px', className)}
    {...props}
  />
);
Separator.displayName = 'Separator';

export default Separator;
