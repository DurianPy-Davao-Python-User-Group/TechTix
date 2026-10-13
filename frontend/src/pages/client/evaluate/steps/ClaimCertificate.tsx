import { FC } from 'react';
import Button from '@/components/Button';
import Skeleton from '@/components/Skeleton';
import { reloadPage } from '@/utils/functions';
import { useClaimCertificate } from './useClaimCertificate';

interface Props {
  eventId: string;
}

const ClaimCertificate: FC<Props> = ({ eventId }) => {
  const { certificateImgDataURL, isLoading, isReRequesting, reRequestCertificate, onDownloadImg, onDownloadPdf } = useClaimCertificate(eventId);

  if (isLoading && !certificateImgDataURL) {
    return <Skeleton className="rounded-2xl h-[330px] w-full" />;
  }

  if (!certificateImgDataURL) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
        <p className="font-subjectivity font-bold text-transparent gradient-text bg-linear-to-br from-secondary-pink-400 to-primary-500">
          Certificate download link expired or not loaded
        </p>
        <Button onClick={reRequestCertificate} disabled={isReRequesting} variant="primaryGradient" className="py-2.5 px-6">
          {isReRequesting ? 'Refreshing...' : 'Refresh Certificate'}
        </Button>
      </div>
    );
  }

  return (
    <>
      <h3>Here&apos;s your Certificate!</h3>
      {certificateImgDataURL && (
        <img
          src={certificateImgDataURL}
          alt="Certificate"
          onError={reRequestCertificate}
          className="animate-[fade-in_3s_ease-in-out] rounded-2xl object-center object-cover w-full h-full"
        />
      )}
      <div className="w-full space-y-10">
        <div className="flex flex-col space-y-4">
          <Button onClick={onDownloadImg} disabled={isReRequesting} icon="Download" variant="secondaryGradient" className="py-3 px-6 disabled:opacity-50">
            {isReRequesting ? 'Preparing...' : 'Download Image'}
          </Button>
          <Button onClick={onDownloadPdf} disabled={isReRequesting} icon="Download" variant="primaryGradient" className="py-3 px-6 disabled:opacity-50">
            {isReRequesting ? 'Preparing...' : 'Download PDF'}
          </Button>
        </div>

        <Button onClick={reloadPage} icon="ChevronRight" iconPlacement="right" className="w-full py-3 px-6">
          Evaluate with another user
        </Button>
      </div>
    </>
  );
};

export default ClaimCertificate;
