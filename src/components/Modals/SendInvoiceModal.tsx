import React, { ChangeEvent, useEffect, useMemo, useState } from 'react';
import withModalContext, { WithModalContext } from './withModalContext';
import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Theme,
  Typography,
  useTheme,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Dialog } from '@mui/material';
import { placezApi, Scene } from '../../api';
import formModalStyles from '../Styles/FormModal.css';
import { useDispatch, useSelector } from 'react-redux';
import {
  formatItemizedReceipt,
  HPayPaymentLink,
} from '../../api/payments/models/Payment';
import { CreatePaymentLink } from '../../reducers/payment';
import { Utils } from '../../blue/core/utils';
import { getFromLocalStorage } from '../../sharing/utils/localStorageHelper';
import { LocalStorageKey } from '../Hooks/useLocalStorageState';
import { InvoiceLineItem } from '../Invoicing/InvoiceLineItemModel';
import { ReduxState } from '../../reducers';
import { addDays } from 'date-fns/esm';
import { format } from 'date-fns';
import NameAndEmail from '../Utils/NameAndEmail';
import { useForm } from 'react-hook-form';
import { types as uiTypes } from '../../reducers/ui';
import PlacezTextField from '../PlacezUIComponents/PlacezTextField';

interface Props extends WithModalContext {
  scene: Scene;
  invoiceLineItems: InvoiceLineItem[];
  invoiceTotal: number;
}

const handleClose = (modalProps) => (event, reason) => {
  if (reason !== 'backdropClick') {
    return;
  }
  modalProps.modalContext.hideModal();
};

