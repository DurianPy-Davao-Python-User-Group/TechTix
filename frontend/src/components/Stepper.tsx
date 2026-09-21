import * as React from 'react';
import { cn } from '@/utils/classes';
import { Slider as BaseSlider } from '@base-ui/react/slider';

export interface Step {
  id: string;
  title?: string;
  description?: string;
}

interface StepperProps<T extends Step> {
  steps: T[];
  currentStep: T;
  stepsToExclude?: T[];
}

const Stepper = <T extends Step>({ steps, currentStep, stepsToExclude }: StepperProps<T>) => {
  const visibleSteps = steps.filter((step) => step.title && stepsToExclude?.some((excludeStep) => excludeStep.id !== step.id));
  const interval = 100 / (visibleSteps.length - 1);
  const arrayOfValues = visibleSteps.map((_, index) => index * interval);

  if (visibleSteps.length < 2) {
    return <div className="whitespace-pre my-8"> </div>;
  }

  return (
    <div className="my-8">
      <BaseSlider.Root
        className="relative flex w-full touch-none select-none items-center cursor-pointer data-disabled:pointer-events-none"
        value={arrayOfValues}
        max={100}
        step={interval}
      >
        <BaseSlider.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary">
          <BaseSlider.Indicator className="absolute h-full bg-primary px-1" />
        </BaseSlider.Track>
        {visibleSteps.map((step, index) => (
          <BaseSlider.Thumb
            className={cn(
              'flex items-center justify-center h-8 w-8 rounded-full font-subjectivity bg-neutrals-200 text-primary transition-colors disabled:pointer-events-none',
              step.id === currentStep.id && 'bg-primary text-neutral-200'
            )}
            key={step.id}
          >
            {index + 1}
          </BaseSlider.Thumb>
        ))}
      </BaseSlider.Root>
    </div>
  );
};

export default Stepper;
