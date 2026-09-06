import Icon from '@/components/Icon';
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from '@/components/Toast/Toast';
import { useToast } from '@/hooks/useToast';

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, icon, iconClassname, ...props }) {
        return (
          <Toast key={id} {...props} className="my-1">
            <div className="flex flex-row items-start">
              {icon && (
                <div className="flex mr-3.5 pt-0.5 shrink-0">
                  <Icon name={icon} className={iconClassname} size={18} />
                </div>
              )}
              <div className="grid gap-0.5">
                {title && <ToastTitle className="text-left font-bold">{title}</ToastTitle>}
                {description && <ToastDescription className="text-left">{description}</ToastDescription>}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
