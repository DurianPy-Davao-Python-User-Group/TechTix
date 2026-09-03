import { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import Button from '@/components/Button';
import FileUpload from '@/components/FileUpload';
import { FormItem, FormLabel, FormError, FormDescription } from '@/components/Form';
import Input from '@/components/Input';
import { Event, EVENT_UPLOAD_TYPE } from '@/model/events';
import { formatMoney, formatPercentage } from '@/utils/functions';
import { RegisterFormValues } from '../../hooks/useRegisterForm';
import { calculateDiscountedPrice, calculateTotalPrice } from '../pricing';
import { useDiscount } from '../useDiscount';
import { useTransactionFee } from '../useTransactionFee';
import PaymentGateways from './PaymentGateways';

interface Props {
  event: Event;
  isFeesLoading: boolean;
  setIsFeesLoading: (isLoading: boolean) => void;
}

const PaymentAndVerificationStep = ({ event: { eventId, price, platformFee, sprintDayPrice }, isFeesLoading, setIsFeesLoading }: Props) => {
  const { control, setValue, getValues } = useFormContext<RegisterFormValues>();
  const [transactionFee, sprintDay] = useWatch({ name: ['transactionFee', 'sprintDay'], control });
  const { discountPercentage, isValidatingDiscountCode, validateDiscountCode } = useDiscount(price);
  const { getTransactionFee } = useTransactionFee(price, platformFee, setIsFeesLoading, discountPercentage, sprintDayPrice);
  const currentSprintPrice = sprintDay && sprintDayPrice ? sprintDayPrice : 0;
  const discountedPrice = calculateDiscountedPrice({ price, discountPercentage: discountPercentage ?? 0 });
  const total = calculateTotalPrice({
    price,
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
    <div className="space-y-5 pb-2 text-pycon-violet-dark sm:space-y-6">
      <section className="rounded-[1.75rem] bg-pycon-custard-light p-4 shadow-[0_16px_40px_rgba(243,160,77,0.12)] sm:p-6 md:p-8">
        <FormItem name="discountCode">
          {({ field }) => (
            <div className="space-y-3">
              <FormLabel
                optional
                className="text-xs font-bold uppercase tracking-[0.16em] text-pycon-violet-dark"
                optionalClass="text-xs font-bold uppercase tracking-[0.16em] text-pycon-violet-dark"
              >
                Discount
              </FormLabel>
              <label className="block text-[15px] font-bold uppercase tracking-[0.5px] text-pycon-orange" htmlFor={field.name}>
                Discount Code
              </label>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                <Input
                  pyconStyles
                  id={field.name}
                  type="text"
                  placeholder="Enter your code..."
                  className="h-12 w-full rounded-xl border border-pycon-orange/15 bg-pycon-dirty-white px-5 text-pycon-violet-dark placeholder:text-pycon-violet-light sm:flex-1"
                  {...field}
                />
                <Button
                  className="h-12 w-full cursor-pointer rounded-xl bg-pycon-orange px-6 text-white disabled:cursor-not-allowed disabled:opacity-60 hover:bg-pycon-orange/90 sm:w-auto"
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

        <div className="my-7 border-t border-pycon-orange/15" />

        <FormItem name="validIdObjectKey">
          {({ field: { name, value, onChange } }) => (
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-pycon-violet-dark">Identity Verification</p>
              <FormLabel className="text-[15px] font-bold uppercase tracking-[0.5px] text-pycon-orange">Upload ID *</FormLabel>
              <FormDescription className="text-xs font-normal italic text-pycon-violet-light">required upon entry to venue</FormDescription>
              <FileUpload pyconStyles name={name} eventId={eventId} uploadType={EVENT_UPLOAD_TYPE.VALID_ID} value={value} onChange={onChange} />
              <FormError />
            </div>
          )}
        </FormItem>
        {total > 0 && (
          <>
            <div className="my-7 border-t border-pycon-orange/15" />
            <div>
              <h2 className="mb-5 text-sm font-bold uppercase tracking-[0.16em] text-pycon-violet-dark!">Payment Method</h2>
              <PaymentGateways getTransactionFee={getTransactionFee} />
            </div>
          </>
        )}

        {total === 0 && (
          <>
            <div className="my-7 border-t border-pycon-orange/15" />
            <div className="rounded-xl border border-pycon-orange/20 bg-white/40 px-6 py-5 text-center">
              <h4 className="font-nunito text-lg font-bold text-pycon-orange">Free Registration!</h4>
              <p className="font-nunito text-sm text-pycon-violet-light">No payment required for your registration.</p>
            </div>
          </>
        )}

        <div className="my-7 border-t border-pycon-orange/15" />
        <div>
          <h2 className="mb-5 text-sm font-bold uppercase tracking-[0.16em] text-pycon-violet-dark!">Price Breakdown</h2>
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-0 text-base sm:gap-x-4 sm:text-lg">
            <h4 className="border-b border-pycon-orange/20 py-3 font-nunito text-base font-semibold text-pycon-violet-dark!">Ticket Price</h4>
            <p className="border-b border-pycon-orange/20 py-3 text-right font-nunito text-base font-semibold text-pycon-violet-dark">
              {formatMoney(price, 'PHP')}
            </p>

            {discountPercentage ? (
              <>
                <h4 className="border-b border-pycon-orange/20 py-3 font-nunito text-base font-semibold text-pycon-violet-dark!">
                  Discount ({formatPercentage(discountPercentage)})
                </h4>
                <p className="border-b border-pycon-orange/20 py-3 text-right font-nunito text-base font-semibold text-pycon-violet-dark">
                  - {formatMoney(price - discountedPrice, 'PHP')}
                </p>

                <h4 className="border-b border-pycon-orange/20 py-3 font-nunito text-base font-semibold text-pycon-violet-dark!">Discounted Price</h4>
                <p className="border-b border-pycon-orange/20 py-3 text-right font-nunito text-base font-semibold text-pycon-violet-dark">
                  {formatMoney(discountedPrice, 'PHP')}
                </p>
              </>
            ) : (
              <></>
            )}

            <div className="col-span-2 h-px bg-pycon-orange/20" />

            {sprintDay && sprintDayPrice && (
              <>
                <h4 className="border-b border-pycon-orange/20 py-3 font-nunito text-base font-semibold text-pycon-violet-dark!">Sprint Day Fee:</h4>
                <p className="border-b border-pycon-orange/20 py-3 text-right font-nunito text-base font-semibold text-pycon-violet-dark">
                  {formatMoney(sprintDayPrice, 'PHP')}
                </p>
              </>
            )}

            <h4 className="border-b border-pycon-orange/20 py-3 font-nunito text-base font-semibold text-pycon-violet-dark!">Subtotal</h4>
            <p className="border-b border-pycon-orange/20 py-3 text-right font-nunito text-base font-semibold text-pycon-violet-dark">
              {formatMoney((discountPercentage ? discountedPrice : price) + currentSprintPrice, 'PHP')}
            </p>

            {total > 0 && (
              <>
                <h4 className="border-b border-pycon-orange/20 py-3 font-nunito text-base font-semibold text-pycon-violet-dark!">Transaction Fee</h4>
                <p className="border-b border-pycon-orange/20 py-3 text-right font-nunito text-base font-semibold text-pycon-violet-dark">
                  {getTransactionFeeContent()}
                </p>
              </>
            )}

            {platformFee && (
              <>
                <h4 className="border-b border-pycon-orange/20 py-3 font-nunito text-base font-semibold text-pycon-violet-dark!">Platform Fee</h4>
                <p className="border-b border-pycon-orange/20 py-3 text-right font-nunito text-base font-semibold text-pycon-violet-dark">
                  {formatMoney(price * platformFee, 'PHP')}
                </p>
              </>
            )}

            <div className="col-span-2 h-px bg-pycon-orange/20" />
            <h4 className="py-3 font-nunito text-lg font-extrabold uppercase text-pycon-orange!">Total</h4>
            <p className="py-3 text-right font-nunito text-xl font-extrabold text-pycon-orange">{formatMoney(total, 'PHP')}</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PaymentAndVerificationStep;
