import { FC, useState } from 'react';
import { Event } from '@/model/events';
import { RemoteLoader } from '@/microfrontend/RemoteLoader';
import { useDiscovery } from '@/microfrontend/useDiscovery';

const mockEvent: Event = {
  eventId: 'evt-pycon-2026',
  name: 'PyCon Davao 2026',
  description: 'Annual Python Community Conference in Davao City',
  email: 'team@durianpy.org',
  startDate: '2026-05-01',
  endDate: '2026-05-03',
  venue: 'SMX Convention Center Davao',
  paidEvent: false,
  price: 0,
  bannerLink: null,
  logoLink: null,
  certificateTemplate: null,
  status: 'open',
  isLimitedSlot: false,
  isApprovalFlow: false,
  registrationCount: 150,
  maximumSlots: 300,
  hasMultipleTicketTypes: false,
  ticketTypes: [],
  platformFee: 0,
  sprintDay: false,
  sprintDayPrice: 0,
  sprintDayRegistrationCount: 0,
  maximumSprintDaySlots: 0
};

export const AdminBadgePreviewPage: FC = () => {
  const [withEvent, setWithEvent] = useState(true);
  const discovery = useDiscovery();
  const adminRemote = discovery.remotes['badge-service-admin-ui'];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-4">
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div>
          <h1 className="text-xl font-bold">TechTix Host — Badge Admin MFE Integration Preview</h1>
          <p className="text-xs text-muted-foreground">Validates AdminApp loading via @module-federation/runtime with event context and router state.</p>
        </div>
        <button
          id="toggle-event-context-btn"
          onClick={() => setWithEvent((prev) => !prev)}
          className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg font-medium cursor-pointer shadow hover:opacity-90"
        >
          Toggle Context: {withEvent ? 'Active Event' : 'No Context Fallback'}
        </button>
      </div>
      <RemoteLoader
        remote={adminRemote}
        mfeProps={{
          event: withEvent ? mockEvent : undefined,
          refetchEvent: withEvent ? () => {} : undefined,
          basePath: '/preview/badges'
        }}
      />
    </div>
  );
};

export const Component = AdminBadgePreviewPage;
export default AdminBadgePreviewPage;
