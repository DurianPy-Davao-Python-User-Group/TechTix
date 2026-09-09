import { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/Accordion';
import Button from '@/components/Button';
import FileUpload from '@/components/FileUpload';
import { FormItem, FormLabel, FormError, FormDescription } from '@/components/Form';
import Input from '@/components/Input';
import { Event, EVENT_UPLOAD_TYPE } from '@/model/events';
import { formatMoney, formatPercentage } from '@/utils/functions';
import { RegisterFormValues } from '../../hooks/useRegisterForm';
import { calculateDiscountedPrice, calculateTotalPrice, getEffectivePrice, getOriginalPrice } from '../pricing';
import { useDiscount } from '../useDiscount';
import { useTransactionFee } from '../useTransactionFee';
import PaymentGateways from './PaymentGateways';

interface Props {
  event: Event;
  isFeesLoading: boolean;
  setIsFeesLoading: (isLoading: boolean) => void;
}

const ACCEPTED_VALID_IDS = [
  'Philippine Passport',
  'LTO Driver\'s License',
  'Unified Multi-Purpose ID (UMID) / SSS ID',
  'Professional Regulation Commission (PRC) License',
  'Postal ID',
  'PhilHealth ID',
  'Voter\'s ID or Voter\'s Certification',
  'Taxpayer Identification Number (TIN) ID',
  'Persons with Disability (PWD) ID',
  'Senior Citizen\'s ID',
  'PSA-issued Birth Certificate',
  'School ID (with current registration card, for students)'
];

const PaymentAndVerificationStep = ({ event, isFeesLoading, setIsFeesLoading }: Props) => {
  const { eventId, platformFee, sprintDayPrice } = event;
  const { control, setValue, getValues } = useFormContext<RegisterFormValues>();
  const [transactionFee, sprintDay, ticketType] = useWatch({ name: ['transactionFee', 'sprintDay', 'ticketType'], control });
  const effectivePrice = getEffectivePrice(event, ticketType);
  const originalPrice = getOriginalPrice(event, ticketType);
  const hasTicketSale = originalPrice != null && effectivePrice < originalPrice;
  const { discountPercentage, isValidatingDiscountCode, validateDiscountCode } = useDiscount(effectivePrice);
  const { getTransactionFee } = useTransactionFee(effectivePrice, platformFee, setIsFeesLoading, discountPercentage, sprintDayPrice);
  const currentSprintPrice = sprintDay && sprintDayPrice ? sprintDayPrice : 0;
  const discountedPrice = calculateDiscountedPrice({ price: effectivePrice, discountPercentage: discountPercentage ?? 0 });
  const total = calculateTotalPrice({
    price: effectivePrice,
    sprintDayPrice: currentSprintPrice,
    transactionFee: transactionFee || 0,
    discountPercentage: discountPercentage || 0,
    platformFee: platformFee || 0
  });

  useEffect(() => {
    getTransactionFee();
  }, [getTransactionFee]);

  useEffect(() => {
    setValue('total', total);
  }, [total, setValue]);

  useEffect(() => {
    const [paymentChannel, paymentMethod] = getValues(['paymentChannel', 'paymentMethod']);
    if (paymentChannel && paymentMethod) {
      getTransactionFee();
    }
  }, [discountPercentage, sprintDay, getTransactionFee, control]);

  const getTransactionFeeContent = () => {
    if (isFeesLoading) {
      return 'Loading...';
    }

    if (!transactionFee) {
      return 'Select a payment method';
    }

    return formatMoney(transactionFee, 'PHP');
  };

  return (
    <div className="space-y-5 pb-2 text-[#072E47] sm:space-y-6 font-inter">
      <section className="rounded-[2.5rem] bg-white/60 p-6 sm:p-8 md:p-10 border border-[#F995081F] shadow-[0px_6px_40px_0px_#F9950812]">
        <FormItem name="discountCode">
          {({ field }) => (
            <div className="space-y-3">
              <p className="font-inter text-xs font-bold uppercase tracking-[0.15em] text-[#072E4766]">
                Discount <span className="font-normal lowercase text-[#072E4766]">(optional)</span>
              </p>
              <label className="block font-inter text-sm font-bold uppercase tracking-[0.5px] text-[#F99508]" htmlFor={field.name}>
                Discount Code
              </label>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                <Input
                  pyconStyles
                  id={field.name}
                  type="text"
                  placeholder="Enter your code..."
                  className="w-full sm:flex-1"
                  {...field}
                />
                <Button
                  className="h-13 md:h-14 w-full cursor-pointer rounded-2xl bg-[#F99508] px-8 font-inter text-base font-bold text-white shadow-md shadow-[#F99508]/20 transition-all hover:bg-[#F99508]/90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                  disabled={!field.value}
                  onClick={validateDiscountCode}
                  loading={isValidatingDiscountCode}
                >
                  Check Code
                </Button>
              </div>
              <FormError />
            </div>
          )}
        </FormItem>

        <div className="my-7 border-t border-[#072E4714]" />

        <FormItem name="validIdObjectKey">
          {({ field: { name, value, onChange } }) => (
            <div className="space-y-2">
              <p className="font-inter text-xs font-bold uppercase tracking-[0.15em] text-[#072E4766]">
                Identity Verification
              </p>
              <FormLabel className="font-inter text-sm font-bold uppercase tracking-[0.5px] text-[#F99508] block">
                Upload Valid ID *
              </FormLabel>
              <FormDescription className="font-inter text-xs text-[#072E4799] block -mt-1">
                Please upload a clear photo of your valid ID card (e.g., Government or Student ID) for venue security clearance upon entry. Do not upload a selfie or 2x2 photo.
              </FormDescription>
              <Accordion type="single" collapsible defaultValue="accepted-ids" className="max-w-xl pt-1">
                <AccordionItem value="accepted-ids" className="border-b-0 border border-[#072E4714] rounded-2xl bg-pycon-dirty-white/60 px-4">
                  <AccordionTrigger className="text-xs font-bold uppercase tracking-[0.05em] text-[#072E47] hover:text-[#F99508] hover:no-underline py-3 cursor-pointer [&>svg]:text-pycon-teal">
                    Accepted Valid IDs
                  </AccordionTrigger>
                  <AccordionContent className="text-xs text-[#072E47cc] pb-3">
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 list-disc list-inside">
                      {ACCEPTED_VALID_IDS.map((id) => (
                        <li key={id}>{id}</li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              <div className="pt-2">
                <FileUpload pyconStyles name={name} eventId={eventId} uploadType={EVENT_UPLOAD_TYPE.VALID_ID} value={value} onChange={onChange} />
              </div>
              <FormError />
            </div>
          )}
        </FormItem>

        {total > 0 && (
          <>
            <div className="my-7 border-t border-[#072E4714]" />
            <div>
              <h2 className="mb-5 font-inter text-xs font-extrabold uppercase tracking-[0.15em] text-[#072E47]">Payment Method</h2>
              <PaymentGateways getTransactionFee={getTransactionFee} />
            </div>
          </>
        )}

        {total === 0 && (
          <>
            <div className="my-7 border-t border-[#072E4714]" />
            <div className="rounded-2xl border border-[#F99508]/30 bg-pycon-dirty-white px-6 py-5 text-center">
              <h4 className="font-sora text-lg font-bold text-[#F99508]">Free Registration!</h4>
              <p className="font-inter text-sm text-[#072E4799]">No payment required for your registration.</p>
            </div>
          </>
        )}

        <div className="my-7 border-t border-[#072E4714]" />

        <div>
          <h2 className="mb-4 font-inter text-sm font-extrabold uppercase tracking-[0.15em] text-[#072E47]">Price Breakdown</h2>

          <div className="flex flex-col text-base font-inter">
            <div className="flex items-center justify-between py-3.5 border-b border-[#072E4714]">
              <span className="font-bold text-[#072E47]">Ticket Price</span>
              <div className="flex items-center gap-2">
                {hasTicketSale && (
                  <span className="line-through text-gray-400 font-normal text-sm">
                    {formatMoney(originalPrice!, 'PHP')}
                  </span>
                )}
                <span className="font-bold text-[#072E47]">{formatMoney(effectivePrice, 'PHP')}</span>
              </div>
            </div>

            {discountPercentage ? (
              <>
                <div className="flex items-center justify-between py-3.5 border-b border-[#072E4714]">
                  <span className="font-bold text-[#072E47]">Discount ({formatPercentage(discountPercentage)})</span>
                  <span className="font-bold text-[#072E47]">- {formatMoney(effectivePrice - discountedPrice, 'PHP')}</span>
                </div>
                <div className="flex items-center justify-between py-3.5 border-b border-[#072E4714]">
                  <span className="font-bold text-[#072E47]">Discounted Price</span>
                  <span className="font-bold text-[#072E47]">{formatMoney(discountedPrice, 'PHP')}</span>
                </div>
              </>
            ) : null}

            {sprintDay && sprintDayPrice ? (
              <div className="flex items-center justify-between py-3.5 border-b border-[#072E4714]">
                <span className="font-bold text-[#072E47]">Sprint Day Fee:</span>
                <span className="font-bold text-[#072E47]">{formatMoney(sprintDayPrice, 'PHP')}</span>
              </div>
            ) : null}

            <div className="flex items-center justify-between py-3.5 border-b border-[#072E4714]">
              <span className="font-bold text-[#072E47]">Subtotal</span>
              <span className="font-bold text-[#072E47]">{formatMoney((discountPercentage ? discountedPrice : effectivePrice) + currentSprintPrice, 'PHP')}</span>
            </div>

            {total > 0 && (
              <div className="flex items-center justify-between py-3.5 border-b border-[#072E4714]">
                <span className="font-bold text-[#072E47]">Transaction Fee</span>
                <span className="font-bold text-[#072E47]">{getTransactionFeeContent()}</span>
              </div>
            )}

            {platformFee ? (
              <div className="flex items-center justify-between py-3.5 border-b border-[#072E4714]">
                <span className="font-bold text-[#072E47]">Platform Fee</span>
                <span className="font-bold text-[#072E47]">{formatMoney(effectivePrice * platformFee, 'PHP')}</span>
              </div>
            ) : null}

            <div className="flex items-center justify-between pt-5 pb-2">
              <span className="font-inter text-xl font-extrabold uppercase text-[#F99508]">TOTAL</span>
              <span className="font-inter text-2xl font-extrabold text-[#F99508]">{formatMoney(total, 'PHP')}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PaymentAndVerificationStep;
