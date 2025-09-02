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

  // Update form total whenever calculated total changes
  useEffect(() => {
    setValue('total', total);
  }, [total, setValue]);

  // Recalculate transaction fee when discount changes
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
    <>
      <FormItem name="validIdObjectKey">
        {({ field: { name, value, onChange } }) => (
          <div className="space-y-4">
            <FormLabel>Valid ID *</FormLabel>
            <FormDescription className="text-pycon-custard-light">Valid ID is required upon entry to venue</FormDescription>
            <FileUpload pyconStyles name={name} eventId={eventId} uploadType={EVENT_UPLOAD_TYPE.VALID_ID} value={value} onChange={onChange} />
            <FormError />
          </div>
        )}
      </FormItem>

      <hr className="border-pycon-custard-light" />

      <FormItem name="discountCode">
        {({ field }) => (
          <div className="flex flex-col gap-1">
            <FormLabel optional optionalClass="text-pycon-custard-light">
              Discount Coupon
            </FormLabel>
            <div className="flex sm:flex-row flex-col gap-2 w-full items-center">
              <Input pyconStyles type="text" placeholder="Enter Discount Coupon Code" className="w-full sm:w-1/2" {...field} />
              <Button
                className="w-full sm:w-fit bg-pycon-custard-light cursor-pointer text-pycon-violet-dark disabled:bg-pycon-custard-light/70 disabled:cursor-not-allowed hover:bg-pycon"
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

      <hr className="border-pycon-custard-light" />

      {/* Only show payment gateways if payment is required */}
      {total > 0 && (
        <>
          <PaymentGateways getTransactionFee={getTransactionFee} />
          <hr className="border-pycon-custard-light" />
        </>
      )}

      {/* For free tickets, show a message instead */}
      {total === 0 && (
        <>
          <div className="text-center py-4">
            <h4 className="font-nunito text-pycon-custard font-bold text-lg">🎉 Free Registration!</h4>
            <p className="font-nunito text-pycon-custard-light">No payment required for your registration.</p>
          </div>
          <hr className="border-pycon-custard-light" />
        </>
      )}
      <div className="flex flex-col items-start gap-5">
        <div className="flex flex-col gap-5 w-full">
          <div className="grid grid-cols-2 gap-5">
            <h4 className="font-nunito text-pycon-custard font-bold">Ticket Price:</h4>
            <p className="font-nunito font-bold">{formatMoney(price, 'PHP')}</p>

            {discountPercentage ? (
              <>
                <h4 className="font-nunito text-pycon-custard font-bold">Discount:</h4>
                <p className="font-nunito font-bold">
                  <span>{formatPercentage(discountPercentage)}</span>
                </p>

                <h4 className="font-nunito text-pycon-custard font-bold">Discounted Price:</h4>
                <p className="font-nunito font-bold">{formatMoney(discountedPrice, 'PHP')} </p>
              </>
            ) : (
              <></>
            )}

            <hr className="border-pycon-custard-light col-span-2" />

            {sprintDay && sprintDayPrice && (
              <>
                <h4 className="font-nunito text-pycon-custard font-bold">Sprint Day Fee:</h4>
                <p className="font-nunito font-bold">{formatMoney(sprintDayPrice, 'PHP')}</p>
              </>
            )}

            <h4 className="font-nunito text-pycon-custard font-bold">Subtotal:</h4>
            <p className="font-nunito font-bold">{formatMoney((discountPercentage ? discountedPrice : price) + currentSprintPrice, 'PHP')}</p>

            {/* Only show transaction fee for paid tickets */}
            {total > 0 && (
              <>
                <h4 className="font-nunito text-pycon-custard font-bold">Transaction Fee:</h4>
                <p className="font-nunito font-bold">{getTransactionFeeContent()}</p>
              </>
            )}

            {platformFee && (
              <>
                <h4 className="font-nunito text-pycon-custard font-bold">Platform Fee:</h4>
                <p className="font-nunito font-bold">{formatMoney(price * platformFee, 'PHP')}</p>
              </>
            )}

            <hr className="border-pycon-custard-light col-span-2" />
            <h4 className="font-nunito text-pycon-custard font-bold">Total:</h4>
            <p className="font-nunito font-bold">{formatMoney(total, 'PHP')}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentAndVerificationStep;
