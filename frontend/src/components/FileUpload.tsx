import { forwardRef, useMemo } from 'react';
import { UseFormSetError, UseFormRegister, UseFormResetField } from 'react-hook-form';
import { EVENT_UPLOAD_TYPE } from '@/model/events';
import { EventFormValues } from '@/hooks/useAdminEventForm';
import { useFileUpload, UploadInputType } from '@/hooks/useFileUpload';
import { CardContainer, CardFooter, CardHeader } from './Card';
import ImageViewer from './ImageViewer';
import Input from './Input';
import Label from './Label';
import Progress from './Progress';

interface FileUploadProps {
  eventId: string;
  uploadType: string;
  value: string;
  onChange: (value: string) => void;
  setError: UseFormSetError<UploadInputType>;
  register: UseFormRegister<EventFormValues>;
  resetField: UseFormResetField<EventFormValues>;
}

const extractImagePath = (path: string) => {
  const name = path.split('/').pop();
  return name;
};

const FileUpload = forwardRef<HTMLInputElement, FileUploadProps>(({ eventId, uploadType, value, onChange, setError, register }, ref) => {
  const { uploadProgress, isUploading, onFileChange } = useFileUpload(eventId, uploadType, onChange);
  const uploadInputType = uploadType === EVENT_UPLOAD_TYPE.CERTIFICATE_TEMPLATE ? uploadType : uploadType + 'Link';

  const label = useMemo(() => {
    if (!value) {
      return 'No file uploaded';
    }

    return extractImagePath(value) ?? 'Unknown file';
  }, [value]);

  if (isUploading) {
    return <Progress className="w-full max-w-md" value={uploadProgress} />;
  }

  return (
    <CardContainer className="p-0 border-none shadow-none">
      <CardHeader className="items-center">
        <ImageViewer objectKey={value} className="h-40 w-min object-cover" alt="" />
      </CardHeader>
      <CardFooter className="flex flex-wrap px-0 pb-2 gap-2 items-center w-full">
        <Input
          {...register(uploadInputType as keyof UploadInputType)}
          id={`upload-custom-${uploadType}`}
          ref={ref}
          onChange={(e) => onFileChange(e, setError, uploadInputType as keyof UploadInputType)}
          type="file"
          accept="image/*"
          className="hidden"
        />
        <Label
          role="button"
          htmlFor={`upload-custom-${uploadType}`}
          aria-disabled={isUploading}
          className="text-sm py-2 px-4 rounded-md bg-input border border-border transition-colors hover:cursor-pointer hover:bg-accent"
        >
          Choose file
        </Label>
        <Label className="text-sm line-clamp-1 break-all w-1/2">{label}</Label>
      </CardFooter>
    </CardContainer>
  );
});

export default FileUpload;
