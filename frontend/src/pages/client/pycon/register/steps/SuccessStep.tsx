import { FC } from 'react';
import montyHappy from '@/assets/pycon/monty-happy.webp';
import montyShocked from '@/assets/pycon/monty-shocked.webp';
import Button from '@/components/Button';
import { Event } from '@/model/events';

interface SuccessProps {
  event: Event;
  isRegisterSuccessful: boolean;
  retryRegister?: () => void;
}

const SuccessStep: FC<SuccessProps> = ({ event, isRegisterSuccessful, retryRegister }) => {
  const onBackToWebsite = () => {
    const websiteUrl = import.meta.env.VITE_PYCON_WEBSITE || 'https://pycon-davao.durianpy.org';
    window.location.href = websiteUrl;
  };

  if (!isRegisterSuccessful) {
    return (
      <div className="flex flex-col items-center justify-center w-full my-auto py-8 sm:py-12">
        <div className="rounded-3xl sm:rounded-[2.5rem] bg-white/80 sm:bg-white/85 backdrop-blur-md border border-[#F995081F] p-8 sm:p-12 shadow-[0px_10px_40px_0px_#072E4714] max-w-md w-full mx-auto text-center flex flex-col items-center gap-4">
          <img src={montyShocked} className="w-32 h-32 sm:w-40 sm:h-40 object-contain mx-auto drop-shadow-xs" alt="Registration failed" />

          <div className="space-y-1 text-center">
            <p className="text-xs sm:text-sm font-extrabold tracking-[0.16em] text-negative uppercase font-inter">
              REGISTRATION
            </p>
            <h1 className="font-sora text-2xl sm:text-3xl font-extrabold text-negative tracking-tight leading-tight">
              Oops! Something went wrong
            </h1>
          </div>

          <p className="text-sm sm:text-base text-pycon-dark-blue/80 font-inter leading-relaxed max-w-sm mx-auto">
            Your submission cannot be completed at this time. Please try resubmitting.
          </p>

          <Button
            icon="RotateCw"
            onClick={retryRegister}
            className="cursor-pointer gap-x-2 bg-[#04B1A4] hover:bg-[#039F93] text-white font-sora font-bold rounded-2xl w-full max-w-xs py-3.5 sm:py-4 shadow-md shadow-[#04b1a4]/20 transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 text-sm sm:text-base mt-2"
          >
            Retry Submission
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full my-auto py-8 sm:py-12">
      <div className="rounded-3xl sm:rounded-[2.5rem] bg-white/80 sm:bg-white/85 backdrop-blur-md border border-[#F995081F] p-8 sm:p-12 shadow-[0px_10px_40px_0px_#072E4714] max-w-md w-full mx-auto text-center flex flex-col items-center gap-4">
        <img src={montyHappy} className="w-32 h-32 sm:w-40 sm:h-40 object-contain mx-auto drop-shadow-xs" alt="Registration successful" />

        <div className="space-y-1 text-center">
          <p className="text-xs sm:text-sm font-extrabold tracking-[0.16em] text-[#04b1a4] uppercase font-inter">
            REGISTRATION
          </p>
          <h1 className="font-sora text-3xl sm:text-4xl font-extrabold text-[#04b1a4] tracking-tight leading-tight">
            You&apos;re all set!
          </h1>
        </div>

        <p className="text-sm sm:text-base text-pycon-dark-blue/80 font-inter leading-relaxed max-w-sm mx-auto">
          Your response has been recorded. Check your email for updates and confirmation details.
        </p>

        <Button
          onClick={onBackToWebsite}
          className="cursor-pointer bg-[#04B1A4] hover:bg-[#039F93] text-white font-sora font-bold rounded-2xl w-full max-w-xs py-3.5 sm:py-4 shadow-md shadow-[#04b1a4]/20 transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 text-sm sm:text-base mt-2"
        >
          Back to Website
        </Button>

        <a
          href={`/${event.eventId}/register/details`}
          className="text-xs sm:text-sm font-semibold text-pycon-dark-blue/60 hover:text-[#04b1a4] underline cursor-pointer transition-colors mt-1"
        >
          View registration details
        </a>
      </div>
    </div>
  );
};

export default SuccessStep;
