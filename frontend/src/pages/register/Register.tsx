import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { FormProvider } from 'react-hook-form';
import sparcsApplicationimage from '@/assets/applicationSpracs.svg';
import Button from '@/components/Button';
import ErrorPage from '@/components/ErrorPage';
import Icon from '@/components/Icon';
import { getEvent } from '@/api/events';
import { isEmpty } from '@/utils/functions';
import { useApi } from '@/hooks/useApi';
import { RegisterFormValues, useRegisterForm } from '@/hooks/useRegisterForm';
import EventDetails from './EventDetails';
import RegisterForm1 from './RegisterForm1';
import RegisterForm2 from './RegisterForm2';
import RegisterForm3 from './RegisterForm3';
import RegisterFormLoading from './RegisterFormLoading';
import Stepper from './Stepper';
import Summary from './Summary';

// TODO: Add success page
const REGISTER_STEPS = ['EventDetails', 'UserBio', 'PersonalInfo', 'GCash', 'Summary'] as const;
type RegisterSteps = (typeof REGISTER_STEPS)[number];
const REGISTER_STEPS_DISPLAY = ['UserBio', 'PersonalInfo', 'GCash', 'Summary'];

type RegisterField = keyof RegisterFormValues;

const REGISTER_STEPS_FIELD: { [key: string]: RegisterField[] } = {
  UserBio: ['firstName', 'lastName', 'email', 'contactNumber'],
  PersonalInfo: ['careerStatus', 'organization', 'title']
};

const Register = () => {
  const eventId = useParams().eventId;
  const { data: response, isFetching } = useApi(getEvent(eventId!));
  const { form, submit } = useRegisterForm(eventId!);
  const [currentStep, setCurrentStep] = useState<RegisterSteps>(REGISTER_STEPS[0]);

  if (isFetching) {
    return <RegisterFormLoading />;
  }

  if (!response || (response && !response.data && response.errorData)) {
    return <ErrorPage error={response} />;
  }

  const eventInfo = response.data;

  const fieldsToCheck: RegisterField[] = REGISTER_STEPS_FIELD[currentStep as keyof typeof REGISTER_STEPS_FIELD];

  const nextStep = async () => {
    const moveToNextStep = () => {
      const currentIndex = REGISTER_STEPS.indexOf(currentStep);
      if (currentIndex < REGISTER_STEPS.length - 1) {
        setCurrentStep(REGISTER_STEPS[currentIndex + 1]);
      }
    };

    if (isEmpty(fieldsToCheck)) {
      moveToNextStep();
    } else {
      await form.trigger(fieldsToCheck).then((isValid) => {
        if (isValid) {
          moveToNextStep();
        }
      });
    }
  };

  const prevStep = () => {
    const currentIndex = REGISTER_STEPS.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(REGISTER_STEPS[currentIndex - 1]);
    }
  };

  return (
    <section className="flex flex-col items-center justify-center w-full px-4">
      <div className="w-full max-w-2xl flex flex-col items-center">
        <img className="w-fit h-12 rounded-full" src={eventInfo.logoUrl} />
        <div className="flex w-full justify-center my-8 relative overflow-hidden">
          <img src={eventInfo.bannerUrl} className="h-fit w-full max-w-md object-cover z-10" />
          <div className="blur-2xl absolute w-full h-full inset-0 bg-center" style={{ backgroundImage: `url(${eventInfo.bannerUrl})` }}></div>
        </div>

        <FormProvider {...form}>
          <main className="w-full">
            {currentStep !== 'EventDetails' && <h1 className="text-xl text-center">Register</h1>}
            {currentStep !== 'EventDetails' && <Stepper steps={REGISTER_STEPS_DISPLAY} currentStep={currentStep} />}
            {currentStep === 'EventDetails' && <EventDetails event={eventInfo} />}

            <div className="space-y-4">
              {currentStep === 'UserBio' && <RegisterForm1 />}
              {currentStep === 'PersonalInfo' && <RegisterForm2 />}
              {currentStep === 'GCash' && <RegisterForm3 />}
            </div>

            {currentStep === 'Summary' && <Summary />}

            <div className="flex w-full justify-around my-10">
              {currentStep === 'EventDetails' && (
                <Button onClick={nextStep} variant={'gradient'} className="py-4 px-20">
                  Register
                </Button>
              )}
              {currentStep !== 'EventDetails' && (
                <Button onClick={prevStep} variant={'outline'} className="sm:py-4 sm:px-16">
                  <Icon name="CaretLeft" />
                  Back
                </Button>
              )}
              {currentStep !== 'EventDetails' && currentStep !== 'Summary' && (
                <Button onClick={nextStep} className="sm:py-4 sm:px-16">
                  Next
                  <Icon name="CaretRight" />
                </Button>
              )}
              {currentStep === 'Summary' && (
                <Button onClick={submit} type="submit" className="py-4 px-20">
                  Submit
                </Button>
              )}
            </div>
          </main>
        </FormProvider>
      </div>
    </section>
  );
};

export default Register;
