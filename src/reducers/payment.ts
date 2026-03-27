import createReducer from './helpers/createReducer';
import HPayPayment, {
  HPayPaymentLink,
  HpayPaymentPayload,
} from '../api/payments/models/Payment';

// Action Types
const GET_PAYMENTS = 'GET_PAYMENTS';
const GET_PAYMENTS_SUCCESS = 'GET_PAYMENTS_SUCCESS';
const GET_PAYMENTS_FAILURE = 'GET_PAYMENTS_FAILURE';
const CREATE_PAYMENT = 'CREATE_PAYMENT';
const CREATE_PAYMENT_SUCCESS = 'CREATE_PAYMENT_SUCCESS';
const CREATE_PAYMENT_FAILURE = 'CREATE_PAYMENT_FAILURE';
const CREATE_PAYMENT_LINK = 'CREATE_PAYMENT_LINK';
const CREATE_PAYMENT_LINK_SUCCESS = 'CREATE_PAYMENT_LINK_SUCCESS';
const CREATE_PAYMENT_LINK_FAILURE = 'CREATE_PAYMENT_LINK_FAILURE';
const CREATE_HPAY_PAYMENT = 'CREATE_HPAY_PAYMENT';
const CREATE_HPAY_PAYMENT_SUCCESS = 'CREATE_HPAY_PAYMENT_SUCCESS';
const CREATE_HPAY_PAYMENT_FAILURE = 'CREATE_HPAY_PAYMENT_FAILURE';

const CREATE_PLACEZ_PAYMENT = 'CREATE_PLACEZ_PAYMENT';
const CREATE_PLACEZ_PAYMENT_SUCCESS = 'CREATE_PLACEZ_PAYMENT_SUCCESS';
const CREATE_PLACEZ_PAYMENT_FAILURE = 'CREATE_PLACEZ_PAYMENT_FAILURE';

const GET_HPAY_PAYMENT_METHODS = 'GET_HPAY_PAYMENT_METHODS';
const GET_HPAY_PAYMENT_METHODS_SUCCESS = 'GET_HPAY_PAYMENT_METHODS_SUCCESS';
const GET_HPAY_PAYMENT_METHODS_FAILURE = 'GET_HPAY_PAYMENT_METHODS_FAILURE';

const CREATE_HPAY_SURCHAGE = 'CREATE_HPAY_APPLY_SURCHARGE';
const CREATE_HPAY_SURCHARGE_SUCCESS = 'CREATE_HPAY_APPLY_SURCHARGE_SUCCESS';
const CREATE_HPAY_SURCHARGE_FAILURE = 'CREATE_HPAY_APPLY_SURCHARGE_FAILURE';

const CLEAR_PAYMENT_DATA = 'CLEAR_PAYMENT_DATA';

const GET_PAYMENT_LINKS = 'GET_PAYMENT_LINKS';
const GET_PAYMENT_LINKS_SUCCESS = 'GET_PAYMENT_LINKS_SUCCESS';
const GET_PAYMENT_LINKS_FAILURE = 'GET_PAYMENT_LINKS_FAILURE';

export const types = {
  GET_PAYMENTS,
  GET_PAYMENTS_SUCCESS,
  GET_PAYMENTS_FAILURE,
  CREATE_PAYMENT,
  CREATE_PAYMENT_SUCCESS,
  CREATE_PAYMENT_FAILURE,
  CREATE_PAYMENT_LINK,
  CREATE_PAYMENT_LINK_SUCCESS,
  CREATE_PAYMENT_LINK_FAILURE,
  CREATE_HPAY_PAYMENT,
  CREATE_HPAY_PAYMENT_SUCCESS,
  CREATE_HPAY_PAYMENT_FAILURE,
  CREATE_PLACEZ_PAYMENT,
  CREATE_PLACEZ_PAYMENT_SUCCESS,
  CREATE_PLACEZ_PAYMENT_FAILURE,
  GET_HPAY_PAYMENT_METHODS,
  GET_HPAY_PAYMENT_METHODS_SUCCESS,
  GET_HPAY_PAYMENT_METHODS_FAILURE,
  CREATE_HPAY_SURCHAGE,
  CREATE_HPAY_SURCHARGE_SUCCESS,
  CREATE_HPAY_SURCHARGE_FAILURE,
  CLEAR_PAYMENT_DATA,
  GET_PAYMENT_LINKS,
  GET_PAYMENT_LINKS_SUCCESS,
  GET_PAYMENT_LINKS_FAILURE,
};

