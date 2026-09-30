import * as React from 'react';
import {
  Controller,
  ControllerFieldState,
  ControllerRenderProps,
  FieldPath,
  FieldValues,
  GlobalError,
  UseFormStateReturn,
  useFormContext,
  useFormState
} from 'react-hook-form';
import Label from '@/components/Label';
import { cn } from '@/utils/classes';
import { InfoToolTip } from './Tooltip';

interface FormItemContextProps {
  id: string;
  formItemId: string;
  formDescriptionId: string;
  formMessageId: string;
  fieldState: {
    invalid: boolean;
    isDirty: boolean;
    isTouched: boolean;
    error?: any;
  };
}

const FormItemContext = React.createContext<FormItemContextProps>({} as FormItemContextProps);

interface FormItemProps<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>> {
  name: TName;
  className?: string;
  children: (field: {
    field: ControllerRenderProps<FieldValues, TName>;
    fieldState: ControllerFieldState;
    formState: UseFormStateReturn<FieldValues>;
  }) => React.ReactElement;
}

export const FormItem = <TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>({
  name,
  className,
  children
}: FormItemProps<TFieldValues, TName>) => {
  const { control, getFieldState } = useFormContext();
  const formState = useFormState();
  const id = React.useId();
  const formItemId = `${id}-form-item`;
  const formDescriptionId = `${id}-form-item-description`;
  const formMessageId = `${id}-form-item-message`;

  const fieldState = getFieldState(name, formState);

  const ariaDescribedby = fieldState.error ? `${formDescriptionId} ${formMessageId}` : `${formDescriptionId}`;

  return (
    <FormItemContext.Provider
      value={{
        id,
        formItemId,
        formDescriptionId,
        formMessageId,
        fieldState
      }}
    >
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState, formState }) => {
          const child = children({ field, fieldState, formState });
          if (React.isValidElement(child)) {
            const childProps = child.props as React.HTMLAttributes<HTMLElement>;
            return React.cloneElement(child, {
              id: formItemId,
              'aria-describedby': ariaDescribedby,
              'aria-invalid': !!fieldState.error,
              className: cn(childProps.className, className)
            } as React.HTMLAttributes<HTMLElement>);
          }
          return (
            <div id={formItemId} className={cn('contents', className)} aria-describedby={ariaDescribedby} aria-invalid={!!fieldState.error}>
              {child}
            </div>
          );
        }}
      />
    </FormItemContext.Provider>
  );
};

const useFormField = () => {
  const fieldContext = React.useContext(FormItemContext);

  if (!fieldContext) {
    throw new Error('useFormField should be used within a FormProvider');
  }

  return fieldContext;
};

interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  toolTipContent?: string;
  optional?: boolean;
  optionalClass?: string;
  ref?: React.Ref<HTMLLabelElement>;
}

const FormLabel = ({ className, optionalClass, children, toolTipContent, optional = false, ref, ...props }: FormLabelProps) => {
  const {
    fieldState: { error },
    formItemId
  } = useFormField();

  return (
    <Label ref={ref} className={cn(error && 'text-negative', 'flex flex-row items-center gap-x-2', className)} htmlFor={formItemId} {...props}>
      {children}
      {optional && <p className={cn('text-[0.8rem] text-muted-foreground', optionalClass)}>{`(Optional)`}</p>}
      {toolTipContent && toolTipContent.length > 0 && <InfoToolTip toolTipContent={toolTipContent} />}
    </Label>
  );
};
FormLabel.displayName = 'FormLabel';

const FormDescription = ({ className, ref, ...props }: React.HTMLAttributes<HTMLParagraphElement> & { ref?: React.Ref<HTMLParagraphElement> }) => {
  const { formDescriptionId } = useFormField();

  return <p ref={ref} id={formDescriptionId} className={cn('text-[0.8rem] text-muted-foreground', className)} {...props} />;
};
FormDescription.displayName = 'FormDescription';

const FormError = ({ className, children, ref, ...props }: React.HTMLAttributes<HTMLParagraphElement> & { ref?: React.Ref<HTMLParagraphElement> }) => {
  const {
    fieldState: { error },
    formMessageId
  } = useFormField();
  const body = error && error?.message ? String(error?.message) : children;

  const getError = () => {
    if (!body) {
      return ' ';
    }

    return body;
  };

  return (
    <p
      id={formMessageId}
      ref={ref}
      className={cn('text-[0.8rem]', body && 'text-left font-medium text-negative', !body && 'whitespace-pre', className)}
      {...props}
    >
      {getError()}
    </p>
  );
};
FormError.displayName = 'FormError';

interface FormItemContainerProps {
  halfSpace?: boolean;
  className?: string;
  children: React.ReactNode;
}

const FormItemContainer: React.FC<FormItemContainerProps> = ({ halfSpace = false, className, children }) => {
  return <div className={cn('space-y-2 w-full px-2', halfSpace && 'md:w-1/2', className)}>{children}</div>;
};

const FormItemSpacer: React.FC = () => {
  return (
    <div className="hidden md:block md:max-w-[50%]">
      <pre> </pre>
    </div>
  );
};

export { useFormField, FormLabel, FormDescription, FormError, FormItemContainer, FormItemSpacer };
