import { useCallback, useContext, useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { claimCertificate } from '@/api/evaluations';
import { getDownloadUrl } from '@/api/events';
import { decodeObjectKeys, downloadFile, isPresignedUrlExpired } from '@/utils/functions';
import { useApi } from '@/hooks/useApi';
import { useFileUrl } from '@/hooks/useFileUrl';
import { useNotifyToast } from '@/hooks/useNotifyToast';
import { DefaultEvaluateFormValues } from '@/hooks/usePyconEvaluationForm';
import { ClientAuthContext } from '@/context/ClientAuthContext';

export const useClaimCertificate = (eventId: string) => {
  const { getValues, setValue } = useFormContext<DefaultEvaluateFormValues>();
  const clientAuth = useContext(ClientAuthContext);
  const api = useApi();
  const { errorToast } = useNotifyToast();

  const [isReRequesting, setIsReRequesting] = useState(false);

  const certificate = getValues('certificate') || {};
  const { certificateTemplateKey, certificatePDFTemplateKey } = certificate;

  const { fileUrl: certificateImgDataURL, isPending: isPendingImg, refetch: refetchImg } = useFileUrl(eventId, certificateTemplateKey);
  const { fileUrl: certificatePdfDataURL, isPending: isPendingPdf, refetch: refetchPdf } = useFileUrl(eventId, certificatePDFTemplateKey);

  const isLoading = isPendingImg || isPendingPdf || isReRequesting;

  const reRequestCertificate = useCallback(async () => {
    const email = clientAuth?.user?.email || getValues('email');
    if (!email || !eventId) {
      if (certificateTemplateKey) await refetchImg();
      if (certificatePDFTemplateKey) await refetchPdf();
      return;
    }

    try {
      setIsReRequesting(true);
      const response = await api.execute(claimCertificate(eventId, email));
      if (response.status === 200 && response.data) {
        setValue('certificate', response.data);
        const newImgKey = response.data.certificateTemplateKey;
        const newPdfKey = response.data.certificatePDFTemplateKey;

        if (newImgKey) {
          await api.invalidateQueries(getDownloadUrl(eventId, newImgKey));
        }
        if (newPdfKey) {
          await api.invalidateQueries(getDownloadUrl(eventId, newPdfKey));
        }
        await Promise.all([refetchImg(), refetchPdf()]);
      }
    } catch (error) {
      console.error('Error re-requesting certificate:', error);
      errorToast({
        title: 'Error refreshing certificate',
        description: 'Unable to refresh certificate download link. Please try again.'
      });
    } finally {
      setIsReRequesting(false);
    }
  }, [api, clientAuth?.user?.email, certificatePDFTemplateKey, certificateTemplateKey, errorToast, eventId, getValues, refetchImg, refetchPdf, setValue]);

  // Automatically re-request if the preview image URL is expired
  useEffect(() => {
    if (certificateImgDataURL && isPresignedUrlExpired(certificateImgDataURL)) {
      reRequestCertificate();
    }
  }, [certificateImgDataURL, reRequestCertificate]);

  // Re-check when user returns to tab after inactivity
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && certificateImgDataURL && isPresignedUrlExpired(certificateImgDataURL)) {
        reRequestCertificate();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [certificateImgDataURL, reRequestCertificate]);

  const onDownloadImg = async () => {
    let url = certificateImgDataURL;
    let key = certificate?.certificateTemplateKey;

    if (!url || isPresignedUrlExpired(url)) {
      const email = clientAuth?.user?.email || getValues('email');
      if (email && eventId) {
        try {
          setIsReRequesting(true);
          const response = await api.execute(claimCertificate(eventId, email));
          if (response.status === 200 && response.data) {
            setValue('certificate', response.data);
            key = response.data.certificateTemplateKey;
            if (key) {
              await api.invalidateQueries(getDownloadUrl(eventId, key));
              const downloadRes = await api.execute(getDownloadUrl(eventId, key));
              url = downloadRes.data?.downloadLink;
              await refetchImg();
            }
          }
        } catch (e) {
          console.error('Failed to re-request certificate on download:', e);
        } finally {
          setIsReRequesting(false);
        }
      }
    }

    if (url && key) {
      downloadFile(url, decodeObjectKeys(key));
    } else {
      errorToast({
        title: 'Download Failed',
        description: 'Unable to get a valid download link. Please try again.'
      });
    }
  };

  const onDownloadPdf = async () => {
    let url = certificatePdfDataURL;
    let key = certificate?.certificatePDFTemplateKey;

    if (!url || isPresignedUrlExpired(url)) {
      const email = clientAuth?.user?.email || getValues('email');
      if (email && eventId) {
        try {
          setIsReRequesting(true);
          const response = await api.execute(claimCertificate(eventId, email));
          if (response.status === 200 && response.data) {
            setValue('certificate', response.data);
            key = response.data.certificatePDFTemplateKey;
            if (key) {
              await api.invalidateQueries(getDownloadUrl(eventId, key));
              const downloadRes = await api.execute(getDownloadUrl(eventId, key));
              url = downloadRes.data?.downloadLink;
              await refetchPdf();
            }
          }
        } catch (e) {
          console.error('Failed to re-request certificate on download:', e);
        } finally {
          setIsReRequesting(false);
        }
      }
    }

    if (url && key) {
      downloadFile(url, decodeObjectKeys(key));
    } else {
      errorToast({
        title: 'Download Failed',
        description: 'Unable to get a valid download link. Please try again.'
      });
    }
  };

  return {
    certificateImgDataURL,
    isLoading,
    isReRequesting,
    reRequestCertificate,
    onDownloadImg,
    onDownloadPdf
  };
};