type Types =
  | typeof GET_PAYMENTS
  | typeof GET_PAYMENTS_SUCCESS
  | typeof GET_PAYMENTS_FAILURE
  | typeof CREATE_PAYMENT
  | typeof CREATE_PAYMENT_SUCCESS
  | typeof CREATE_PAYMENT_FAILURE
  | typeof CREATE_PAYMENT_LINK
  | typeof CREATE_PAYMENT_LINK_SUCCESS
  | typeof CREATE_PAYMENT_LINK_FAILURE
  | typeof CREATE_HPAY_PAYMENT
  | typeof CREATE_HPAY_PAYMENT_SUCCESS
  | typeof CREATE_HPAY_PAYMENT_FAILURE
  | typeof CREATE_PLACEZ_PAYMENT
  | typeof CREATE_PLACEZ_PAYMENT_SUCCESS
  | typeof CREATE_PLACEZ_PAYMENT_FAILURE
  | typeof GET_HPAY_PAYMENT_METHODS
  | typeof GET_HPAY_PAYMENT_METHODS_SUCCESS
  | typeof GET_HPAY_PAYMENT_METHODS_FAILURE
  | typeof CREATE_HPAY_SURCHAGE
  | typeof CREATE_HPAY_SURCHARGE_SUCCESS
  | typeof CREATE_HPAY_SURCHARGE_FAILURE
  | typeof CLEAR_PAYMENT_DATA
  | typeof GET_PAYMENT_LINKS
  | typeof GET_PAYMENT_LINKS_SUCCESS
  | typeof GET_PAYMENT_LINKS_FAILURE;

// State
export type State = {
  payments: HPayPayment[];
  paymentLinks: HPayPaymentLink[];
  hPayPayments: any;
  placezPaymentResponse: any;
  hPayPaymentMethods: any;
  hPaySurcharge: any;
};

const initialState: State = {
  payments: [],
  paymentLinks: [],
  hPayPayments: null,
  placezPaymentResponse: null,
  hPayPaymentMethods: null,
  hPaySurcharge: null,
};

// Action Creators
export const GetPayments = () => ({
  type: GET_PAYMENTS as typeof GET_PAYMENTS,
});
export const GetPaymentsSuccess = (payments: HPayPayment[]) => ({
  type: GET_PAYMENTS_SUCCESS as typeof GET_PAYMENTS_SUCCESS,
  payments,
});
export const GetPaymentsFailure = (error: any) => ({
  type: GET_PAYMENTS_FAILURE as typeof GET_PAYMENTS_FAILURE,
  error,
});
export const CreatePayment = (payment: HPayPayment) => ({
  type: CREATE_PAYMENT as typeof CREATE_PAYMENT,
  payment,
});
export const CreatePaymentSuccess = (payment: HPayPayment) => ({
  type: CREATE_PAYMENT_SUCCESS as typeof CREATE_PAYMENT_SUCCESS,
  payment,
});
export const CreatePaymentFailure = (error: any) => ({
  type: CREATE_PAYMENT_FAILURE as typeof CREATE_PAYMENT_FAILURE,
  error,
});
export const CreatePaymentLink = (
  payment: HPayPaymentLink,
  actionFn?: () => void
) => ({
  type: CREATE_PAYMENT_LINK as typeof CREATE_PAYMENT_LINK,
  payment,
  actionFn,
});
export const CreatePaymentLinkSuccess = (payment: HPayPayment) => ({
  type: CREATE_PAYMENT_LINK_SUCCESS as typeof CREATE_PAYMENT_LINK_SUCCESS,
  payment,
});
export const CreatePaymentLinkFailure = (error: any) => ({
  type: CREATE_PAYMENT_LINK_FAILURE as typeof CREATE_PAYMENT_LINK_FAILURE,
  error,
});

