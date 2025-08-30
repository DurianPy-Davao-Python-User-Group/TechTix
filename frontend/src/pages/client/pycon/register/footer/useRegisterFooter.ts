import { useState } from 'react';
import { useFormContext, UseFormSetValue, useWatch } from 'react-hook-form';
import { ulid } from 'ulid';
import { getEventRegCountStatus } from '@/api/events';
import { checkPreRegistration } from '@/api/preregistrations';
import { Event } from '@/model/events';
import { AcceptanceStatus, PreRegistration, mapPreRegistrationToFormValues } from '@/model/preregistrations';
import { getPathFromUrl, isEmpty, reloadPage, scrollToView } from '@/utils/functions';
import { useApi } from '@/hooks/useApi';
import { useNotifyToast } from '@/hooks/useNotifyToast';
import { RegisterField, RegisterFormValues } from '../../hooks/useRegisterForm';
import { calculateTotalPrice } from '../pricing';
import { RegisterStep, STEP_SUCCESS } from '../steps/RegistrationSteps';
import { usePayment } from '../usePayment';

export const useRegisterFooter = (
  event: Event,
  steps: RegisterStep[],
  currentStep: RegisterStep,
  fieldsToCheck: RegisterField[],
  setCurrentStep: (step: RegisterStep) => void
) => {
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const { errorToast } = useNotifyToast();
  const { trigger, setValue, getValues, control, reset } = useFormContext<RegisterFormValues>();
  const api = useApi();
  const { eventId } = event;
  const [paymentChannel, paymentMethod, transactionFee, percentageDiscount] = useWatch({
    control,
    name: ['paymentChannel', 'paymentMethod', 'transactionFee', 'discountPercentage']
  });

  const baseUrl = getPathFromUrl(window.location.href);

  const { eWalletRequest, directDebitRequest } = usePayment(baseUrl, eventId);

  const currentIndex = steps.indexOf(currentStep);

  const paymentButtonDisabled = isEmpty(paymentChannel) || isEmpty(paymentMethod) || isEmpty(transactionFee);

  const checkRegistrationCount = async () => {
    const response = await api.execute(getEventRegCountStatus(eventId));
    if (response.status !== 200) {
      throw new Error('Registration count check failed');
    }

    const { registrationCount, maximumSlots } = response.data;

    if (maximumSlots && maximumSlots === registrationCount) {
      return true;
    }

    return false;
  };

  const checkAcceptanceStatus = (preRegistration: PreRegistration) => {
    const getTitleAndDescription = (acceptanceStatus: AcceptanceStatus) => {
      if (acceptanceStatus === 'REJECTED') {
        return {
          title: 'Your pre-registration was not accepted',
          description: `We're sorry but your registration wasn't accepted. Please feel free to join our future events.`
        };
      }

      if (acceptanceStatus === 'PENDING') {
        return {
          title: 'Your pre-registration is still being reviewed',
          description: `Please wait while we review your pre-registration. We'll send you an email when it's approved.`
        };
      }

      return {};
    };

    switch (preRegistration.acceptanceStatus) {
      case 'ACCEPTED':
        reset(mapPreRegistrationToFormValues(preRegistration));
        return true;
      default:
        errorToast(getTitleAndDescription(preRegistration.acceptanceStatus));
        return false;
    }
  };

  // Function to set the total price
  const setPaymentTotal = () => {
    const total = Number(calculateTotalPrice(event.price, transactionFee ?? null, percentageDiscount ?? null, event.platformFee).toFixed(2));
    setValue('total', total);
  };

  const onNextStep = async () => {
    saveFormState();
    const moveToNextStep = () => {
      if (currentIndex < steps.length - 1) {
        setCurrentStep(steps[currentIndex + 1]);
        scrollToView();
      }
    };

    if (isEmpty(fieldsToCheck)) {
      moveToNextStep();
    } else {
      const isValid = await trigger(fieldsToCheck);

      if (isValid) {
        moveToNextStep();
        scrollToView();
      } else {
        errorToast({
          id: 'form-error-' + ulid(),
          title: 'There are errors in the form',
          description: 'Please review the form and try again.'
        });
      }
    }
  };

  const onPrevStep = () => {
    saveFormState();
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const onSummaryStep = () => {
    if (!transactionFee) {
      return;
    }

    setPaymentTotal();
    onNextStep();
  };

  const saveFormState = () => {
    const formState = getValues();
    localStorage.setItem('formState', JSON.stringify(formState));
  };

  const onRequestPayment = async () => {
    const { paymentMethod, paymentChannel, total } = getValues();
    if (!paymentMethod || !paymentChannel || !total) {
      return;
    }

    saveFormState();

    if (paymentMethod === 'E_WALLET') {
      await eWalletRequest(total, paymentChannel);
    } else if (paymentMethod === 'DIRECT_DEBIT') {
      await directDebitRequest(total, paymentChannel);
    }
  };

  const onSubmitForm = async () => {
    const total = getValues('total');

    if (event.isApprovalFlow && event.status === 'preregistration') {
      setCurrentStep(STEP_SUCCESS);
    }

    if (!event.paidEvent || total === 0) {
      setCurrentStep(STEP_SUCCESS);
    }

    if (event.maximumSlots) {
      const isEventFull = await checkRegistrationCount();

      if (isEventFull) {
        reloadPage();
        return;
      }
    }

    if (event.isApprovalFlow && event.status === 'open') {
      setPaymentTotal();
    }

    try {
      setIsFormSubmitting(true);
      await onRequestPayment();
    } catch (error) {
      console.error(error);
    } finally {
      setIsFormSubmitting(false);
    }
  };

  return {
    paymentButtonDisabled,
    isFormSubmitting,
    onNextStep,
    onPrevStep,
    onSummaryStep,
    onSignUpOther: reloadPage,
    onSubmitForm
  };
};
