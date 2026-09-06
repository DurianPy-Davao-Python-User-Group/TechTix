import { FC, useEffect } from 'react';
import { Calendar, Check, Coffee, Plus, Star, Users, X, Zap } from 'lucide-react';
import checkmarkIcon from '@/assets/Checkmark.svg';
import { FormError, FormItem, FormLabel } from '@/components/Form';
import { Event } from '@/model/events';
import { cn } from '@/utils/classes';
import { formatMoney, formatPercentage } from '@/utils/functions';

interface Props {
  event: Event;
  updateEventPrice: (newPrice: number) => void;
}

type EventTicketType = NonNullable<Event['ticketTypes']>[number];

export interface TicketBenefitItem {
  label: string;
  included?: boolean;
}

const CODER_BENEFITS: TicketBenefitItem[] = [
  { label: 'Lunch', included: true },
  { label: 'Snack', included: true },
  { label: 'Kit — Lanyard + ID', included: true },
  { label: 'Special Merch', included: true },
  { label: 'Stickers', included: true },
  { label: 'Workshops', included: true },
  { label: 'Talks', included: true },
  { label: 'Panel Discussions', included: true },
  { label: 'Open Spaces', included: true },
  { label: 'Special Metallic Pin', included: false },
  { label: 'Kasosyo Night with Speakers & Volunteers', included: false }
];

const KASOSYO_BENEFITS: TicketBenefitItem[] = [
  { label: 'Lunch', included: true },
  { label: 'Snack', included: true },
  { label: 'Kit — Lanyard + ID', included: true },
  { label: 'Special Merch', included: true },
  { label: 'Stickers', included: true },
  { label: 'Special Metallic Pin', included: true },
  { label: 'Workshops', included: true },
  { label: 'Talks', included: true },
  { label: 'Panel Discussions', included: true },
  { label: 'Open Spaces', included: true },
  { label: 'Kasosyo Night with Speakers & Volunteers', included: true }
];

const ORANGE_ACCENT_COLOR = '#F99508';

const getTicketSoldOutState = (ticketType?: EventTicketType) => {
  if (!ticketType?.maximumQuantity) return false;
  return (ticketType.currentSales ?? 0) >= ticketType.maximumQuantity;
};

