import { FC } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { BPI_LOGO, CHINABANK_LOGO, GCASH_LOGO, MAYA_LOGO, RCBC_LOGO, UPB_LOGO } from '@/assets/paymentGatewaysIcons';
import { RadioGroup, RadioGroupItem } from '@/components/RadioGroup';
import { PaymentMethod, eWalletChannelCode, DirectDebitChannelCode, PaymentChannel } from '@/model/payments';
import { cn } from '@/utils/classes';
import { RegisterFormValues } from '@/hooks/useRegisterForm';

interface PaymentOptionProps {
  paymentTitle: string;
  imgSrc?: string;
  currentPaymentChannel?: PaymentChannel | null;
  paymentChannelCode: eWalletChannelCode | DirectDebitChannelCode;
  onClick: () => void;
}
const PaymentOption: FC<PaymentOptionProps> = ({ paymentTitle, imgSrc, paymentChannelCode, currentPaymentChannel, onClick }) => {
  const selected = currentPaymentChannel === paymentChannelCode;
  return (
    <div className="w-full px-0 md:w-1/2 md:px-2">
      <div
        role="button"
        className={cn(
          'inline-flex min-h-14 w-full cursor-pointer items-center justify-normal rounded-xl border border-pycon-orange/15 bg-pycon-dirty-white p-3 outline-0 transition-[background-color,border-color,box-shadow] hover:bg-pycon-custard-light md:p-4',
          selected && 'border-pycon-orange bg-pycon-orange/10 shadow-[0_0_0_2px_rgba(243,160,77,0.2)]'
        )}
        onClick={onClick}
      >
        {imgSrc && (
          <div className="h-10 w-[70px] mr-2">
            <img src={imgSrc} className={cn('w-full h-full', paymentChannelCode === 'PAYMAYA' && 'py-2 pt-3')} alt={paymentTitle} />
          </div>
        )}
        <p className="font-nunito text-base font-semibold text-pycon-violet-dark">{paymentTitle}</p>
        <RadioGroupItem pyconStyles className="ml-auto border! border-pycon-orange!" value={paymentChannelCode} checked={selected} />
      </div>
    </div>
  );
};

interface Props {
  getTransactionFee: () => Promise<void>;
}

const PaymentGateways: FC<Props> = ({ getTransactionFee }) => {
  const { control, setValue } = useFormContext<RegisterFormValues>();

  const currentPaymentChannel = useWatch({ control, name: 'paymentChannel' });
  const setPaymentChannel = (paymentChannel: eWalletChannelCode | DirectDebitChannelCode) => setValue('paymentChannel', paymentChannel);
  const setPaymentMethod = (paymentMethod: PaymentMethod) => setValue('paymentMethod', paymentMethod);

  const setEWalletPaymentChannel = (paymentChannel: eWalletChannelCode) => {
    setPaymentChannel(paymentChannel);
    setPaymentMethod('E_WALLET');
    getTransactionFee();
  };

  const setDirectDebitPaymentChannel = (paymentChannel: DirectDebitChannelCode) => {
    setPaymentChannel(paymentChannel);
    setPaymentMethod('DIRECT_DEBIT');
    getTransactionFee();
  };

  return (
    <>
      <h4 className="font-nunito text-[13px] font-bold uppercase tracking-[0.5px] text-pycon-violet-dark!">Select a payment method:</h4>
      <RadioGroup className="block space-y-2">
        <p className="mt-2 font-nunito text-[13px] font-bold uppercase tracking-[0.5px] text-pycon-orange">eWallets:</p>
        <div className="flex flex-wrap gap-y-2">
          <PaymentOption
            paymentTitle="Gcash"
            paymentChannelCode="GCASH"
            imgSrc={GCASH_LOGO}
            currentPaymentChannel={currentPaymentChannel}
            onClick={() => setEWalletPaymentChannel('GCASH')}
          />
          <PaymentOption
            paymentTitle="Maya"
            paymentChannelCode="PAYMAYA"
            imgSrc={MAYA_LOGO}
            currentPaymentChannel={currentPaymentChannel}
            onClick={() => setEWalletPaymentChannel('PAYMAYA')}
          />
        </div>

        <p className="font-nunito text-[13px] font-bold uppercase tracking-[0.5px] text-pycon-orange">Direct Debit:</p>
        <div className="flex flex-wrap gap-y-2">
          <PaymentOption
            paymentTitle="BPI"
            paymentChannelCode="BPI"
            imgSrc={BPI_LOGO}
            currentPaymentChannel={currentPaymentChannel}
            onClick={() => setDirectDebitPaymentChannel('BPI')}
          />
          <PaymentOption
            paymentTitle="RCBC"
            paymentChannelCode="RCBC"
            imgSrc={RCBC_LOGO}
            currentPaymentChannel={currentPaymentChannel}
            onClick={() => setDirectDebitPaymentChannel('RCBC')}
          />
          <PaymentOption
            paymentTitle="Union Bank"
            paymentChannelCode="UBP"
            imgSrc={UPB_LOGO}
            currentPaymentChannel={currentPaymentChannel}
            onClick={() => setDirectDebitPaymentChannel('UBP')}
          />
          <PaymentOption
            paymentTitle="China Bank"
            paymentChannelCode="CHINABANK"
            imgSrc={CHINABANK_LOGO}
            currentPaymentChannel={currentPaymentChannel}
            onClick={() => setDirectDebitPaymentChannel('CHINABANK')}
          />
        </div>
      </RadioGroup>
    </>
  );
};

export default PaymentGateways;
