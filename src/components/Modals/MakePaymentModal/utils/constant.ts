export const CENT = 100;

export const MERCHANT_ID = 't1_mer_6463bfd69937de32af1fb36';

export const HPAY_API_KEY = '5c218051-03c7-42a1-ae29-2e9eaa618ea8';

export const PAYMENT_PROCESSOR_ID = '5';

export const CC_TRANSACTION_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

export const PAYMENT_PROCESSOR_TRANSACTION_ID =
  '3fa85f64-5717-4562-b3fc-2c963f66afa6';

export const PAYMENT_GATEWAY_URL = `${import.meta.env.VITE_APP_PAYMENTS_API_URL}/api/hpay/placezcheckout?Processor=${PAYMENT_PROCESSOR_ID}&merchantId=${MERCHANT_ID}`;
