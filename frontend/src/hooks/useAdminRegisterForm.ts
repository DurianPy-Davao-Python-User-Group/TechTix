import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useNotifyToast } from '@/hooks/useNotifyToast';
import { zodResolver } from '@hookform/resolvers/zod';

const RegisterFormSchema = z.object({
  email: z
    .string()
    .email()
    .refine((val) => val !== 'test@gmail.com', { message: 'Errrorrrr' }),
  password: z.string().min(8, {
    message: 'Please enter atleast 8 characters'
  })
});

export const useRegisterForm = () => {
  const { successToast, errorToast } = useNotifyToast();

  const form = useForm<z.infer<typeof RegisterFormSchema>>({
    resolver: zodResolver(RegisterFormSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const submit = form.handleSubmit(async (values) => {
    try {
      successToast({
        title: 'Register Info',
        description: `Registering user with email: ${values.email}`
      });
    } catch (error) {
      errorToast({
        title: 'Error in Registering',
        description: JSON.stringify(form.formState.errors)
      });
    }
  });

  return {
    form,
    submit
  };
};
