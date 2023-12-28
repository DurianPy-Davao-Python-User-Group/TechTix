import { useNavigate } from 'react-router-dom';
import { FormProvider } from 'react-hook-form';
import Button from '@/components/Button';
import { FormItem, FormLabel, FormError } from '@/components/Form';
import Input from '@/components/Input';
import { useMetaData } from '@/hooks/useMetaData';
import { useAdminUpdatePasswordForm } from '@/hooks/userAdminUpdatePasswordForm';

const UpdatePasswordForm = () => {
  useMetaData({});
  const navigate = useNavigate();
  const successHandler = () => {
    navigate('/admin/login');
  };
  const { form, submit, isSubmitting } = useAdminUpdatePasswordForm(successHandler);

  return (
    <>
      <FormProvider {...form}>
        <FormItem name="email">
          {({ field }) => (
            <div className="space-y-2">
              <FormLabel>Email</FormLabel>
              <Input type="email" {...field} />
              <FormError />
            </div>
          )}
        </FormItem>

        <FormItem name="prevPassword">
          {({ field }) => (
            <div className="flex flex-col items-start space-y-2">
              <FormLabel>Password</FormLabel>
              <Input type="password" {...field} />
              <FormError />
            </div>
          )}
        </FormItem>

        <FormItem name="newPassword">
          {({ field }) => (
            <div className="flex flex-col items-start space-y-2">
              <FormLabel>New Password</FormLabel>
              <Input type="password" {...field} />
              <FormError />
            </div>
          )}
        </FormItem>

        <div className="w-full flex justify-between">
          <Button onClick={submit} className="w-full min-w-min max-w-[20%]" loading={isSubmitting}>
            Submit
          </Button>
        </div>
      </FormProvider>
    </>
  );
};

export default UpdatePasswordForm;
