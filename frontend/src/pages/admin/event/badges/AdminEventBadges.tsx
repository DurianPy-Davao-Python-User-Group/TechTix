import { FC, useCallback } from 'react';
import { fetchAuthSession } from 'aws-amplify/auth';
import useAdminEvent from '@/hooks/useAdminEvent';
import { RemoteLoader } from '@/microfrontend/RemoteLoader';
import { useDiscovery } from '@/microfrontend/useDiscovery';
import { useQueryClient } from '@tanstack/react-query';

const AdminEventBadges: FC = () => {
  const { event, refetchEvent } = useAdminEvent();
  const queryClient = useQueryClient();
  const discovery = useDiscovery();

  const getToken = useCallback(async () => {
    try {
      const session = await fetchAuthSession();
      return session?.tokens?.accessToken?.toString();
    } catch (err) {
      console.error('Failed to fetch auth session token for badges:', err);
      return undefined;
    }
  }, []);

  const adminRemote = discovery.remotes['badge-service-admin-ui'];

  return (
    <div className="w-full">
      <RemoteLoader
        remote={adminRemote}
        mfeProps={{
          event,
          refetchEvent,
          getToken,
          queryClient,
          basePath: event?.eventId ? `/events/${event.eventId}/badges` : undefined
        }}
      />
    </div>
  );
};

export default AdminEventBadges;
