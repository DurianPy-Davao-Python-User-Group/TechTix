import { IconName } from '@/components/Icon';
import { useToast } from '@/hooks/useToast';

interface ToastProps {
  id?: string;
  title?: string;
  description?: string;
  icon?: IconName;
  iconClassname?: string;
  duration?: number;
}

export const useNotifyToast = () => {
  const { toast } = useToast();

  const infoToast = ({ id = '', title = 'Info', description, icon = 'Info', iconClassname = 'text-pycon-teal', duration = 5000 }: ToastProps) =>
    toast({
      id,
      title,
      description,
      icon,
      iconClassname,
      duration
    });

  const successToast = ({ id = '', title = 'Success', description, icon = 'CircleCheckBig', iconClassname = 'text-pycon-green', duration = 5000 }: ToastProps) =>
    toast({
      id,
      title,
      description,
      icon,
      iconClassname,
      duration
    });

  const errorToast = ({ id = '', title = 'Error', description, icon = 'CircleX', iconClassname = 'text-negative', duration = 5000 }: ToastProps) =>
    toast({
      id,
      title,
      description,
      icon,
      iconClassname,
      duration
    });

  return {
    infoToast,
    successToast,
    errorToast
  };
};
