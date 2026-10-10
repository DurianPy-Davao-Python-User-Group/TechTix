import * as React from 'react';
import durian from '@/assets/pycon/durian.png';
import { cn } from '@/utils/classes';
import * as SliderPrimitive from '@radix-ui/react-slider';

const Slider = React.forwardRef<React.ElementRef<typeof SliderPrimitive.Root>, React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>>(
  ({ className, ...props }, ref) => (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        'relative flex w-full touch-none select-none items-center cursor-pointer data-disabled:pointer-events-none data-disabled:opacity-50',
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-pycon-dirty-white border border-[#072E4714]">
        <SliderPrimitive.Range className="absolute h-full bg-pycon-orange" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="block relative size-4 rounded-full border border-primary/50 bg-background shadow-sm transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
        <div
          className="absolute -inset-x-1.5 -inset-y-1.5 size-7 bg-cover bg-no-repeat bg-center transition-transform hover:scale-110 focus-visible:outline-none disabled:opacity-50"
          style={{
            backgroundImage: `url(${durian})`
          }}
        />
      </SliderPrimitive.Thumb>
    </SliderPrimitive.Root>
  )
);
Slider.displayName = SliderPrimitive.Root.displayName;

export default Slider;
