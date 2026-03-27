import { all, takeLatest, put, call } from 'redux-saga/effects';
import {
  types,
  CreatePaymentLinkAction,
  CreatePaymentLinkSuccess,
  CreatePaymentAction,
  GetHPayPaymentMethodsAction,
  CreateHPaySurchargeAction,
  GetPaymentLinksAction,
} from '../reducers/payment';
import { SagaReady } from '../reducers/lifecycle';

// Api
import { paymentApi, placezApi } from '../api';
import HPayPayment from '../api/payments/models/Payment';
import { types as uiTypes } from '../reducers/ui';

export default function* paymentSaga() {
  yield all([
    takeLatest(types.GET_PAYMENTS, getPayments),
    takeLatest(types.CREATE_PAYMENT, createPayment),
    takeLatest(types.CREATE_PAYMENT_LINK, createPaymentLink),
    takeLatest(types.CREATE_HPAY_PAYMENT, createHPayPayment),
    takeLatest(types.CREATE_PLACEZ_PAYMENT, createPlacezPayment),
    takeLatest(types.CREATE_HPAY_SURCHAGE, createHpaySurcharge),
    takeLatest(types.GET_HPAY_PAYMENT_METHODS, getHPayPayments),
    takeLatest(types.GET_PAYMENT_LINKS, getPaymentLinks),
  ]);
  yield put({
    type: types.GET_PAYMENTS,
    accountId: '47690d59-27fe-43c3-8ff5-1d30903b01bf',
  });
  yield put(SagaReady('payment'));
}

function* createPayment(action: CreatePaymentAction) {
  try {
    const response = yield call(placezApi.createPayment, action.payment);

    yield put({
      type: types.CREATE_PAYMENT_SUCCESS,
      payments: response.parsedBody,
    });
  } catch (error) {
    yield put({ type: types.CREATE_PAYMENT_FAILURE, error });
  }
}

function* getPayments() {
  try {
    const response = yield call(placezApi.getPayments);
    yield put({
      type: types.GET_PAYMENTS_SUCCESS,
      payments: response.parsedBody,
    });
  } catch (error) {
    yield put({ type: types.GET_PAYMENTS_FAILURE, error });
  }
}

function* createPaymentLink(action: CreatePaymentLinkAction) {
  try {
    const response = yield call(paymentApi.createPaymentLink, action.payment);
    const payment = response.parsedBody as HPayPayment;
    yield put(CreatePaymentLinkSuccess(payment));
    yield put({
      type: uiTypes.TOAST_MESSAGE,
      message: 'Invoice has been sent successfully.',
    });
    if (typeof action?.actionFn === 'function') yield call(action.actionFn);
  } catch (error) {
    yield put({ type: types.CREATE_PAYMENT_LINK_FAILURE, error });
  }
}

function* getPaymentLinks(action: GetPaymentLinksAction) {
  try {
    console.log('[Saga] Fetching payment links with params:', action.params);

    const response = yield call(paymentApi.getPaymentLinks, action.params);
    const links = response.parsedBody as HPayPayment[];

    console.log('[Saga] Payment links response:', links);

    yield put({
      type: types.GET_PAYMENT_LINKS_SUCCESS,
      links,
    });
  } catch (error) {
    console.error('[Saga] Error fetching payment links:', error);
    yield put({ type: types.GET_PAYMENT_LINKS_FAILURE, error });
  }
}

function* createHPayPayment(action: CreatePaymentAction) {
  try {
    const headers = {
      Processor: '5',
      'HPay-Api-Key': '5c218051-03c7-42a1-ae29-2e9eaa618ea8',
    };
    const response = yield call(paymentApi.createPayment, action.payment, {
      headers,
    });
    const payments = response.parsedBody as HPayPayment;

    yield put({
      type: types.CREATE_HPAY_PAYMENT_SUCCESS,
      payments,
    });
  } catch (error) {
    yield put({ type: types.CREATE_HPAY_PAYMENT_FAILURE, error });
  }
}

function* createHpaySurcharge(action: CreateHPaySurchargeAction) {
  try {
    const res = yield call(paymentApi.createHpaySurcharge, action.payload, {
      headers: {
        Processor: '5',
      },
    });
    const response = res.parsedBody as HPayPayment;

    yield put({
      type: types.CREATE_HPAY_SURCHARGE_SUCCESS,
      response,
    });
  } catch (error) {
    yield put({ type: types.CREATE_HPAY_SURCHARGE_FAILURE, error });
  }
}

function* getHPayPayments(action: GetHPayPaymentMethodsAction) {
  try {
    const response = yield call(paymentApi.getHPayPaymentMethods, {
      paymentMethodsId: action.params.paymentMethodsId,
      headers: {
        Processor: '5',
        merchantId: action.params.merchantId,
      },
    });
    yield put({
      type: types.GET_HPAY_PAYMENT_METHODS_SUCCESS,
      methods: response.parsedBody,
    });
  } catch (error) {
    yield put({ type: types.GET_HPAY_PAYMENT_METHODS_FAILURE, error });
  }
}

function* createPlacezPayment(action: CreatePaymentAction) {
  try {
    const response = yield call(placezApi.createPlacezPayment, action.payment);
    yield put({
      type: types.CREATE_PLACEZ_PAYMENT_SUCCESS,
      payments: response.parsedBody,
    });
    yield put({ type: uiTypes.TOAST_MESSAGE, message: 'Payment Successful.' });
  } catch (error) {
    yield put({ type: types.CREATE_PLACEZ_PAYMENT_FAILURE, error });
  }
}
