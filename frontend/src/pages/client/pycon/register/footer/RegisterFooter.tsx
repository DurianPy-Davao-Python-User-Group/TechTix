import { FC, JSX } from 'react';
import Button from '@/components/Button';
import { Event } from '@/model/events';
import { RegisterField } from '../../hooks/useRegisterForm';
import { RegisterStep } from '../steps/RegistrationSteps';
import { EventFooterPortal } from './EventFooterPortal';
import { useRegisterFooter } from './useRegisterFooter';

interface Props {
  event: Event;
  steps: RegisterStep[];
  currentStep: RegisterStep;
  fieldsToCheck: RegisterField[];
  isRegisterSuccessful: boolean;
  setCurrentStep: (step: RegisterStep) => void;
  retryRegister: () => void;
  isFeesLoading: boolean;
}

const RegisterFooter: FC<Props> = ({ event, steps, currentStep, fieldsToCheck, isRegisterSuccessful, setCurrentStep, retryRegister, isFeesLoading }) => {
  const { paymentButtonDisabled, isFormSubmitting, onNextStep, onPrevStep, onSummaryStep, onSubmitForm, onViewRegistrationDetails } = useRegisterFooter(
    event,
    steps,
    currentStep,
    fieldsToCheck,
    setCurrentStep
  );

  const eventDetailsFooter = () => {
    return (
      <EventFooterPortal>
        <Button
          onClick={onNextStep}
          icon="ArrowRight"
          iconPlacement="right"
          className="cursor-pointer gap-x-2 bg-[#04B1A4] hover:bg-[#039F93] text-white font-sora font-bold rounded-2xl py-6 sm:px-10 my-8 shadow-xs"
        >
          Register
        </Button>
      </EventFooterPortal>
    );
  };

  const defaultFooter = () => {
    return (
      <>
        <Button
          onClick={onPrevStep}
          className="cursor-pointer bg-transparent border-2 border-[#F99508] text-[#F99508] font-sora font-bold rounded-2xl py-6 sm:px-6 hover:bg-[#F9950812] transition-colors"
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

  const paymentFooter = () => {
    if (event.isApprovalFlow && event.status === 'open') {
      return summaryFooter();
    }

    return (
      <>
        <Button
          onClick={onPrevStep}
          className="cursor-pointer bg-transparent border-2 border-[#F99508] text-[#F99508] font-sora font-bold rounded-2xl py-6 sm:px-6 hover:bg-[#F9950812] transition-colors"
        >
          Back
        </Button>
        <Button
          onClick={onSummaryStep}
          disabled={paymentButtonDisabled}
          loading={isFeesLoading}
          icon="ArrowRight"
          iconPlacement="right"
          className="cursor-pointer bg-[#04B1A4] hover:bg-[#039F93] text-white font-sora font-bold rounded-2xl py-6 sm:px-6 shadow-xs transition-colors disabled:opacity-50"
        >
          Next
        </Button>
      </>
    );
  };

  const summaryFooter = () => {
    return (
      <>
        <Button
          onClick={onPrevStep}
          disabled={isFormSubmitting}
          className="cursor-pointer bg-transparent border-2 border-[#F99508] text-[#F99508] font-sora font-bold rounded-2xl py-6 sm:px-6 hover:bg-[#F9950812] transition-colors disabled:opacity-50"
        >
          Back
        </Button>
        {event.isApprovalFlow && event.status === 'open' ? (
          <Button
            onClick={onSubmitForm}
            disabled={paymentButtonDisabled}
            loading={isFormSubmitting}
            icon="ArrowRight"
            iconPlacement="right"
            className="cursor-pointer bg-[#04B1A4] hover:bg-[#039F93] text-white font-sora font-bold rounded-2xl py-6 sm:px-6 shadow-xs transition-colors disabled:opacity-50"
          >
            Proceed to Payment
          </Button>
        ) : (
          <Button
            onClick={onSubmitForm}
            loading={isFormSubmitting}
            icon="ArrowRight"
            iconPlacement="right"
            className="cursor-pointer bg-[#04B1A4] hover:bg-[#039F93] text-white font-sora font-bold rounded-2xl py-6 sm:px-6 shadow-xs transition-colors disabled:opacity-50"
          >
            Submit
          </Button>
        )}
      </>
    );
  };

  const successFooter = () => {
    if (!isRegisterSuccessful) {
      return (
        <Button
          icon="RotateCw"
          onClick={retryRegister}
          className="cursor-pointer gap-x-2 bg-[#04B1A4] hover:bg-[#039F93] text-white font-sora font-bold rounded-2xl w-full max-w-sm py-4 shadow-xs"
        >
          Retry submitting registration
        </Button>
      );
    }

    return (
      <Button
        className="cursor-pointer bg-[#04B1A4] hover:bg-[#039F93] text-white font-sora font-bold rounded-2xl w-full max-w-sm py-4 shadow-xs"
        onClick={onViewRegistrationDetails}
      >
        Check registration details
      </Button>
    );
  };

  const footerButtons: Record<RegisterStep['id'], () => JSX.Element> = {
    EventDetails: eventDetailsFooter,
    BasicInfo: defaultFooter,
    TicketSelection: defaultFooter,
    Miscellaneous: defaultFooter,
    'Payment&Verification': paymentFooter,
    Summary: summaryFooter,
    Success: successFooter
  };

  return <footer className="flex w-full justify-around my-6">{footerButtons[currentStep.id]()}</footer>;
};

export default RegisterFooter;
