import { TransactionDetails, EWalletPaymentIn, GetTransactionDetailsOut, PaymentRequestOut, DirectDebitPaymentIn } from '@/model/payments';
import { createApi } from './utils/createApi';

export const getTransactionDetails = (transactionDetails: TransactionDetails) =>
  createApi<GetTransactionDetailsOut>({
    method: 'post',
    authorize: true,
    apiService: 'payments',
    url: '/transaction/fees',
    body: { ...transactionDetails }
  });


export const createEwalletPaymentRequest = (paymentDetails: EWalletPaymentIn) =>
  createApi<PaymentRequestOut>({
    method: 'post',
    authorize: true,
    apiService: 'payments',
    url: '/e_wallet/payment_method',
    body: { ...paymentDetails }
  });

export const initiateDirectDebitPayment = (paymentDetails: DirectDebitPaymentIn) =>
  createApi<PaymentRequestOut>({
    method: 'post',
    authorize: true,
    apiService: 'payments',
    url: '/direct_debit/payment_request',
    body: { ...paymentDetails }
  });

