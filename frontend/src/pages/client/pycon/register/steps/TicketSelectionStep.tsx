import { FC, useEffect } from 'react';
import checkmarkIcon from '@/assets/Checkmark.svg';
import { FormError, FormItem, FormLabel } from '@/components/Form';
import Label from '@/components/Label';
import { RadioGroup, RadioGroupItem } from '@/components/RadioGroup';
import { Event } from '@/model/events';
import { cn } from '@/utils/classes';
import { formatMoney, formatPercentage } from '@/utils/functions';

interface Props {
  event: Event;
  updateEventPrice: (newPrice: number) => void;
}

type EventTicketType = NonNullable<Event['ticketTypes']>[number];

const CODER_BENEFITS = [
  'Lunch',
  'Snack',
  'Kit — Lanyard + ID',
  'Special Merch',
  'Stickers',
  'Workshops',
  'Talks',
  'Panel Discussions',
  'Open Spaces'
];

const KASOSYO_BENEFITS = [
  'Lunch',
  'Snack',
  'Kit — Lanyard + ID',
  'Special Merch',
  'Stickers',
  'Special Metalic Pin',
  'Workshops',
  'Talks',
  'Panel Discussions',
  'Open Spaces',
  'Kasosyo Night'
];

const KASOSYO_ACCENT_COLOR = '#38A69D';
const ORANGE_ACCENT_COLOR = '#F99508';

const getTicketSoldOutState = (ticketType?: EventTicketType) => {
  if (!ticketType?.maximumQuantity) return false;
  return (ticketType.currentSales ?? 0) >= ticketType.maximumQuantity;
};

const TicketSelectionStep = ({ event, updateEventPrice }: Props) => {
  const coderTicket = event.ticketTypes?.find((t) => t.id === 'coder');
  const kasosyoTicket = event.ticketTypes?.find((t) => t.id === 'kasosyo');

  const sprintDayPrice = event.sprintDayPrice ?? 200;
  const sprintIsSoldOut =
    event.maximumSprintDaySlots != null && event.sprintDayRegistrationCount >= event.maximumSprintDaySlots;

  return (
    <div
      className={cn(
        'mx-auto flex w-full max-w-[90%] flex-col gap-4 px-6 md:gap-6',
        'rounded-3xl border border-[#F995081F] bg-white py-6 shadow-[0px_6px_40px_0px_#F9950812]',
        'md:rounded-none md:border-0 md:bg-transparent md:py-0 md:shadow-none'
      )}
    >

      <FormItem name="ticketType">
        {({ field }) => (
          <section className="flex flex-col gap-3 md:gap-4">
            <FormLabel className="font-inter text-xs font-extrabold uppercase tracking-[0.15em] text-[#072E474D]">
              Ticket Type
            </FormLabel>

            <div className="flex w-full flex-col gap-4">
              <TicketCard
                title="Coder"
                subtitle="Regular"
                ticketId={coderTicket?.id}
                price={coderTicket?.price ?? 0}
                originalPrice={coderTicket?.originalPrice}
                benefits={CODER_BENEFITS}
                backgroundClass="bg-[#5DA144]"
                selectedBorderColor={ORANGE_ACCENT_COLOR}
                isSelected={!!coderTicket && field.value === coderTicket.id}
                isSoldOut={getTicketSoldOutState(coderTicket)}
                onSelect={() => {
                  if (!coderTicket) return;
                  field.onChange(coderTicket.id);
                  updateEventPrice(coderTicket.price);
                }}
              />

              <TicketCard
                title="Kasosyo"
                subtitle="Patron"
                ticketId={kasosyoTicket?.id}
                price={kasosyoTicket?.price ?? 0}
                originalPrice={kasosyoTicket?.originalPrice}
                benefits={KASOSYO_BENEFITS}
                star
                bestValue
                backgroundClass="bg-[#38A69D]"
                selectedBorderColor={ORANGE_ACCENT_COLOR}
                isSelected={!!kasosyoTicket && field.value === kasosyoTicket.id}
                isSoldOut={getTicketSoldOutState(kasosyoTicket)}
                onSelect={() => {
                  if (!kasosyoTicket) return;
                  field.onChange(kasosyoTicket.id);
                  updateEventPrice(kasosyoTicket.price);
                }}
              />

              <FormItem name="sprintDay">
                {({ field: sprintDayField }) => (
                  <TicketCard
                    title="Extra"
                    subtitle="Sprint Day"
                    ticketId="sprintDay"
                    price={sprintDayPrice}
                    benefits={['Sprint Day']}
                    backgroundClass="bg-[#F99508]"
                    selectedBorderColor={KASOSYO_ACCENT_COLOR}
                    isSelected={sprintDayField.value === true}
                    isSoldOut={sprintIsSoldOut}
                    onSelect={() => {
                      if (sprintIsSoldOut) return;
                      sprintDayField.onChange(!sprintDayField.value);
                    }}
                  />
                )}
              </FormItem>
            </div>

            <FormError />
          </section>
        )}
      </FormItem>


      <div className="border-t border-[#F995081F] pt-4 md:pt-6">
        <FormItem name="sprintDay">
          {({ field }) => (
            <SprintDaySection
              value={field.value}
              sprintDayPrice={sprintDayPrice}
              maximumSprintDaySlots={event.maximumSprintDaySlots}
              sprintDayRegistrationCount={event.sprintDayRegistrationCount}
              onChange={field.onChange}
            />
          )}
        </FormItem>
      </div>
    </div>
  );
};