const TicketSelectionStep = ({ event, updateEventPrice }: Props) => {
  const coderTicket = event.ticketTypes?.find((t) => t.id === 'coder');
  const kasosyoTicket = event.ticketTypes?.find((t) => t.id === 'kasosyo');

  const sprintDayPrice = event.sprintDayPrice ?? 200;

  return (
    <div
      className={cn(
        'mx-auto flex w-full max-w-3xl flex-col gap-5 px-3 sm:px-6 md:gap-8',
        'rounded-3xl border border-[#F995081F] bg-white py-5 sm:py-6 shadow-[0px_6px_40px_0px_#F9950812]',
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
                bestValue
                backgroundClass="bg-gradient-to-br from-[#5DA144] to-[#4b8935]"
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
                backgroundClass="bg-gradient-to-br from-[#38A69D] to-[#25857d]"
                selectedBorderColor={ORANGE_ACCENT_COLOR}
                isSelected={!!kasosyoTicket && field.value === kasosyoTicket.id}
                isSoldOut={getTicketSoldOutState(kasosyoTicket)}
                onSelect={() => {
                  if (!kasosyoTicket) return;
                  field.onChange(kasosyoTicket.id);
                  updateEventPrice(kasosyoTicket.price);
                }}
              />
            </div>

            <FormError />
          </section>
        )}
      </FormItem>

      <div className="border-t border-[#F995081F] pt-6 md:pt-8">
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
  benefits: (TicketBenefitItem | string)[];
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
        'group relative flex w-full flex-col rounded-[22px] border-[3px] p-4 sm:p-6 text-white',
        'font-inter transition-all duration-300 ease-out',
        backgroundClass,
        canSelect &&
          'cursor-pointer hover:-translate-y-1 hover:scale-[1.015] hover:shadow-2xl hover:brightness-105 active:scale-[0.99] active:translate-y-0',
        isSelected
          ? 'border-[#F99508] shadow-2xl shadow-black/25 ring-4 ring-[#F99508]/30 -translate-y-0.5'
          : 'border-transparent shadow-md hover:shadow-xl',
        isUnavailable && 'cursor-not-allowed opacity-60 grayscale'
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1.5">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <span className="inline-flex items-center gap-x-1.5">
            {star && <Star className="h-4 w-4 sm:h-5 sm:w-5 fill-current text-current animate-pulse shrink-0" />}
            <span className="font-inter text-xl sm:text-2xl font-black uppercase leading-tight tracking-wide">{title}</span>
          </span>

          <span className="font-inter text-xs sm:text-sm font-medium leading-tight opacity-85">
            ({subtitle})
          </span>
        </div>

        <div className="flex flex-col items-start sm:items-end shrink-0 whitespace-nowrap text-left sm:text-right">
          <span className="font-inter text-base sm:text-lg font-bold leading-tight">
            {formatMoney(price, 'PHP')}
          </span>
          {hasDiscount && (
            <div className="mt-0.5 font-inter text-xs font-medium whitespace-nowrap">
              <span className="text-gray-300 line-through mr-1.5">{formatMoney(originalPrice!, 'PHP')}</span>
              <span className="text-green-300 font-bold">{formatPercentage(1 - price / originalPrice!)} off</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 min-[360px]:grid-cols-2 gap-x-3 gap-y-2 sm:gap-x-4">
        {benefits.map((benefit, idx) => (
          <TicketBenefit key={typeof benefit === 'string' ? benefit : `${benefit.label}-${idx}`} benefit={benefit} />
        ))}
      </div>

      {bestValue && (
        <div className="mt-3 flex justify-end">
          <span className="inline-flex items-center justify-center rounded-full bg-[#F27B12] px-3.5 py-1 font-inter text-[11px] font-extrabold uppercase tracking-wider text-white shadow-xs">
            Best Value
          </span>
        </div>
      )}

      <div className={cn('flex items-center justify-start', bestValue ? 'mt-2' : 'mt-4 sm:mt-5')}>
        <div>
          {isSelected ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#072E47] px-4 py-1.5 font-inter text-xs font-extrabold uppercase tracking-wide text-white shadow-md animate-in fade-in zoom-in-95 duration-200">
              <img src={checkmarkIcon} alt="" aria-hidden="true" className="h-3 w-3" />
              Selected
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1.5 font-inter text-xs font-semibold tracking-wide text-white/80 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              Click to select
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

interface TicketBenefitProps {
  benefit: TicketBenefitItem | string;
}

const TicketBenefit: FC<TicketBenefitProps> = ({ benefit }) => {
  const item: TicketBenefitItem = typeof benefit === 'string' ? { label: benefit, included: true } : benefit;
  const isIncluded = item.included !== false;

  return (
    <div className={cn('flex min-w-0 items-start gap-1.5', !isIncluded && 'opacity-55')}>
      {isIncluded ? (
        <img src={checkmarkIcon} alt="" aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      ) : (
        <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white/80 stroke-[2.5]" aria-hidden="true" />
      )}
      <span className={cn('font-inter text-xs sm:text-sm font-medium leading-snug break-words', !isIncluded && 'line-through decoration-white/40')}>
        {item.label}
      </span>
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
  const isSelected = value === true;

  useEffect(() => {
    if (sprintIsSoldOut && value === true) {
      onChange(false);
    }
  }, [value, onChange, sprintIsSoldOut]);

  const displayPrice = `₱ ${new Intl.NumberFormat('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(sprintDayPrice)}`;

  return (
    <section className="flex flex-col gap-3 md:gap-4">
      <FormLabel className="font-inter text-xs font-extrabold uppercase tracking-[0.15em] text-[#072E474D]">
        Add-Ons
      </FormLabel>

      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 fill-[#F99508] text-[#F99508]" />
          <h3 className="font-sora text-xl font-bold text-[#04B1A4] md:text-2xl">Add Sprint Day</h3>
        </div>
        <p className="font-inter text-sm text-[#072E4799]">
          Enhance your conference experience with hands-on coding
        </p>
      </div>

      <div
        role="checkbox"
        aria-checked={isSelected}
        aria-disabled={sprintIsSoldOut || undefined}
        tabIndex={sprintIsSoldOut ? -1 : 0}
        onClick={() => {
          if (sprintIsSoldOut) return;
          onChange(!isSelected);
        }}
        onKeyDown={(e) => {
          if (sprintIsSoldOut || (e.key !== 'Enter' && e.key !== ' ')) return;
          e.preventDefault();
          onChange(!isSelected);
        }}
        className={cn(
          'group relative flex w-full flex-col rounded-[22px] border-[3px] p-4 sm:p-6 font-inter bg-[#FDDEB2] transition-all duration-300 ease-out',
          !sprintIsSoldOut &&
            'cursor-pointer hover:-translate-y-1 hover:scale-[1.015] hover:shadow-xl active:scale-[0.99] active:translate-y-0',
          isSelected
            ? 'border-[#F99508] shadow-xl shadow-black/10 ring-4 ring-[#F99508]/20 -translate-y-0.5'
            : 'border-[#072E4718] shadow-sm hover:border-[#F99508]/40 hover:shadow-md',
          sprintIsSoldOut && 'cursor-not-allowed opacity-60 grayscale'
        )}
      >
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-[#072E47] shrink-0" />
            <h4 className="font-sora text-lg sm:text-xl font-bold text-[#072E47] md:text-2xl">Join Sprint Day</h4>
            <span className="rounded-full bg-[#F99508] px-2.5 py-0.5 font-inter text-xs font-bold text-white shrink-0">
              {displayPrice}
            </span>
          </div>

          <p className="text-xs italic text-[#072E47]/75">
            Sprint Day is on October 18, 2026 (2nd Day).
          </p>
        </div>

        <div className="mt-4 grid grid-cols-1 min-[360px]:grid-cols-2 gap-x-3 gap-y-2.5 sm:gap-x-4">
          <div className="flex min-w-0 items-start gap-2">
            <Users className="mt-0.5 h-4 w-4 text-[#072E47]/70 shrink-0" />
            <span className="font-inter text-xs sm:text-sm font-medium leading-snug text-[#072E47] break-words">
              Collaborative coding
            </span>
          </div>
          <div className="flex min-w-0 items-start gap-2">
            <Coffee className="mt-0.5 h-4 w-4 text-[#072E47]/70 shrink-0" />
            <span className="font-inter text-xs sm:text-sm font-medium leading-snug text-[#072E47] break-words">
              Refreshments included
            </span>
          </div>
          <div className="flex min-w-0 items-start gap-2">
            <Zap className="mt-0.5 h-4 w-4 text-[#072E47]/70 shrink-0" />
            <span className="font-inter text-xs sm:text-sm font-medium leading-snug text-[#072E47] break-words">
              Open source projects
            </span>
          </div>
          <div className="flex min-w-0 items-start gap-2">
            <Check className="mt-0.5 h-4 w-4 text-[#072E47]/70 shrink-0" />
            <span className="font-inter text-xs sm:text-sm font-medium leading-snug text-[#072E47] break-words">
              Networking opportunity
            </span>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-4">
          <div>
            {isSelected ? (
              <span className="inline-flex h-8 items-center gap-1.5 rounded-full bg-[#F99508] px-4 font-inter text-xs font-extrabold uppercase tracking-wide text-white shadow-xs transition-colors duration-150">
                <Check className="h-3.5 w-3.5 stroke-[3]" />
                Added
              </span>
            ) : sprintIsSoldOut ? (
              <span className="inline-flex h-8 items-center rounded-full bg-black/10 px-4 font-inter text-xs font-bold uppercase tracking-wide text-[#072E47]/50">
                Sold Out
              </span>
            ) : (
              <span className="inline-flex h-8 items-center gap-1.5 rounded-full border border-[#072E47]/20 bg-white/90 px-4 font-inter text-xs font-bold uppercase tracking-wide text-[#072E47] transition-colors duration-150 group-hover:border-[#F99508] group-hover:bg-white group-hover:text-[#F99508]">
                <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                Add to registration
              </span>
            )}
          </div>
        </div>
      </div>

      <FormError />
    </section>
  );
};

export default TicketSelectionStep;