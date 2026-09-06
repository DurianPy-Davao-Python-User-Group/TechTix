import { FC, ReactNode } from 'react';
import moment from 'moment';
import Icon from '@/components/Icon';
import RichTextContent from '@/components/RichContent/RichTextContent';
import { Event } from '@/model/events';
import { formatMoney } from '@/utils/functions';
import { useFileUrl } from '@/hooks/useFileUrl';

export const REGISTER_BUTTON_ID = 'REGISTER_BUTTON';

interface Props {
  event: Event;
  registerButton?: ReactNode;
}

const EventDetails: FC<Props> = ({
  event: { eventId, name, description, venue, status, startDate, endDate, paidEvent, price, hasMultipleTicketTypes, ticketTypes, logoLink, bannerLink },
  registerButton
}) => {
  const isSameDayEvent = moment(startDate).isSame(endDate, 'day');
  const getDate = () => {
    if (isSameDayEvent) {
      return `${moment(startDate).format('MMMM Do YYYY, h:mm A')} - ${moment(endDate).format('LT')}`;
    }
    return `${moment(startDate).format('MMMM Do YYYY, h:mm A')} - ${moment(endDate).format('MMMM Do YYYY')}`;
  };

  const eventPrice = hasMultipleTicketTypes && ticketTypes ? Math.min(...ticketTypes.map((x) => x.price)) : price;

  const { fileUrl: bannerUrl } = useFileUrl(eventId, bannerLink);
  const { fileUrl: logoUrl } = useFileUrl(eventId, logoLink);

  return (
    <section className="flex flex-col items-center max-w-3xl p-2 mx-auto text-pycon-dark-blue font-inter">
      {logoLink && <img src={logoUrl} className="w-16 h-16 rounded-full overflow-hidden mb-2" alt="" />}
      {bannerLink && <div className="h-60 my-4 w-fit">{<img className="max-h-60 rounded-2xl object-cover shadow-xs" src={bannerUrl} alt="" />}</div>}
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-pycon-orange! font-sora tracking-tight leading-tight w-full mb-4 text-left">{name}</h1>

      <div className="w-full grid grid-cols-[auto_1fr] text-pycon-dark-blue justify-center items-center gap-x-3.5 gap-y-2.5 font-inter">
        <Icon name="Clock" size={18} className="col-span-1 text-pycon-teal" />
        <p className="text-sm sm:text-base col-span-1 font-inter font-medium text-pycon-dark-blue/80">{getDate()}</p>

        <Icon name="MapPin" size={18} className="col-span-1 text-pycon-teal" />
        <p className="text-sm sm:text-base col-span-1 font-inter font-medium text-pycon-dark-blue/80">{venue}</p>

        {paidEvent && status !== 'completed' && (
          <>
            <Icon name="Banknote" size={18} className="col-span-1 text-pycon-teal" />
            <p className="text-sm sm:text-base col-span-1 font-inter font-medium text-pycon-dark-blue/80">{formatMoney(eventPrice, 'PHP')}</p>
          </>
        )}
      </div>

      {registerButton ?? <div id={REGISTER_BUTTON_ID} />}

      {description && (
        <article className="w-full mt-8 text-left rounded-3xl sm:rounded-[2.5rem] bg-white/80 sm:bg-white/85 backdrop-blur-md border border-[#F995081F] p-6 sm:p-8 md:p-10 shadow-[0px_6px_40px_0px_#F9950812]">
          <h2 className="font-sora text-pycon-dark-blue! text-xl sm:text-2xl mb-3 font-bold">About the event</h2>
          <RichTextContent className="font-inter! text-pycon-dark-blue/80 leading-relaxed" content={description} />
        </article>
      )}
    </section>
  );
};

export default EventDetails;
