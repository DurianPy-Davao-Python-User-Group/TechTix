import { Fragment } from 'react';
import { Check, ChevronLeft } from 'lucide-react';
import { cn } from '@/utils/classes';

export interface Step {
  id: string;
  title?: string;
  description?: string;
}

interface StepperProps<T extends Step> {
  steps: T[];
  currentStep: T;
  stepsToExclude?: T[];
  onStepClick?: (step: T) => void;
  orientation?: 'horizontal' | 'vertical';
  hideTitle?: boolean;
  onBackToLanding?: () => void;
}

const STEP_CIRCLE_SIZE = '1.5rem';

const Stepper = <T extends Step>({
  steps,
  currentStep,
  stepsToExclude,
  onStepClick,
  orientation = 'horizontal',
  hideTitle = false,
  onBackToLanding
}: StepperProps<T>) => {
  const visibleSteps = steps.filter((step) => step.title && !stepsToExclude?.some((excludeStep) => excludeStep.id === step.id));
  const showTitle = orientation === 'vertical' && !hideTitle;
  const currentStepIndex = visibleSteps.indexOf(currentStep);

  // Mobile simplified stepper view
  if (orientation === 'horizontal') {
    const totalSteps = visibleSteps.length || 5;
    const currentStepNumber = Math.max(1, currentStepIndex + 1);
    const progressPercentage = Math.min(100, Math.max(0, (currentStepNumber / totalSteps) * 100));

    return (
      <div className="flex items-center justify-between w-full gap-3">
        {onBackToLanding && (
          <button
            type="button"
            onClick={onBackToLanding}
            className="flex items-center justify-center size-12 -ms-2 rounded-full text-pycon-orange hover:bg-black/5 active:scale-95 transition-all cursor-pointer shrink-0"
            aria-label="Back to landing page"
          >
            <ChevronLeft className="size-10 sm:size-11 stroke-[2.5]" />
          </button>
        )}

        <div className="ms-auto flex items-center gap-3.5 sm:gap-4 rounded-full border border-neutral-200 bg-white px-4 sm:px-5 py-2 shadow-xs shrink-0">
          <span className="text-pycon-orange font-bold text-xs sm:text-sm whitespace-nowrap">
            Step {currentStepNumber} of {totalSteps}
          </span>
          <div className="w-14 sm:w-16 h-2 bg-pycon-orange/30 rounded-full overflow-hidden shrink-0">
            <div className="h-full bg-pycon-orange rounded-full transition-all duration-300 ease-out" style={{ width: `${progressPercentage}%` }} />
          </div>
        </div>
      </div>
    );
  }

  // Desktop vertical stepper view
  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      {visibleSteps.map((step, index) => {
        const isDone = currentStepIndex > index;
        const isCurrent = currentStepIndex === index;
        const connectorBackground = currentStepIndex > index ? 'bg-pycon-orange' : 'bg-pycon-orange/30';

        const isLastStep = index === visibleSteps.length - 1;

        return (
          <Fragment key={`steps.id-${index}`}>
            <div style={{ width: STEP_CIRCLE_SIZE, height: STEP_CIRCLE_SIZE }} className="relative bg-transparent flex items-center justify-center shrink-0">
              {isDone ? (
                <div
                  style={{ width: STEP_CIRCLE_SIZE, height: STEP_CIRCLE_SIZE }}
                  className={cn('select-none rounded-full bg-pycon-teal flex items-center justify-center transition-colors', onStepClick && 'cursor-pointer')}
                  onClick={onStepClick ? () => onStepClick(step) : undefined}
                >
                  <Check className="size-3.5 text-white stroke-[3]" />
                </div>
              ) : (
                <div
                  style={{ width: STEP_CIRCLE_SIZE, height: STEP_CIRCLE_SIZE }}
                  className={cn(
                    'select-none rounded-[6px] rotate-45 transition-colors',
                    isCurrent ? 'bg-pycon-orange' : 'bg-pycon-orange/30',
                    onStepClick && 'cursor-pointer'
                  )}
                  onClick={onStepClick ? () => onStepClick(step) : undefined}
                />
              )}

              {showTitle && (
                <div
                  className={cn(
                    'absolute left-full ms-6 flex items-center whitespace-nowrap text-sm transition-colors',
                    isDone && 'text-pycon-teal font-semibold',
                    isCurrent && 'text-pycon-orange font-bold',
                    !isDone && !isCurrent && 'text-pycon-dark-blue/50 font-medium',
                    onStepClick && 'cursor-pointer'
                  )}
                  onClick={onStepClick ? () => onStepClick(step) : undefined}
                >
                  {step.title}
                </div>
              )}
            </div>

            {!isLastStep && <div className={cn('transition-colors', connectorBackground, 'w-1 flex-1')} />}
          </Fragment>
        );
      })}
    </div>
  );
};

export default Stepper;