export const GetPaymentLinks = (params?: any) => ({
  type: GET_PAYMENT_LINKS as typeof GET_PAYMENT_LINKS,
  params,
});
export const GetPaymentLinksSuccess = (links: HPayPaymentLink[]) => ({
  type: GET_PAYMENT_LINKS_SUCCESS as typeof GET_PAYMENT_LINKS_SUCCESS,
  links,
});
export const GetPaymentLinksFailure = (error: any) => ({
  type: GET_PAYMENT_LINKS_FAILURE as typeof GET_PAYMENT_LINKS_FAILURE,
  error,
});

export const CreateHPayPayment = (payment: HpayPaymentPayload) => ({
  type: CREATE_HPAY_PAYMENT as typeof CREATE_HPAY_PAYMENT,
  payment,
});
export const CreateHPayPaymentSuccess = (payments: any) => ({
  type: CREATE_HPAY_PAYMENT_SUCCESS as typeof CREATE_HPAY_PAYMENT_SUCCESS,
  payments,
});
export const CreateHPayPaymentFailure = (error: any) => ({
  type: CREATE_HPAY_PAYMENT_FAILURE as typeof CREATE_HPAY_PAYMENT_FAILURE,
  error,
});

export const CreatePlacezPayment = (payment: any) => ({
  type: CREATE_PLACEZ_PAYMENT as typeof CREATE_PLACEZ_PAYMENT,
  payment,
});
export const CreatePlacezPaymentSuccess = (payments: any) => ({
  type: CREATE_PLACEZ_PAYMENT_SUCCESS as typeof CREATE_PLACEZ_PAYMENT_SUCCESS,
  payments,
});
export const CreatePlacezPaymentFailure = (error: any) => ({
  type: CREATE_PLACEZ_PAYMENT_FAILURE as typeof CREATE_PLACEZ_PAYMENT_FAILURE,
  error,
});

export const CreateHPaySurcharge = (payload: any) => ({
  type: CREATE_HPAY_SURCHAGE as typeof CREATE_HPAY_SURCHAGE,
  payload,
});

export const CreateHPaySurchargeSuccess = (response: any) => ({
  type: CREATE_HPAY_SURCHARGE_SUCCESS as typeof CREATE_HPAY_SURCHARGE_SUCCESS,
  response,
});

export const CreateHPaySurchargeFailure = (error: any) => ({
  type: CREATE_HPAY_SURCHARGE_FAILURE as typeof CREATE_HPAY_SURCHARGE_FAILURE,
  error,
});

export const GetHPayPaymentMethods = (params) => ({
  type: GET_HPAY_PAYMENT_METHODS as typeof GET_HPAY_PAYMENT_METHODS,
  params,
});
export const GetHPayPaymentMethodsSuccess = (methods: any) => ({
  type: GET_HPAY_PAYMENT_METHODS_SUCCESS as typeof GET_HPAY_PAYMENT_METHODS_SUCCESS,
  methods,
});
export const GetHPayPaymentMethodsFailure = (error: any) => ({
  type: GET_HPAY_PAYMENT_METHODS_FAILURE as typeof GET_HPAY_PAYMENT_METHODS_FAILURE,
  error,
});

export const ClearPaymentData = () => ({
  type: CLEAR_PAYMENT_DATA as typeof CLEAR_PAYMENT_DATA,
});

export type GetPaymentsAction = ReturnType<typeof GetPayments>;
export type GetPaymentsSuccessAction = ReturnType<typeof GetPaymentsSuccess>;
export type GetPaymentsFailureAction = ReturnType<typeof GetPaymentsFailure>;
export type CreatePaymentAction = ReturnType<typeof CreatePayment>;
export type CreatePaymentSuccessAction = ReturnType<
  typeof CreatePaymentSuccess
