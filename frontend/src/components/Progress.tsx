import * as React from 'react';
import { cn } from '@/utils/classes';
import { Progress as BaseProgress } from '@base-ui/react/progress';

const Progress = ({
  className,
  value,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof BaseProgress.Root> & {
  ref?: React.Ref<React.ComponentRef<typeof BaseProgress.Root>>;
}) => (
  <BaseProgress.Root value={value} ref={ref} className={cn('relative h-4 w-full overflow-hidden rounded-full bg-primary/20', className)} {...props}>
    <BaseProgress.Track className="h-full w-full">
      <BaseProgress.Indicator className="h-full bg-primary transition-all duration-300" style={{ width: `${value || 0}%` }} />
    </BaseProgress.Track>
  </BaseProgress.Root>
);
Progress.displayName = 'Progress';

export default Progress;
