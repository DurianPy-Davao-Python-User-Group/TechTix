import { FC } from 'react';
import Button from '@/components/Button';
import Skeleton from '@/components/Skeleton';
import { useClaimCertificate } from './useClaimCertificate';

interface Props {
  eventId: string;
}

const ClaimCertificate: FC<Props> = ({ eventId }) => {
  const { certificateImgDataURL, isLoading, isReRequesting, reRequestCertificate, onDownloadImg, onDownloadPdf } = useClaimCertificate(eventId);

  if (isLoading && !certificateImgDataURL) {
    return (
      <div className="flex flex-col items-center justify-center w-full py-12">
        <Skeleton className="rounded-3xl h-[400px] max-w-2xl w-full" />
      </div>
    );
  }

  if (!certificateImgDataURL) {
    return (
      <div className="flex flex-col items-center justify-center w-full my-auto py-8 sm:py-12">
        <div className="rounded-3xl sm:rounded-[2.5rem] bg-white/80 sm:bg-white/85 backdrop-blur-md border border-[#F995081F] p-8 sm:p-12 shadow-[0px_10px_40px_0px_#072E4714] max-w-md w-full mx-auto text-center flex flex-col items-center gap-4">
          <p className="text-xs sm:text-sm font-extrabold tracking-[0.16em] text-negative uppercase font-inter">EVALUATION</p>
          <h2 className="font-sora text-2xl sm:text-3xl font-extrabold text-negative tracking-tight leading-tight">Certificate Link Expired</h2>
          <p className="text-sm sm:text-base text-pycon-dark-blue/80 font-inter leading-relaxed">
            Your certificate download link has expired or could not be loaded. Click below to re-request your certificate.
          </p>
          <Button
            onClick={reRequestCertificate}
            disabled={isReRequesting}
            className="cursor-pointer bg-[#F99508] hover:bg-[#E08405] text-white font-sora font-bold rounded-2xl px-6 py-3 shadow-md mt-2 transition-all hover:shadow-lg active:scale-95"
          >
            {isReRequesting ? 'Refreshing...' : 'Refresh Certificate'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full my-auto py-8 sm:py-12">
      <div className="rounded-3xl sm:rounded-[2.5rem] bg-white/80 sm:bg-white/85 backdrop-blur-md border border-[#F995081F] p-8 sm:p-12 shadow-[0px_10px_40px_0px_#072E4714] max-w-2xl w-full mx-auto text-center flex flex-col items-center gap-6">
        <div className="space-y-1 text-center">
          <p className="text-xs sm:text-sm font-extrabold tracking-[0.16em] text-[#04b1a4] uppercase font-inter">EVALUATION COMPLETE</p>
          <h1 className="font-sora text-3xl sm:text-4xl font-extrabold text-[#04b1a4] md:text-[#F99508] tracking-tight leading-tight">
            Here&apos;s your Certificate!
          </h1>
        </div>

        <p className="text-sm sm:text-base text-pycon-dark-blue/80 font-inter leading-relaxed max-w-md mx-auto">
          Thank you for taking the time to share your feedback! You can download your official Certificate of Attendance below.
        </p>

        <div className="w-full rounded-2xl overflow-hidden border border-[#F99508]/20 shadow-md bg-white relative">
          <img
            src={certificateImgDataURL}
            alt="Certificate of Attendance"
            onError={reRequestCertificate}
            className="animate-[fade-in_1s_ease-in-out] object-contain w-full h-auto"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center items-center mt-2">
          <Button
            onClick={onDownloadImg}
            disabled={isReRequesting}
            icon="Download"
            className="cursor-pointer bg-[#F99508] hover:bg-[#E08405] text-white font-sora font-bold rounded-2xl w-full sm:w-auto px-8 py-3.5 sm:py-4 shadow-md shadow-[#F99508]/20 transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 text-sm sm:text-base disabled:opacity-50"
          >
            {isReRequesting ? 'Preparing...' : 'Download Image'}
          </Button>
          <Button
            onClick={onDownloadPdf}
            disabled={isReRequesting}
            icon="Download"
            className="cursor-pointer bg-[#04B1A4] hover:bg-[#039F93] text-white font-sora font-bold rounded-2xl w-full sm:w-auto px-8 py-3.5 sm:py-4 shadow-md shadow-[#04b1a4]/20 transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 text-sm sm:text-base disabled:opacity-50"
          >
            {isReRequesting ? 'Preparing...' : 'Download PDF'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ClaimCertificate;
