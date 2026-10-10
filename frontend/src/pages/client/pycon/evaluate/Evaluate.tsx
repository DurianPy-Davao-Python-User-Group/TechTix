import { FC, Fragment, useState } from 'react';
import { FormProvider } from 'react-hook-form';
import ErrorPage from '@/components/ErrorPage';
import Separator from '@/components/Separator';
import Skeleton from '@/components/Skeleton';
import { cn } from '@/utils/classes';
import { useActiveBreakpoints } from '@/hooks/useActiveBreakpoints';
import { DefaultEvaluateField, usePyconEvaluationForm } from '@/hooks/usePyconEvaluationForm';
import EventDetails from '../register/EventDetails';
import Stepper from '../register/steps/Stepper';
import EvaluateFooter from './footer/EvaluateFooter';
import QuestionBuilder from './questionBuilder/QuestionBuilder';
import { EVALUATION_QUESTIONS_1, EVALUATION_QUESTIONS_2 } from './questionBuilder/questionsConfig';
import ClaimCertificate from './steps/ClaimCertificate';
import { EvaluateStep, EvaluateSteps, STEP_CLAIM_CERTIFICATE, STEP_EVENT_DETAILS } from './steps/EvaluationSteps';
import { useEvaluatePage } from './useEvaluatePage';
import PyconBackground from '@/routes/layouts/PyconBackground';

interface Props {
  eventId: string;
}

const Evaluate: FC<Props> = ({ eventId }) => {
  const [currentStep, setCurrentStep] = useState<EvaluateStep>(STEP_EVENT_DETAILS);
  const [shouldBeVertical] = useActiveBreakpoints('md');

  const { response, isPending } = useEvaluatePage(eventId);
  const { form, EVALUATE_FIELDS, submit } = usePyconEvaluationForm([...EVALUATION_QUESTIONS_1, ...EVALUATION_QUESTIONS_2], eventId);

  if (isPending) return <Skeleton className="w-full h-full" />;
  if (!response || (response && !response.data && response.errorData)) return <ErrorPage error={response} />;
  if (response.data.status !== 'completed') return <ErrorPage />;

  const eventInfo = response.data;
  const fieldsToCheck: DefaultEvaluateField[] = EVALUATE_FIELDS[currentStep.id] || [];
  const STEPS = EvaluateSteps;
  const showStepper = currentStep.id !== 'EventDetails' && currentStep.id !== 'ClaimCertificate';

  const onPrevStep = () => {
    const currentIndex = STEPS.findIndex((step) => step.id === currentStep.id);
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1]);
    }
  };

  return (
    <section
      className={cn(
        'flex flex-col grow px-4 h-full w-full text-pycon-dark-blue font-inter max-w-6xl mx-auto',
        currentStep.id === 'ClaimCertificate' && 'grow-0'
      )}
    >
      <div className="w-full h-full flex flex-col space-y-4 grow">
        <FormProvider {...form}>
          {currentStep.id !== 'EventDetails' && currentStep.id !== 'ClaimCertificate' && (
            <div className="space-y-2 text-left w-full mb-2">
              {showStepper && !shouldBeVertical && (
                <div className="w-full mb-3 sm:mb-4">
                  <Stepper
                    orientation="horizontal"
                    steps={STEPS}
                    currentStep={currentStep}
                    stepsToExclude={[STEP_CLAIM_CERTIFICATE]}
                    onPrevStep={onPrevStep}
                  />
                </div>
              )}
              {currentStep.category && (
                <p className="text-xs sm:text-sm font-extrabold tracking-[0.16em] text-[#04b1a4] uppercase font-inter">
                  {currentStep.category}
                </p>
              )}
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#04b1a4] md:text-[#F99508] font-sora tracking-tight leading-tight">
                {currentStep.title}
              </h1>
              {currentStep.description && (
                <p className="text-sm sm:text-base md:text-lg text-pycon-dark-blue/60 font-inter">
                  {currentStep.description.includes('*') ? (
                    currentStep.description.split('*').map((part, index, array) => (
                      <Fragment key={index}>
                        {part}
                        {index < array.length - 1 && <span className="text-[#F99508] font-bold">*</span>}
                      </Fragment>
                    ))
                  ) : (
                    currentStep.description
                  )}
                </p>
              )}
            </div>
          )}

          <div className="flex flex-col md:flex-row w-full h-full grow">
            {showStepper && shouldBeVertical && (
              <div className="my-8 h-[650px] w-[210px] md:w-[225px] lg:w-[240px] shrink-0">
                <Stepper orientation="vertical" steps={STEPS} currentStep={currentStep} stepsToExclude={[STEP_CLAIM_CERTIFICATE]} />
              </div>
            )}

            <div
              className={cn(
                'space-y-4 grow min-w-0',
                currentStep.id !== 'EventDetails' && currentStep.id !== 'ClaimCertificate' && shouldBeVertical && 'ps-6 md:ps-8 lg:ps-10 py-4 sm:py-6'
              )}
            >
              {currentStep.id === 'EventDetails' && <EventDetails event={eventInfo} />}
              {currentStep.id === 'Evaluation_1' && <QuestionBuilder questions={EVALUATION_QUESTIONS_1} />}
              {currentStep.id === 'Evaluation_2' && <QuestionBuilder questions={EVALUATION_QUESTIONS_2} />}
              {currentStep.id === 'ClaimCertificate' && <ClaimCertificate eventId={eventId!} />}
            </div>
          </div>

          {currentStep.id !== 'EventDetails' && currentStep.id !== 'ClaimCertificate' && <Separator className="my-4 bg-pycon-teal" />}

          {currentStep.id !== 'ClaimCertificate' && (
            <EvaluateFooter
              event={eventInfo}
              steps={STEPS}
              currentStep={currentStep}
              fieldsToCheck={fieldsToCheck}
              setCurrentStep={setCurrentStep}
              submitForm={submit}
            />
          )}
        </FormProvider>
      </div>

      <PyconBackground />
    </section>
  );
};

export default Evaluate;

