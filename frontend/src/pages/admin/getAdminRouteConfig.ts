import { UserGroup } from '@/model/auth';

export interface AdminRouteConfigProps {
  optionName: string;
  iconName: string;
  route?: string;
  location: 'upper' | 'lower';
  selected?: boolean;
  visible?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

interface Props {
  eventId?: string;
  isCreateEventOpen: boolean;
  pathname: string;
  userGroups?: UserGroup[];
  toggleCreateEvent: () => void;
  setLogoutOpen: (open: boolean) => void;
}

export const getAdminRouteConfig = ({
  eventId = '',
  isCreateEventOpen,
  pathname,
  userGroups,
  toggleCreateEvent,
  setLogoutOpen
}: Props): AdminRouteConfigProps[] => {
  return [
    {
      optionName: 'Dashboard',
      iconName: 'House',
      route: '/admin/events',
      location: 'upper'
    },
    {
      optionName: 'Create event',
      iconName: 'Plus',
      visible: !eventId && pathname !== '/admin/authority',
      onClick: toggleCreateEvent,
      selected: isCreateEventOpen,
      location: 'upper'
    },
    {
      optionName: 'Info',
      iconName: 'Info',
      visible: !!eventId,
      route: `/admin/events/${eventId}/`,
      location: 'upper'
    },
    {
      optionName: 'Registrations',
      iconName: 'User',
      visible: !!eventId,
      route: `/admin/events/${eventId}/registrations`,
      location: 'upper'
    },
    {
      optionName: 'Discounts',
      iconName: 'Tag',
      visible: !!eventId,
      route: `/admin/events/${eventId}/discounts`,
      location: 'upper'
    },
    {
      optionName: 'Evaluations',
      iconName: 'Clipboard',
      visible: !!eventId,
      route: `/admin/events/${eventId}/evaluations`,
      location: 'upper'
    },
    {
      optionName: 'Admins',
      iconName: 'Users',
      visible: userGroups && userGroups.includes('super_admin'),
      route: `/admin/authority`,
      location: 'lower'
    },
    {
      optionName: 'Sign out',
      iconName: 'SignOut',
      location: 'lower',
      onClick: () => setLogoutOpen(true)
    }
  ];
};
