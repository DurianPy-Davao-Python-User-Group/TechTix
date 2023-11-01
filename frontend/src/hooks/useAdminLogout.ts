import { useNavigate } from 'react-router-dom';
import { useSignOut } from 'react-auth-kit';
import { getCookie, removeCookie } from 'typescript-cookie';
import { logoutUser } from '@/api/auth';
import { CustomAxiosError } from '@/api/utils/createApi';
import { useNotifyToast } from './useNotifyToast';

export const useAdminLogout = () => {
  const { errorToast } = useNotifyToast();
  const navigate = useNavigate();
  const signOut = useSignOut();

  const onLogoutAdmin = async () => {
    try {
      const accessToken = getCookie('_auth')!;
      const { queryFn: logOut } = logoutUser(accessToken);
      const response = await logOut();
      if (response) {
        signOut();
        removeCookie('_auth_user');
        navigate('/admin/login');
      }
    } catch (e) {
      const { errorData } = e as CustomAxiosError;
      console.error(errorData.message || errorData.detail[0].msg);
      errorToast({
        title: 'Retry logging out',
        description: 'An error occured. Please try logging out again'
      });
    }
  };

  return { onLogoutUser: onLogoutAdmin };
};