>;
export type CreatePaymentFailureAction = ReturnType<
  typeof CreatePaymentLinkFailure
>;
export type CreatePaymentLinkAction = ReturnType<typeof CreatePaymentLink>;
export type CreatePaymentLinkSuccessAction = ReturnType<
  typeof CreatePaymentLinkSuccess
>;
export type CreatePaymentLinkFailureAction = ReturnType<
  typeof CreatePaymentLinkFailure
>;
export type GetPaymentLinksAction = ReturnType<typeof GetPaymentLinks>;
export type GetPaymentLinksSuccessAction = ReturnType<
  typeof GetPaymentLinksSuccess
>;
export type GetPaymentLinksFailureAction = ReturnType<
  typeof GetPaymentLinksFailure
>;
export type CreateHPayPaymentAction = ReturnType<typeof CreateHPayPayment>;
export type CreateHPayPaymentSuccessAction = ReturnType<
  typeof CreateHPayPaymentSuccess
>;
export type CreateHPayPaymentFailureAction = ReturnType<
  typeof CreateHPayPaymentFailure
>;

export type CreatePlacezPaymentAction = ReturnType<typeof CreatePlacezPayment>;
export type CreatePlacezPaymentSuccessAction = ReturnType<
  typeof CreatePlacezPaymentSuccess
>;
export type CreatePlacezPaymentFailureAction = ReturnType<
  typeof CreatePlacezPaymentFailure
>;

export type CreateHPaySurchargeAction = ReturnType<typeof CreateHPaySurcharge>;
export type CreateHPaySurchargeSuccessAction = ReturnType<
  typeof CreateHPaySurchargeSuccess
>;
export type CreateHPaySurchargeFailureAction = ReturnType<
  typeof CreateHPaySurchargeFailure
>;

export type GetHPayPaymentMethodsAction = ReturnType<
  typeof GetHPayPaymentMethods
>;
export type GetHPayPaymentMethodsSuccessAction = ReturnType<
  typeof GetHPayPaymentMethodsSuccess
>;
export type GetHPayPaymentMethodsFailureAction = ReturnType<
  typeof GetHPayPaymentMethodsFailure
>;
export type ClearPaymentDataAction = ReturnType<typeof ClearPaymentData>;

export type Action =
  | GetPaymentsAction
  | GetPaymentsSuccessAction
  | GetPaymentsFailureAction
  | CreatePaymentAction
  | CreatePaymentSuccessAction
  | CreatePaymentFailureAction
  | CreatePaymentLinkAction
  | CreatePaymentLinkSuccessAction
  | CreatePaymentLinkFailureAction
  | GetPaymentLinksAction
  | GetPaymentLinksSuccessAction
  | GetPaymentLinksFailureAction
  | CreateHPayPaymentAction
  | CreateHPayPaymentSuccessAction
  | CreateHPayPaymentFailureAction
  | CreatePlacezPaymentAction
  | CreatePlacezPaymentSuccessAction
  | CreatePlacezPaymentFailureAction
  | CreateHPaySurchargeAction
  | CreateHPaySurchargeSuccessAction
  | CreateHPaySurchargeFailureAction
  | GetHPayPaymentMethodsAction
  | GetHPayPaymentMethodsSuccessAction
  | GetHPayPaymentMethodsFailureAction
  | ClearPaymentDataAction;

