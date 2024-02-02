import EventCardSkeleton from '@/components/EventCard/EventCardSkeleton';
import Skeleton from '@/components/Skeleton';

const AdminAllEventsPageSkeleton = () => {
  return (
    <div className="space-y-6">
      <Skeleton className="w-60 h-6" />

      <Skeleton className="w-28 h-6" />

      <div className="space-y-4">
        <Skeleton className="w-60 h-5" />

        <div className="flex flex-wrap justify-center sm:justify-normal px-7 sm:px-0 gap-x-4 gap-y-4">
          <EventCardSkeleton />
          <EventCardSkeleton />
          <EventCardSkeleton />
          <EventCardSkeleton />
          <EventCardSkeleton />
        </div>
      </div>

      <div className="space-y-4">
        <Skeleton className="w-60 h-5" />

        <div className="flex flex-wrap justify-center sm:justify-normal px-7 sm:px-0 gap-x-4 gap-y-4">
          <EventCardSkeleton />
          <EventCardSkeleton />
          <EventCardSkeleton />
          <EventCardSkeleton />
        </div>
      </div>
    </div>
  );
};

export default AdminAllEventsPageSkeleton;