const SendInvoiceModal = (modalProps: Props) => {
  const { props } = modalProps.modalContext;
  const { scene, invoiceLineItems } = props;
  const user = useSelector((state: ReduxState) => state.oidc.user);
  const clients = useSelector((state: ReduxState) => state.client.clients);

  const styles = makeStyles<Theme>(formModalStyles);
  const classes = styles(props);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid },
    setValue,
    getValues,
    watch,
  } = useForm<Partial<HPayPaymentLink> & extraFormTypes>({
    mode: 'onSubmit',
    defaultValues: {
      ...props.client,
    },
  });

  const values = getValues();
  const activeClient = useMemo(() => {
    return clients.find((client) => client?.id === getValues('clientId'));
  }, [clients, getValues('clientId')]);

  const [numberOfPayments, setNumberOfPayments] = useState<number>(1);
  const [senderName, setSenderName] = useState<string>('');
  const [senderEmail, setSenderEmail] = useState<string>('');
  const paymentTermsNet = getFromLocalStorage<number>(
    LocalStorageKey.PaymentTermsNet
  );

  const dispatch = useDispatch();
  const [paymentLinkSettings, setPaymentLinkSettings] = useState<any>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await placezApi.getPaymentLinkSettings();
        setPaymentLinkSettings(
          response.parsedBody[response.parsedBody.length - 1]
        );
      } catch (err) {
        console.error('Failed to load payment link settings:', err);
      }
    };

    loadSettings();
  }, []);

  useEffect(() => {
    if (paymentLinkSettings) {
      setSenderName(paymentLinkSettings.senderName);
      setSenderEmail(paymentLinkSettings.senderEmail);
    }
  }, [paymentLinkSettings]);

  const handleInput =
    (setter: Function) => (event: ChangeEvent<HTMLInputElement>) => {
      setter(event.target.value);
    };
  /*
  const paymentLinkSettings = useSelector((state: ReduxState) =>
    state.settings.userSettings.find(
      (setting) => setting.name === 'Payment_Link_Settings'
    )
  );
  */
  const dueDate = addDays(
    new Date(),
    paymentLinkSettings?.paymentLinkExpVar ?? 30
  ).toISOString();

  const sendInvoice = () => {
    const values = getValues();

    if (props.invoiceTotal === 0) {
      dispatch({
        type: uiTypes.TOAST_MESSAGE,
        message: 'Cannot send invoice with a total of $0.',
        messageType: 'error',
      });
      return;
    }
    const invoice: HPayPaymentLink = {
      accountId: '47690d59-27fe-43c3-8ff5-1d30903b01bf',
      paymentNumber: crypto.randomUUID(), //GUID
      invoiceNumber: scene.id.toString(),
      invoiceIntroductionMessage:
        'Thank you for choosing HORIZON for your recent order. Please click the <br />"Authorize Now" button below to authorize and store your credit card for future payments on your order.',
      invoiceMessage:
        'If you have any question regarding this credit card authorization, please call our office. Thanks again for doing business with HORIZON.<br /><br />Regards,<br /><br />Your HORIZON Team',
      payer: values.payor,
      ccEmail: watch('ccEmail'),
      payerEmail: values.payorEmail,
      replyEmail: 'sonny.elhamahmy@axiaprime.com',
      sendEmail: true,
      senderName: watch('senderName'),
      surchargePercent: activeClient.organization?.surchargePercentage || 0,
      serialNumber: activeClient.organization?.serialNumber || '',
      subSystem: 3,
      amountToCharge: props.invoiceTotal,
      transaction_details: {
        itemized_receipt: formatItemizedReceipt(invoiceLineItems),
      },
      dueDate: dueDate,
      merchantName: user?.profile?.name ?? '',
      productName: scene.name,
      expirationDate: dueDate,
      createdUtcDateTime: new Date().toISOString(),
    };
    dispatch(CreatePaymentLink(invoice, modalProps.modalContext.hideModal));
  };

  type extraFormTypes = {
    clientId: number;
  };

  const onClientSelect = (client) => {
    setValue('payor', client.name);
    setValue('payorEmail', client.email);
  };

  const theme = useTheme();

  useEffect(() => {
    setValue('ccEmail', paymentLinkSettings?.paymentLinkEmail || '');
    setValue('senderName', paymentLinkSettings?.paymentLinkSender || '');
  }, [paymentLinkSettings]);

  return (
    <Dialog
      classes={{
        paper: classes.modal,
      }}
      scroll="paper"
      open={true}
      aria-labelledby="place-modal"
      fullWidth={true}
      maxWidth="md"
      onClose={handleClose(modalProps)}
      {...props}
    >
      <DialogTitle className={classes.dialogTitle}>Send Invoice</DialogTitle>
      <DialogContent
        className={classes.dialogContent}
        style={{
          height: '600px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignContent: 'stretch',
            width: '409px',
          }}
        >
          <div style={{ alignSelf: 'start' }}>Amount</div>
          <Typography
            variant="h3"
            style={{
              ...theme.PlacezBorderStyles,
              alignSelf: 'center',
              padding: '10px 90px',
              fontWeight: 'bold',
            }}
          >
            {Utils.currencyFormat(props.invoiceTotal)}
          </Typography>
          <Typography variant="h6" style={{ margin: '10px 40px' }}>
            Due Before {format(new Date(dueDate), 'P')}
          </Typography>
          <NameAndEmail
            register={register}
            watch={watch}
            control={control}
            getValues={getValues}
            onClientSelect={onClientSelect}
          />
          <PlacezTextField
            {...register('senderName', {
              required: 'Name is required',
            })}
            required
            id="standard-required"
            label="Sender Name"
            InputLabelProps={{ shrink: !!watch('senderName') }}
          />
          <PlacezTextField
            {...register('ccEmail', {
              required: 'Email is required',
            })}
            required
            id="standard-required"
            label="Sender Email"
            InputLabelProps={{ shrink: !!watch('ccEmail') }}
          />
        </div>
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <Button
          variant="outlined"
          onClick={(e) => modalProps.modalContext.hideModal()}
        >
          Cancel
        </Button>
        <Button
          disabled={
            getValues('payor') === '' ||
            getValues('payorEmail')?.search('.com') === -1 ||
            dueDate === undefined
          }
          color="primary"
          variant="outlined"
          onClick={sendInvoice}
        >
          Send
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default withModalContext(SendInvoiceModal);