const sortPaymentToLatest = (payments) => {
  try {
    return payments.sort((a, b) => {
      const dateA = new Date(a.dateApplied);
      const dateB = new Date(b.dateApplied);
      return dateB.getTime() - dateA.getTime();
    });
  } catch (e) {
    console.error(e);
    return [];
  }
};
// Reducer
export default createReducer<State, Types, Action>(initialState, {
  [GET_PAYMENTS]: (state: State, action: GetPaymentsAction): State => state,
  [GET_PAYMENTS_SUCCESS]: (
    state: State,
    action: GetPaymentsSuccessAction
  ): State => ({
    ...state,
    payments: sortPaymentToLatest(action.payments),
  }),
  [GET_PAYMENTS_FAILURE]: (
    state: State,
    action: GetPaymentsFailureAction
  ): State => state,
  [CREATE_PAYMENT]: (state: State, action: CreatePaymentAction): State => state,
  [CREATE_PAYMENT_SUCCESS]: (
    state: State,
    action: CreatePaymentSuccessAction
  ): State => ({
    ...state,
    payments: sortPaymentToLatest([...state.payments, action.payment]),
  }),
  [CREATE_PAYMENT_FAILURE]: (
    state: State,
    action: CreatePaymentFailureAction
  ): State => state,
  [CREATE_PAYMENT_LINK]: (
    state: State,
    action: CreatePaymentLinkAction
  ): State => state,
  [CREATE_PAYMENT_LINK_SUCCESS]: (
    state: State,
    action: CreatePaymentLinkSuccessAction
  ): State => ({ ...state }),
  [CREATE_PAYMENT_LINK_FAILURE]: (
    state: State,
    action: CreatePaymentLinkFailureAction
  ): State => state,

  [GET_PAYMENT_LINKS]: (state: State, action: GetPaymentLinksAction): State =>
    state,
  [GET_PAYMENT_LINKS_SUCCESS]: (
    state: State,
    action: GetPaymentLinksSuccessAction
  ): State => ({
    ...state,
    paymentLinks: action.links,
  }),
  [GET_PAYMENT_LINKS_FAILURE]: (
    state: State,
    action: GetPaymentLinksFailureAction
  ): State => state,
  [CREATE_HPAY_PAYMENT]: (
    state: State,
    action: CreateHPayPaymentAction
  ): State => state,
  [CREATE_HPAY_PAYMENT_SUCCESS]: (
    state: State,
    action: CreateHPayPaymentSuccessAction
  ): State => ({
    ...state,
    hPayPayments: action.payments,
  }),
  [CREATE_HPAY_PAYMENT_FAILURE]: (
    state: State,
    action: CreateHPayPaymentFailureAction
  ): State => state,
  [CREATE_PLACEZ_PAYMENT]: (
    state: State,
    action: CreatePlacezPaymentAction
  ): State => state,
  [CREATE_PLACEZ_PAYMENT_SUCCESS]: (
    state: State,
    action: CreatePlacezPaymentSuccessAction
  ): State => ({
    ...state,
    placezPaymentResponse: action.payments,
  }),
  [CREATE_PLACEZ_PAYMENT_FAILURE]: (
    state: State,
    action: CreatePlacezPaymentFailureAction
  ): State => state,
  [CREATE_HPAY_SURCHAGE]: (
    state: State,
    action: CreateHPaySurchargeAction
  ): State => state,
  [CREATE_HPAY_SURCHARGE_SUCCESS]: (
    state: State,
    action: CreateHPaySurchargeSuccessAction
  ): State => ({
    ...state,
    hPaySurcharge: action.response,
  }),
  [CREATE_HPAY_SURCHARGE_FAILURE]: (
    state: State,
    action: CreateHPaySurchargeFailureAction
  ): State => state,
  [GET_HPAY_PAYMENT_METHODS]: (
    state: State,
    action: GetHPayPaymentMethodsAction
  ): State => state,
  [GET_HPAY_PAYMENT_METHODS_SUCCESS]: (
    state: State,
    action: GetHPayPaymentMethodsSuccessAction
  ): State => ({
    ...state,
    hPayPaymentMethods: action.methods,
  }),
  [GET_HPAY_PAYMENT_METHODS_FAILURE]: (
    state: State,
    action: GetHPayPaymentMethodsFailureAction
  ): State => state,
  [CLEAR_PAYMENT_DATA]: (
    state: State,
    action: ClearPaymentDataAction
  ): State => ({
    ...state,
    hPayPaymentMethods: null,
    hPayPayments: null,
    placezPaymentResponse: null,
    paymentLinks: [],
  }),
});
