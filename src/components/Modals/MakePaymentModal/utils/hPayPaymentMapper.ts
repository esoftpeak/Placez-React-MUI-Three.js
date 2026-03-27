import { HpayPaymentPayload } from '../../../../api/payments/models/Payment';
import {CENT, MERCHANT_ID} from './constant';
import {Scene} from "../../../../api";

export const createHpayPaymentMapper = ({
  line1,
  city,
  country,
  postalCode,
  stateProvince,
  email,
  payor,
  data,
  invoiceTotal,
  surCharge = 0,
  invoiceLineItems,
  scene
}: {
  line1: string;
  city: string;
  country: string;
  postalCode: string;
  stateProvince: string;
  email: string;
  payor: string;
  data: any;
  invoiceTotal: any;
  invoiceLineItems: any;
  surCharge: number;
  scene: Scene
}): HpayPaymentPayload => ({
  rbits: [
    {
      type: 'address',
      receive_time: 2085851003,
      source: 'user',
      address: {
        origin_address: {
          line1,
          city,
          country,
          postal_code: postalCode,
          region: stateProvince,
        },
      },
    },
    {
      type: 'transaction_details',
      receive_time: 2085851003,
      source: 'partner_database',
      transaction_details: {
        itemized_receipt: invoiceLineItems
          ?.filter((each) => !!each?.price)
          ?.map((each) => ({
            amount: each.total,
            currency: 'USD',
            description: each.description,
            item_price: each.price,
            quantity: each.quantity,
          })),
        note: '',
      },
    },
  ],
  amount: (invoiceTotal + surCharge) * CENT,
  tip: 0,
  applySurcharge: !!surCharge,
  surchargeRate: surCharge,
  serialNumber: 'USA34080',
  auto_capture: true,
  currency: 'USD',
  custom_data: {
    ce_contact_id: `${scene?.id}`,
    ce_contact_num: `${scene?.id}`,
    ce_order_id: `${scene?.id}`,
    ce_order_num: `${scene?.id}`,
    ce_transaction_type: 'Sale',
  },
  fee_amount: 0,
  initiated_by: 'customer',
  account_id: MERCHANT_ID,
  payment_method: {
    credit_card: {
      auto_update: false,
      card_holder: {
        address: {
          country,
          postal_code: postalCode,
        },
        email,
        holder_name: payor,
      },
      card_on_file: true,
      virtual_terminal_mode: 'web',
    },
    token: {
      id: data.id,
    },
  },
});
