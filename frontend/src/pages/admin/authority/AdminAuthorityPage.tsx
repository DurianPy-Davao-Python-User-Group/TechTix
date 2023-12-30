import { FC, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormProvider } from 'react-hook-form';
import { getCookie } from 'typescript-cookie';
import Button from '@/components/Button';
import { DataTable } from '@/components/DataTable';
import { FormItem } from '@/components/Form';
import { FormLabel } from '@/components/Form';
import { FormError } from '@/components/Form';
import Input from '@/components/Input';
import Modal from '@/components/Modal';
import Skeleton from '@/components/Skeleton';
import { getAllAdmins } from '@/api/admin';
import { useApiQuery } from '@/hooks/useApi';
import { useAdminForm } from '@/hooks/useInviteAdminForm';
import { adminColumns } from './AdminColumns';

interface InviteAdmintModalProps {
  refetch: () => void;
}
const CreateDiscountModal = ({ refetch }: InviteAdmintModalProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const onSuccess = async () => {
    setIsModalOpen(false);
    await refetch();
  };

  const { form, submit } = useAdminForm(onSuccess);

  const handleSubmit = async () => {
    await submit();
  };

  return (
    <div className="px-4 py-2">
      <Modal
        modalTitle="Invite Admin"
        trigger={<Button variant={'primaryGradient'}>Invite Admin</Button>}
        modalFooter={
          <Button onClick={handleSubmit} type="submit" className="w-full" variant={'primaryGradient'}>
            Submit
          </Button>
        }
        visible={isModalOpen}
        onOpenChange={setIsModalOpen}
      >
        <FormProvider {...form}>
          <main className="w-full flex flex-col gap-2">
            <FormItem name="email">
              {({ field }) => (
                <div className="flex flex-col gap-1">
                  <FormLabel>Email</FormLabel>
                  <Input type="email" className="" {...field} />
                  <FormError />
                </div>
              )}
            </FormItem>
            <FormItem name="firstName">
              {({ field }) => (
                <div className="flex flex-col gap-1">
                  <FormLabel>First Name</FormLabel>
                  <Input type="text" className="" {...field} />
                  <FormError />
                </div>
              )}
            </FormItem>
            <FormItem name="lastName">
              {({ field }) => (
                <div className="flex flex-col gap-1">
                  <FormLabel>Last Name</FormLabel>
                  <Input type="text" className="" {...field} />
                  <FormError />
                </div>
              )}
            </FormItem>
            <FormItem name="position">
              {({ field }) => (
                <div className="flex flex-col gap-1">
                  <FormLabel>Position</FormLabel>
                  <Input type="text" className="" {...field} />
                  <FormError />
                </div>
              )}
            </FormItem>
            <FormItem name="address">
              {({ field }) => (
                <div className="flex flex-col gap-1">
                  <FormLabel>Address</FormLabel>
                  <Input type="text" className="" {...field} />
                  <FormError />
                </div>
              )}
            </FormItem>
            <FormItem name="contactNumber">
              {({ field }) => (
                <div className="flex flex-col gap-1">
                  <FormLabel>Contact Number</FormLabel>
                  <Input type="text" className="" {...field} />
                  <FormError />
                </div>
              )}
            </FormItem>
          </main>
        </FormProvider>
      </Modal>
    </div>
  );
};

const AdminAuthority: FC = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const isSuperAdmin = getCookie('_is_super_admin');
    if (!isSuperAdmin) {
      navigate('/admin/events');
    }
  }, []);

  const { data: response, isFetching, refetch } = useApiQuery(getAllAdmins());

  if (isFetching) {
    const colCount = 6;
    const rowCount = 15;
    return (
      <div className="flex flex-col items-center gap-2 py-10 px-4">
        <h2>Admins</h2>
        <CreateDiscountModal refetch={refetch} />
        <Skeleton className="h-9 w-36 self-start" />
        <div className="rounded-md border w-full">
          {Array.from(Array(rowCount)).map((_, index) => (
            <div key={index} className="grid grid-cols-6 gap-3 w-full py-4 px-2">
              {Array.from(Array(colCount)).map((_, index) => (
                <Skeleton className="w-full h-5" key={index} />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!response || (response && !response.data)) {
    return (
      <div className="flex flex-col items-center">
        <h1>No Admins found</h1>
      </div>
    );
  }

  const admins = response.data;

  return (
    <section className="flex flex-col items-center py-10 px-4">
      <h2>Admins</h2>
      <CreateDiscountModal refetch={refetch} />
      <DataTable columns={adminColumns(refetch)} data={admins} />
    </section>
  );
};

const AdminAuthorityPage = () => {
  return <AdminAuthority />;
};

export default AdminAuthorityPage;
