import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import googleLogo from '@/assets/logos/google.png';
import Alert from '@/components/Alert';
import Button from '@/components/Button';
import Skeleton from '@/components/Skeleton';
import { getEvent } from '@/api/events';
import { useApiQuery } from '@/hooks/useApi';
import { useMetaData } from '@/hooks/useMetaData';
import { usePyconStyles } from '../pycon/hooks/usePyconStyles';
import EventDetails from '../pycon/register/EventDetails';
import { useLogin } from './useLogin';

const LoginPage = () => {
  usePyconStyles();

  const [searchParams] = useSearchParams();
  const toParams = decodeURIComponent(searchParams.get('to')!);
  const [_, eventId] = toParams.split('/');

  const { data: response, isPending: isPendingEventInfo } = useApiQuery(getEvent(eventId), { active: !!eventId });
  const event = response?.data;
  const isValidId = !!event;

  const setMetaData = useMetaData();

  const { onLogin } = useLogin(isValidId ? eventId : undefined, event?.status);

  useEffect(() => {
    if (event) {
      setMetaData({
        title: event.name,
        iconUrl: event.logoUrl
      });
    }
  }, [event]);

  if (isPendingEventInfo) {
    return <Skeleton className="w-full h-full" />;
  }

  return (
    <>
      <Alert
        className="bg-white/80 backdrop-blur-md border-b border-[#072E4714] border-x-0 border-t-0 rounded-none grid-cols-3 top-0 sticky z-10 mb-6 md:mb-8 py-3 px-4 md:px-8 shadow-xs"
        iconClassName="text-pycon-teal size-5"
        titleClassName="text-pycon-dark-blue font-inter font-bold text-sm sm:text-base"
        descriptionClassName="text-pycon-dark-blue/70 font-inter text-xs sm:text-sm"
        title="Welcome to TechTix! Please sign in to continue"
        description="We require our users to sign in their accounts to easily track their registrations"
      >
        <Button
          className="cursor-pointer gap-x-2.5 bg-white hover:bg-neutral-50 text-pycon-dark-blue font-inter font-semibold border border-[#072E471F] shadow-xs rounded-xl px-4 py-2 col-start-2 md:col-start-3 md:row-span-2 md:row-start-1 md:h-auto mt-4 md:mt-0 md:w-fit md:ms-auto active:scale-95 transition-all"
          onClick={onLogin}
        >
          <img className="size-5" src={googleLogo} alt="" />
          Sign in with Google
        </Button>
      </Alert>

      <main data-page="pycon" className="grow pycon-page flex flex-col mx-auto px-4 py-6 md:px-8 md:py-12 lg:px-12 lg:py-16 gap-y-10 md:gap-y-16 lg:gap-y-20">
        {event && (
          <EventDetails
            event={event}
            registerButton={
              <Button
                className="cursor-pointer gap-x-2.5 bg-white hover:bg-neutral-50 text-pycon-dark-blue font-inter font-semibold border border-[#072E471F] shadow-xs hover:shadow-sm rounded-2xl px-6 py-3.5 mt-6 active:scale-95 transition-all text-base"
                onClick={onLogin}
              >
                <img className="size-6" src={googleLogo} alt="" />
                Sign in with Google
              </Button>
            }
          />
        )}
      </main>
    </>
  );
};

export const Component = LoginPage;

export default LoginPage;
