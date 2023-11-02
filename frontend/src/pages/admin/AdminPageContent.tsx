import { Outlet as AdminPageRoute, Navigate } from 'react-router-dom';
import { useIsAuthenticated } from 'react-auth-kit';
import AdminPageHeader from './AdminPageHeader';

const AdminPageContent = () => {
  const isAuthenticated = useIsAuthenticated();
  if (!isAuthenticated()) {
    return <Navigate to="/admin/login" />;
  }

  return (
    <div className="w-full h-full">
      <AdminPageHeader />
      <AdminPageRoute />
    </div>
  );
};

export default AdminPageContent;
