import { FC } from 'react';
import { Check, Star, Zap, Calendar, Users, Coffee } from 'lucide-react';
import { useFormContext, useWatch } from 'react-hook-form';
import Button from '@/components/Button';
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/Card';
import { FormItem, FormLabel, FormError } from '@/components/Form';
import Label from '@/components/Label';
import { RadioGroup, RadioGroupItem } from '@/components/RadioGroup';
import { Event } from '@/model/events';
import { cn } from '@/utils/classes';
import { formatMoney, formatPercentage } from '@/utils/functions';
import { RegisterFormValues } from '../../hooks/useRegisterForm';

interface Props {
  event: Event;
  updateEventPrice: (newPrice: number) => void;
}

const shirtSizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] as const;

const TicketSelectionStep = ({ event, updateEventPrice }: Props) => {
  const shirtSizeLink = import.meta.env.VITE_COMMDAY_SHIRT_SIZE_LINK;

  const { control } = useFormContext<RegisterFormValues>();
  const [availTShirt] = useWatch({ control, name: ['availTShirt'] });

  return (
    <>
      <FormItem name="ticketType">
        {({ field }) => (
          <div className="flex flex-col gap-6">
            <div className="text-center md:text-left">
              <FormLabel className="font-nunito font-bold text-4xl text-pycon-orange mb-2 block">Ticket Types</FormLabel>
              <p className="text-pycon-custard-light text-lg font-medium">Choose your conference experience</p>
            </div>
            <div className="grid gap-6 max-w-2xl">
              {event.ticketTypes
                ?.sort((a, b) => parseInt(a.tier) - parseInt(b.tier))
                .map((ticketType) => {
                  if (ticketType.id === 'coder') {
                    return (
                      <TicketType
                        key={ticketType.id}
                        value={field.value}
                        ticketType={ticketType}
                        subtitle="Regular"
                        benefits={['All Talks & Workshops', 'Lunch & Snacks', 'Python Logo Keyboard Switch Keychain', 'Stickers & Lanyard']}
                        updateEventPrice={updateEventPrice}
                        onChange={field.onChange}
                      />
                    );
                  } else if (ticketType.id === 'kasosyo') {
                    return (
                      <TicketType
                        key={ticketType.id}
                        star
                        value={field.value}
                        ticketType={ticketType}
                        subtitle="Premium Experience"
                        backgroundClass="bg-pycon-red"
                        benefits={['Everything in Coder', 'Exclusive Kasosyo Night', 'Special Metallic Pin', 'Premium DurianPy Perks']}
                        updateEventPrice={updateEventPrice}
                        onChange={field.onChange}
                      />
                    );
                  }
                })}
            </div>
            <FormError />
          </div>
        )}
      </FormItem>

      <FormItem name="sprintDay">
        {({ field }) => (
          <SprintDaySection isSelected={!!field.value} sprintDayPrice={event.sprintDayPrice ?? 0} onChange={(selected) => field.onChange(selected)} />
        )}
      </FormItem>

      {/* {availTShirt && (
        <div className="flex flex-col md:flex-row w-full gap-4">
          <FormItem name="shirtType">
            {({ field }) => (
              <div className="flex flex-col gap-1 grow md:basis-1/2">
                <FormLabel>Shirt Type</FormLabel>
                <p className="text-pycon-custard-light text-sm">
                  To check shirt type, please refer to the{' '}
                  <a href={shirtSizeLink} className="text-pycon-orange underline" target="_blank">
                    link here
                  </a>
                  .
                </p>

                <RadioGroup onValueChange={field.onChange} value={field.value} className="flex flex-wrap gap-4 py-3">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem pyconStyles value="unisex" id={`shirtType-unisex`} />
                    <Label htmlFor={`shirtType-unisex`}>Unisex</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <RadioGroupItem pyconStyles value="female" id={`shirtType-`} />
                    <Label htmlFor={`shirtType-female`}>Female</Label>
                  </div>
                </RadioGroup>
                <FormError />
              </div>
            )}
          </FormItem>

          <FormItem name="shirtSize">
            {({ field }) => (
              <div className="flex flex-col gap-1 grow md:basis-1/2">
                <FormLabel>Shirt Size (For Pro and VIP Tickets Only)</FormLabel>
                <p className="text-pycon-custard-light text-sm">
                  To check shirt size, please refer to the{' '}
                  <a href={shirtSizeLink} className="text-pycon-orange underline" target="_blank">
                    link here
                  </a>
                  .
                </p>
                <RadioGroup onValueChange={field.onChange} value={field.value} className="flex flex-wrap gap-4 py-3">
                  {shirtSizeOptions.map((size) => (
                    <div key={size} className="flex items-center space-x-2">
                      <RadioGroupItem pyconStyles value={size} id={`size-${size}`} />
                      <Label htmlFor={`size-${size}`}>{size}</Label>
                    </div>
                  ))}
                </RadioGroup>
                <FormError />
              </div>
            )}
          </FormItem>
        </div>
      )} */}
    </>
  );
};