interface TicketCardProps {
  title: string;
  subtitle: string;
  ticketId?: string;
  price: number;
  originalPrice?: number | null;
  benefits: string[];
  backgroundClass: string;
  selectedBorderColor: string;
  star?: boolean;
  bestValue?: boolean;
  isSelected?: boolean;
  isSoldOut?: boolean;
  onSelect?: () => void;
}

const TicketCard: FC<TicketCardProps> = ({
  title,
  subtitle,
  ticketId,
  price,
  originalPrice,
  benefits,
  backgroundClass,
  selectedBorderColor,
  star = false,
  bestValue = false,
  isSelected = false,
  isSoldOut = false,
  onSelect
}) => {
  const isUnavailable = !ticketId || isSoldOut;
  const canSelect = !!onSelect && !isUnavailable;
  const hasDiscount = originalPrice != null && price < originalPrice;

  const handleSelect = () => {
    if (!canSelect) return;
    onSelect?.();
  };

  return (
    <div
      role={canSelect ? 'radio' : undefined}
      aria-checked={canSelect ? isSelected : undefined}
      aria-disabled={isUnavailable || undefined}
      tabIndex={canSelect ? 0 : undefined}
      onClick={handleSelect}
      onKeyDown={(e) => {
        if (!canSelect || (e.key !== 'Enter' && e.key !== ' ')) return;
        e.preventDefault();
        handleSelect();
      }}
      style={isSelected ? { borderColor: selectedBorderColor } : undefined}
      className={cn(
        'flex w-full flex-col rounded-[22px] border-[3px] border-transparent p-5 text-white',
        'font-inter transition-[border-color,box-shadow] duration-200',
        backgroundClass,
        canSelect && 'cursor-pointer hover:brightness-105',
        isUnavailable && 'cursor-not-allowed opacity-60 grayscale'
      )}
    >

      <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1 sm:justify-start">
        <span className="inline-flex items-baseline gap-x-2">
          {star && <span className="text-lg leading-none">★</span>}
          <span className="font-inter text-2xl font-black uppercase leading-tight tracking-wide">{title}</span>
        </span>

        <span className="font-inter text-sm font-medium leading-tight opacity-75">
          ({subtitle}) — {formatMoney(price, 'PHP')}
        </span>
      </div>


      {hasDiscount && (
        <div className="mt-1 font-inter text-sm font-medium">
          <span className="text-gray-300 line-through">{formatMoney(originalPrice!, 'PHP')}</span>{' '}
          <span className="text-green-300">{formatPercentage(1 - price / originalPrice!)} off</span>
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1.5">
        {benefits.map((benefit) => (
          <TicketBenefit key={benefit} benefit={benefit} />
        ))}
      </div>

      <div className="mt-6 grid grid-cols-2 items-end">
        <div>
          {isSelected && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2D1B4E] px-4 py-1.5 font-inter text-xs font-extrabold uppercase tracking-wide text-white">
              <img src={checkmarkIcon} alt="" aria-hidden="true" className="h-3 w-3" />
              Selected
            </span>
          )}
        </div>

        <div className="justify-self-end">
          {bestValue && (
            <span className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/20 px-5 py-2 font-inter text-xs font-extrabold uppercase tracking-wide">
              Best Value
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

interface TicketBenefitProps {
  benefit: string;
}

const TicketBenefit: FC<TicketBenefitProps> = ({ benefit }) => {
  return (
    <div className="flex min-w-0 items-start gap-1.5">
      <img src={checkmarkIcon} alt="" aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <span className="font-inter text-sm font-medium leading-snug">{benefit}</span>
    </div>
  );
};

interface SprintDaySectionProps {
  value: boolean | undefined;
  sprintDayPrice: number;
  maximumSprintDaySlots?: number | null;
  sprintDayRegistrationCount: number;
  onChange: (selected: boolean) => void;
}

const SprintDaySection: FC<SprintDaySectionProps> = ({
  value,
  sprintDayPrice,
  maximumSprintDaySlots,
  sprintDayRegistrationCount,
  onChange
}) => {
  const sprintIsSoldOut = maximumSprintDaySlots != null && sprintDayRegistrationCount >= maximumSprintDaySlots;

  useEffect(() => {
    if (sprintIsSoldOut && value === true) {
      onChange(false);
    }
  }, [value, onChange, sprintIsSoldOut]);


  const radioValue = value === undefined ? undefined : value ? 'yes' : 'no';

  const displayPrice = `₱ ${new Intl.NumberFormat('en-PH', { maximumFractionDigits: 2 }).format(sprintDayPrice)}`;

  return (
    <section className="flex flex-col gap-3 md:gap-4">
      <FormLabel className="font-inter text-xs font-extrabold uppercase tracking-[0.15em] text-[#072E474D]">Add-Ons</FormLabel>

      <div
        className={cn(
          'relative flex w-full flex-col gap-4 rounded-2xl bg-[#FFF9F2] p-5',
          sprintIsSoldOut && 'opacity-60'
        )}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
          <div>
            <p className="font-inter text-base font-bold text-[#072E47]">Join Sprint Day</p>
            <p className="font-inter text-sm italic text-[#072E4799]">Sprint Day is on October 18, 2026 (2nd Day).</p>
          </div>

          <span className="w-full rounded-full bg-[#F995081A] px-4 py-2 text-center font-inter text-sm font-extrabold text-[#F99508] sm:hidden">
            {displayPrice}
          </span>


          <span className="hidden shrink-0 rounded-full bg-[#F995081A] px-3 py-1.5 font-inter text-sm font-extrabold text-[#F99508] sm:inline-flex">
            {displayPrice}
          </span>
        </div>

        <RadioGroup
          value={radioValue}
          onValueChange={(val) => {
            if (sprintIsSoldOut) return;
            onChange(val === 'yes');
          }}
          className="flex flex-wrap items-center gap-x-6 gap-y-3"
        >
          <div className="flex items-center gap-2.5">
            <RadioGroupItem
              pyconStyles
              value="yes"
              id="sprintDay-yes"
              disabled={sprintIsSoldOut}
              className="h-5 w-5 border-2 border-[#7681B666] text-[#04B1A4] data-[state=checked]:border-[#04B1A4]"
            />
            <Label htmlFor="sprintDay-yes" className="font-inter text-sm font-medium text-[#072E47]">
              Yes, I&apos;ll join
            </Label>
          </div>

          <div className="flex items-center gap-2.5">
            <RadioGroupItem
              pyconStyles
              value="no"
              id="sprintDay-no"
              disabled={sprintIsSoldOut}
              className="h-5 w-5 border-2 border-[#7681B666] text-[#04B1A4] data-[state=checked]:border-[#04B1A4]"
            />
            <Label htmlFor="sprintDay-no" className="font-inter text-sm font-medium text-[#072E47]">
              No thanks
            </Label>
          </div>
        </RadioGroup>
      </div>

      <FormError />
    </section>
  );
};

export default TicketSelectionStep;