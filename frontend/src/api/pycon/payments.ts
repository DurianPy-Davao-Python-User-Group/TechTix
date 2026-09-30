import { TransactionDetails, EWalletPaymentIn, GetTransactionDetailsOut, PaymentRequestOut, DirectDebitPaymentIn, PaymentRequestOutV2 } from '@/model/pycon/payments';
import { createApi } from '../utils/createApi';

export const getTransactionDetails = (transactionDetails: TransactionDetails) =>
  createApi<GetTransactionDetailsOut>({
    method: 'post',
    authorize: true,
    apiService: 'payments',
    url: '/transaction/fees',
    body: { ...transactionDetails }
  });


export const createEwalletPaymentRequest = (paymentDetails: EWalletPaymentIn) =>
  createApi<PaymentRequestOutV2, PaymentRequestOut>({
    method: 'post',
    authorize: true,
    apiService: 'payments',
    url: '/v2/e_wallet/payment_method',
    body: { ...paymentDetails },
    output: (x) => ({
      createDate: x.created,
      paymentUrl: x.actions.find(action => action.type === 'REDIRECT_CUSTOMER')?.value || '',
      paymentRequestId: x.payment_request_id,
      referenceId: x.reference_id
    })
  });

export const initiateDirectDebitPayment = (paymentDetails: DirectDebitPaymentIn) =>
  createApi<PaymentRequestOutV2, PaymentRequestOut>({
    method: 'post',
    authorize: true,
    apiService: 'payments',
    url: '/v2/direct_debit/payment_request',
    body: { ...paymentDetails },
    output: (x) => ({
      createDate: x.created,
      paymentUrl: x.actions.find(action => action.type === 'REDIRECT_CUSTOMER')?.value || '',
      paymentRequestId: x.payment_request_id,
      referenceId: x.reference_id
    })
  });