interface TicketTypeProps {
  ticketType: NonNullable<Event['ticketTypes']>[number];
  benefits: string[];
  value: string;
  star?: boolean;
  subtitle: 'Regular' | 'Premium Experience';
  backgroundClass?: string;
  onChange: (value: string) => void;
  updateEventPrice: (newPrice: number) => void;
}

const TicketType: FC<TicketTypeProps> = ({ ticketType, benefits, subtitle, value, backgroundClass, star, updateEventPrice, onChange }) => {
  const isSelected = value === ticketType.id;
  const isKasosyo = ticketType.id === 'kasosyo';

  return (
    <div
      key={ticketType.name}
      className={cn(
        'font-nunito cursor-pointer transition-all duration-200 text-pycon-dirty-white rounded-2xl shadow-lg',
        'hover:shadow-xl hover:scale-[1.02] hover:brightness-110',
        isKasosyo ? 'bg-gradient-to-br from-red-500 to-red-600 shadow-red-200/50' : 'bg-gradient-to-br from-orange-400 to-orange-500 shadow-orange-200/50',
        isSelected && 'ring-2 ring-white/10 shadow-lg',
        backgroundClass
      )}
      onClick={() => {
        onChange(ticketType.id);
        updateEventPrice(ticketType.price);
      }}
    >
      <CardHeader className="pb-4">
        <CardTitle className={cn('flex flex-wrap font-black font-nunito text-2xl items-center gap-x-4 mb-3')}>
          {star && <Star fill="currentColor" className="animate-pulse" />}
          {ticketType.name.toUpperCase()}
          <span className={cn('font-medium text-base opacity-90')}>{`( ${subtitle} )`}</span>
        </CardTitle>
        <div className={cn('text-pycon-custard-light font-nunito font-bold text-2xl', isSelected && 'text-white drop-shadow-md')}>
          {formatMoney(ticketType.price, 'PHP')}
        </div>

        {ticketType.originalPrice && ticketType.price < ticketType.originalPrice && (
          <CardDescription>
            <span className="line-through text-gray-500 font-semibold">{formatMoney(ticketType.originalPrice, 'PHP')}</span>
            <span className="ml-2 text-green-400 font-semibold">{formatPercentage(1 - ticketType.price / ticketType.originalPrice)} off</span>
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 font-semibold py-6">
        {benefits.map((benefit, index) => (
          <span key={benefit} className="inline-flex gap-x-3 items-center transition-all duration-200" style={{ animationDelay: `${index * 100}ms` }}>
            <Check className={cn('text-pycon-white transition-transform duration-200', isSelected && 'scale-110 drop-shadow-sm')} size={20} />
            <span className={cn('text-base', isSelected && 'text-white/95')}>{benefit}</span>
          </span>
        ))}
      </CardContent>

      <CardFooter className="flex justify-between items-center pt-6">
        <Button
          className={cn(
            'cursor-pointer px-10 py-4 font-bold transition-all duration-300 text-lg min-w-[140px]',
            isSelected
              ? 'bg-white text-pycon-violet-dark border-3 border-white shadow-2xl shadow-white/30 hover:bg-white/95 hover:scale-110 ring-4 ring-white/40'
              : 'bg-pycon-violet-dark/80 hover:bg-pycon-violet-light hover:shadow-xl hover:scale-105 text-white shadow-lg border border-transparent'
          )}
          onClick={(e) => {
            e.stopPropagation();
            onChange(ticketType.id);
            updateEventPrice(ticketType.price);
          }}
          disabled={ticketType.maximumQuantity <= (ticketType.currentSales ?? 0)}
        >
          {isSelected ? <Check className="mr-3 h-5 w-5" /> : null}
          {isSelected ? 'Selected' : 'Select'}
        </Button>
      </CardFooter>
    </div>
  );
};

interface SprintDaySectionProps {
  isSelected: boolean;
  sprintDayPrice: number;
  onChange: (selected: boolean) => void;
}

const SprintDaySection: FC<SprintDaySectionProps> = ({ isSelected, sprintDayPrice, onChange }) => {
  return (
    <div className="flex flex-col gap-6 mt-12">
      <div className="text-center md:text-left">
        <div className="flex items-center gap-3 mb-2 justify-center md:justify-start">
          <Zap className="text-pycon-orange h-8 w-8" />
          <h3 className="font-nunito font-bold text-3xl text-pycon-orange">Add Sprint Day</h3>
        </div>
        <p className="text-pycon-custard-light text-lg font-medium">Enhance your conference experience with hands-on coding</p>
      </div>

      <div
        className={cn(
          'border-2 rounded-2xl p-8 cursor-pointer transition-all duration-200 font-nunito',
          'hover:shadow-lg hover:scale-[1.02]',
          isSelected
            ? 'border-pycon-orange bg-gradient-to-br from-orange-50 to-orange-100 shadow-lg shadow-orange-200/50'
            : 'border-gray-300 bg-white hover:border-pycon-orange/50'
        )}
        onClick={() => onChange(!isSelected)}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <Calendar className="text-pycon-violet-dark h-7 w-7" />
              <h4 className="font-bold text-2xl text-pycon-violet-dark">Join Sprint Day</h4>
              <div className="ml-auto md:ml-0">
                <span
                  className={cn(
                    'px-4 py-2 rounded-full text-base font-bold',
                    isSelected ? 'bg-pycon-orange text-white shadow-lg' : 'bg-gray-100 text-gray-600'
                  )}
                >
                  +{formatMoney(sprintDayPrice, 'PHP')}
                </span>
              </div>
            </div>

            <p className={cn('mb-6 text-base md:text-lg font-medium', isSelected ? 'text-gray-700' : 'text-gray-600')}>
              Join our collaborative coding session and work on open-source projects with fellow developers!
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-base">
              <div className="flex items-center gap-3">
                <Users className="text-pycon-violet-dark h-5 w-5" />
                <span className="text-gray-700 font-medium">Collaborative coding</span>
              </div>
              <div className="flex items-center gap-3">
                <Coffee className="text-pycon-violet-dark h-5 w-5" />
                <span className="text-gray-700 font-medium">Refreshments included</span>
              </div>
              <div className="flex items-center gap-3">
                <Zap className="text-pycon-violet-dark h-5 w-5" />
                <span className="text-gray-700 font-medium">Open source projects</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="text-pycon-violet-dark h-5 w-5" />
                <span className="text-gray-700 font-medium">Networking opportunity</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-3 md:ml-8">
            <Button
              className={cn(
                'w-full md:w-auto px-10 py-4 font-bold transition-all duration-300 text-lg min-w-[180px]',
                isSelected
                  ? 'bg-pycon-orange text-white border-2 border-pycon-orange shadow-2xl shadow-orange-200/50 hover:bg-pycon-orange/90 hover:scale-110 ring-4 ring-orange-200/60'
                  : 'bg-gray-100 hover:bg-pycon-orange hover:text-white text-gray-700 border-2 border-gray-300 hover:border-pycon-orange hover:shadow-xl hover:scale-105 shadow-lg'
              )}
              onClick={(e) => {
                e.stopPropagation();
                onChange(!isSelected);
              }}
            >
              {isSelected ? (
                <>
                  <Check className="mr-3 h-5 w-5" />
                  Added
                </>
              ) : (
                'Add to Registration'
              )}
            </Button>
          </div>
        </div>
      </div>

      <FormError />
    </div>
  );
};

export default TicketSelectionStep;

// <CardHeader>
//   <CardTitle className={cn('grid font-black font-nunito text-2xl items-center gap-x-4', 'grid-cols-[auto_auto_auto_1fr]')}>
//     {/* <div className="inline-flex gap-x-2 items-center">
//     </div> */}
//     <Star fill="currentColor" className={cn(!star && 'opacity-0')} />
//     {ticketType.name.toUpperCase()}
//     <span className={cn('font-medium text-base row-start-2 sm:row-start-1', 'col-start-2 sm:col-start-3')}>{`( ${subtitle} )`}</span>

//     <div
//       className={cn(
//         'text-pycon-custard-light font-nunito font-bold text-xl  col-span-2 sm:col-span-1',
//         'row-start-3 sm:row-start-1 ms-0 sm:col-start-3 sm:ms-auto',
//         'col-start-2 sm:col-start-4 ms-0 sm:ms-auto'
//       )}
//     >
//       {formatMoney(ticketType.price, 'PHP')}
//     </div>
//   </CardTitle>
//   {ticketType.originalPrice && ticketType.price < ticketType.originalPrice && (
//     <CardDescription>
//       <span className="line-through text-gray-500 font-semibold">{formatMoney(ticketType.originalPrice, 'PHP')}</span>
//       <span className="ml-2 text-green-400 font-semibold">{formatPercentage(1 - ticketType.price / ticketType.originalPrice)} off</span>
//     </CardDescription>
//   )}
// </CardHeader>
