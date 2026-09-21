import * as React from 'react';
import durian from '@/assets/pycon/durian.png';
import { cn } from '@/utils/classes';
import { Slider as BaseSlider } from '@base-ui/react/slider';

const Slider = ({
  className,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof BaseSlider.Root> & {
  ref?: React.Ref<React.ComponentRef<typeof BaseSlider.Root>>;
}) => (
  <BaseSlider.Root
    ref={ref}
    className={cn(
      'relative flex w-full touch-none select-none items-center cursor-pointer data-disabled:pointer-events-none data-disabled:opacity-50',
      className
    )}
    {...props}
  >
    <BaseSlider.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full dark:bg-background-100 bg-pycon-custard-light">
      <BaseSlider.Indicator className="absolute h-full bg-pycon-orange" />
    </BaseSlider.Track>
    <BaseSlider.Thumb className="block relative size-4 rounded-full border border-primary/50 bg-background shadow-sm transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
      <div
        className="absolute -inset-x-1 -inset-y-1 size-6 bg-cover bg-no-repeat bg-center transition-transform hover:scale-110 focus-visible:outline-none disabled:opacity-50"
        style={{
          backgroundImage: `url(${durian})`
        }}
      />
    </BaseSlider.Thumb>
  </BaseSlider.Root>
);
Slider.displayName = 'Slider';

export default Slider;
