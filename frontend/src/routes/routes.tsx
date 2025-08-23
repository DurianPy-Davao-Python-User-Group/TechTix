import { createBrowserRouter } from 'react-router-dom';
import ErrorPage from '@/components/ErrorPage';
import ClientPage from '@/pages/client/ClientPage';
import EvaluatePage from '@/pages/client/evaluate/EvaluatePage';
import LoginPage from '@/pages/client/login/LoginPage';
import PreRegisterPage from '@/pages/client/preregister/PreRegisterPage';
import RegisterPage from '@/pages/client/register/RegisterPage';
import Callback from './Callback';
import ClientAuthRouteLayout from './layouts/client/ClientAuthRouteLayout';
import ClientRouteLayout from './layouts/client/ClientRouteLayout';
import ClientAuthContextProvider from '@/context/ClientAuthContext';

export const routes = createBrowserRouter(
  [
    // {
    //   path: '',
    //   lazy: () => import('@/pages/landingPage/HomePage')
    // },
    // {
    //   path: '/events',
    //   lazy: () => import('@/pages/landingPage/EventsPage')
    // },
    {
      path: '/callback',
      element: <Callback />
    },

    // Client User Routes
    {
      path: '',
      element: <ClientAuthContextProvider />,
      children: [
        {
          path: '',
          element: <ClientAuthRouteLayout />,
          children: [
            {
              path: '/login',
              element: <LoginPage />
            }
          ]
        },
        {
          path: '',
          element: <ClientRouteLayout />,
          children: [
            {
              path: '/:eventId',
              element: <ClientPage />,
              children: [
                {
                  path: 'preregister',
                  element: <PreRegisterPage />
                },
                {
                  path: 'register',
                  element: <RegisterPage />
                },
                {
                  path: 'registration',
                  element: <RegisterPage />
                },
                {
                  path: 'evaluate',
                  element: <EvaluatePage />
                },
                {
                  path: '*',
                  element: ErrorPage({})
                }
              ]
            }
          ]
        }
      ]
    },

    {
      path: '*',
      element: ErrorPage({})
    }
  ],
  {
    async patchRoutesOnNavigation({ path, patch }) {
      // lazy load admin routes
      if (path.startsWith('/admin')) {
        const children = (await import('@/routes/adminRoutes')).default;
        patch(null, children);
      }
    }
  }
);
