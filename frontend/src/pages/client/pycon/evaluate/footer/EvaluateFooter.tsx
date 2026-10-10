import Button from '@/components/Button';
import { Event } from '@/model/events';
import { EventFooterPortal } from '../../register/footer/EventFooterPortal';
import { EvaluateStep } from '../steps/EvaluationSteps';
import useEvaluateFooter from './useEvaluateFooter';

interface Props<T extends string> {
  event: Event;
  steps: EvaluateStep[];
  currentStep: EvaluateStep;
  fieldsToCheck: T[];
  setCurrentStep: (step: EvaluateStep) => void;
  submitForm: () => Promise<void>;
}

const EvaluateFooter = <T extends string>({ event, steps, currentStep, fieldsToCheck, setCurrentStep, submitForm }: Props<T>) => {
  const { isValidatingEmail, isFormSubmitting, onNextStep, onPrevStep, onStartEvaluate, onSubmit } = useEvaluateFooter(
    event,
    steps,
    currentStep,
    fieldsToCheck,
    setCurrentStep,
    submitForm
  );

  if (currentStep.id === 'ClaimCertificate') {
    return null;
  }

  const eventDetailsFooter = () => {
    return (
      <EventFooterPortal>
        <Button
          onClick={onStartEvaluate}
          loading={isValidatingEmail}
          icon="ArrowRight"
          iconPlacement="right"
          className="cursor-pointer gap-x-2 bg-[#04B1A4] hover:bg-[#039F93] text-white font-sora font-bold rounded-2xl py-6 sm:px-10 my-8 shadow-xs"
        >
          Evaluate
        </Button>
      </EventFooterPortal>
    );
  };

  const evaluationFooter = () => {
    return (
      <>
        <Button
          onClick={onPrevStep}
          className="cursor-pointer bg-[#F99508] hover:bg-[#E08405] text-white font-sora font-bold rounded-2xl py-6 sm:px-6 shadow-xs transition-colors"
        >
          Back
        </Button>
        <Button
          onClick={onNextStep}
          icon="ArrowRight"
          iconPlacement="right"
          className="cursor-pointer bg-[#04B1A4] hover:bg-[#039F93] text-white font-sora font-bold rounded-2xl py-6 sm:px-6 shadow-xs transition-colors"
        >
          Next
        </Button>
      </>
    );
  };

  const submitFooter = () => {
    return (
      <>
        <Button
          onClick={onPrevStep}
          disabled={isFormSubmitting}
          className="cursor-pointer bg-[#F99508] hover:bg-[#E08405] text-white font-sora font-bold rounded-2xl py-6 sm:px-6 shadow-xs transition-colors disabled:opacity-50"
        >
          Back
        </Button>
        <Button
          onClick={async () => onSubmit()}
          loading={isFormSubmitting}
          icon="ArrowRight"
          iconPlacement="right"
          className="cursor-pointer bg-[#04B1A4] hover:bg-[#039F93] text-white font-sora font-bold rounded-2xl py-6 sm:px-6 shadow-xs transition-colors disabled:opacity-50"
        >
          Submit
        </Button>
      </>
    );
  };

  return (
    <footer className="flex w-full justify-around my-6">
      {currentStep.id === 'EventDetails' && eventDetailsFooter()}
      {currentStep.id === 'Evaluation_1' && evaluationFooter()}
      {currentStep.id === 'Evaluation_2' && submitFooter()}
    </footer>
  );
};

export default EvaluateFooter;

