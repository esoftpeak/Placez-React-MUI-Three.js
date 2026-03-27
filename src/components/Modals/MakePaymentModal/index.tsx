import React, { useEffect, useState } from 'react';
import withModalContext, { WithModalContext } from '../withModalContext';
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Step,
  StepLabel,
  Stepper,
  Typography,
  IconButton,
  Tooltip,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useTheme } from '@mui/material/styles';

import PlacezTextField from '../../PlacezUIComponents/PlacezTextField';
import PlacezActionButton from '../../PlacezUIComponents/PlacezActionButton';
import { ControlledPlacezSelector } from '../../PlacezUIComponents/ControlledPlacezSelector';
import ClientSearch from '../../Utils/ClientSearch';
import { AddressSearch } from '../../AddressInfoSearch/AdressSearch';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { ReduxState } from '../../../reducers';
import {
  CreateHPayPayment,
  GetHPayPaymentMethods,
  CreateHPaySurcharge,
} from '../../../reducers/payment';
import { MERCHANT_ID, PAYMENT_GATEWAY_URL } from './utils/constant';
import { Utils } from '../../../blue/core/utils';
import SurchargeModal from '../SurchargeConfirmationModal';
import { addDays, format } from 'date-fns';
import { HpayPaymentPayload } from '../../../api/payments/models/Payment';
import { createHpayPaymentMapper } from './utils/hPayPaymentMapper';
import { Scene } from '../../../api';
import { InvoiceLineItem } from '../../Invoicing/InvoiceLineItemModel';
import { InfoOutlined } from '@mui/icons-material';
import { placezApi } from '../../../api';

const steps = ['Payment Method', 'Payment Amount'];

interface Props extends WithModalContext {
  scene: Scene;
  invoiceLineItems: InvoiceLineItem[];
  invoiceTotal: number;
  onRequestClose: () => void;
}

const useStyles = makeStyles((theme: any) => ({
  modal: { border: '1px solid #5C236F', borderRadius: '12px' },

  dialogTitle: {
    textAlign: 'center',
    padding: '12px !important',
    fontWeight: 'bold',
    backgroundColor:
      theme.palette.mode === 'dark'
        ? `${theme.palette.background.paper} !important`
        : '#DED3E2',
    color:
      theme.palette.mode === 'dark'
        ? `${theme.palette.text.primary} !important`
        : '#000',
    borderBottom:
      theme.palette.mode === 'dark'
        ? `1px solid ${theme.palette.divider}`
        : 'none',
  },

  stepper: {
    padding: '24px 48px',
    backgroundColor:
      theme.palette.mode === 'dark'
        ? `${theme.palette.background.paper} !important`
        : 'transparent',
    '& .MuiStepLabel-label': {
      color:
        theme.palette.mode === 'dark'
          ? `${theme.palette.text.primary} !important`
          : 'inherit',
    },
    '& .MuiStepIcon-root': {
      fontSize: '32px',
      border:
        theme.palette.mode === 'dark'
          ? `3px solid ${theme.palette.divider}`
          : '3px solid #DED3E2',
      borderRadius: '50%',
      color:
        theme.palette.mode === 'dark' ? theme.palette.background.paper : '#fff',
    },
    '& .MuiStepIcon-active': { color: '#DED3E2' },
    '& .MuiStepIcon-completed': { color: '#DED3E2' },
  },

  amountBox: {
    textAlign: 'center',
    fontSize: '3rem',
    fontWeight: 'bold',
    border: '4px solid #5C236F',
    borderRadius: '12px',
    padding: '24px 48px',
    margin: '32px auto',
    width: 'fit-content',
    minWidth: '320px',
    backgroundColor:
      theme.palette.mode === 'dark'
        ? `${theme.palette.background.paper} !important`
        : '#fff',
    color:
      theme.palette.mode === 'dark'
        ? `${theme.palette.text.primary} !important`
        : 'inherit',
  },

  subHeader: {
    padding: '6px 12px',
    margin: '6px 0',
    backgroundColor:
      theme.palette.mode === 'dark'
        ? `${theme.palette.action.hover} !important`
        : '#f5f5f5',
    color:
      theme.palette.mode === 'dark'
        ? `${theme.palette.text.primary} !important`
        : 'inherit',
  },

  tipButton: {
    fontSize: '13px',
    color: '#34AA44',
    fontWeight: '600',
  },

  divider: {
    width: 1,
    height: 20,
    backgroundColor: '#ccc',
    margin: '0 8px',
  },

  savedCardRow: {
    padding: '12px 24px',
    borderBottom:
      theme.palette.mode === 'dark'
        ? `1px solid ${theme.palette.divider}`
        : '1px solid #eee',
    '&:hover': {
      backgroundColor:
        theme.palette.mode === 'dark' ? theme.palette.action.hover : '#f9f9f9',
      cursor: 'pointer',
    },
  },

  addCardLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#1976d2',
    cursor: 'pointer',
    fontSize: '14px',
  },
}));

const MakePaymentModal = (modalProps: Props) => {
  const { props } = modalProps.modalContext;
  const { scene, invoiceLineItems } = props;

  const theme = useTheme();
  const classes = useStyles();

  const [invoiceTotal, setInvoiceTotal] = useState<number | null>(
    props.invoiceTotal
  );

  const [savedCards, setSavedCards] = useState<
    Array<{
      id: number;
      name: string;
      cardType: string;
      lastFour: string;
      token: any;
    }>
  >([]);
  const [loadingSavedCards, setLoadingSavedCards] = useState(true);

  const dispatch = useDispatch();

  const [activeStep, setActiveStep] = useState(0);
  const [tokenizedCard, setTokenizedCard] = useState<any>(null);
  const [savedCardToken, setSavedCardToken] = useState<any | null>(null);
  const [selectedSavedCardId, setSelectedSavedCardId] = useState<number | null>(
    null
  );
  const [savedCard, setSavedCard] = useState<string | null>(null);
  const [savedCardName, setSavedCardName] = useState<string | null>(null);
  const [isSurchargeModalOpen, setIsSurchargeModalOpen] = useState(false);
  const [addCardModalOpen, setAddCardModalOpen] = useState(false);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [tipAmount, setTipAmount] = useState(0);
  const [subtotalInput, setSubtotalInput] = useState('');
  const [tipInput, setTipInput] = useState('');
  const [payor, setPayor] = useState<{ id: number; name: string } | null>(null);

  const hPaySurchargeResponse = useSelector(
    (state: ReduxState) => state.payment.hPaySurcharge
  );
  const activeClient = useSelector((state: ReduxState) =>
    state.client.clients.find((c) => c.id === state.client.selectedClientId)
  );

  const totalWithTip = invoiceTotal + tipAmount;
  const dueDate = addDays(new Date(), 30);

  const { control, register, watch, setValue, getValues } = useForm({
    defaultValues: {
      paymentType: 'Credit Card',
      payor: '',
      email: '',
      memo: '',
      checkDate: '',
      checkNumber: '',
      payor_address: {
        line1: '',
        city: '',
        stateProvince: '',
        postalCode: '',
        country: 'US',
      },
    },
  });

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (typeof event.data === 'string' && event.data.startsWith('{')) {
        try {
          const data = JSON.parse(event.data);
          if (data?.id?.startsWith('t1_tok_')) {
            setTokenizedCard(data);
            setAddCardModalOpen(false);
          }
        } catch {}
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  useEffect(() => {
    if (!tokenizedCard) return;

    dispatch(
      GetHPayPaymentMethods({
        merchantId: MERCHANT_ID,
        paymentMethodsId: tokenizedCard.id,
      })
    );
    if (activeClient?.organization?.applySurcharge) {
      const { tipPercent1, tipPercent2, tipPercent3 } =
        activeClient.organization;
      const payload = {
        total: invoiceTotal,
        tip: tipPercent1 || tipPercent2 || tipPercent3 || 0,
        applySurcharge: true,
        surchargeRate: activeClient.organization.surchargePercentage,
        merchantId: MERCHANT_ID,
        paymentMethodId: tokenizedCard.id,
      };
      dispatch(CreateHPaySurcharge(payload));
    }
  }, [tokenizedCard]);

  useEffect(() => {
    setSubtotalInput(Utils.currencyFormat(invoiceTotal || 0));
    setTipInput(Utils.currencyFormat(0));
  }, [invoiceTotal]);

  useEffect(() => {
    const payorName = watch('payor');
    const paymentType = watch('paymentType');

    if (paymentType !== 'Credit Card' || !payor) {
      setSavedCards([]);
      setLoadingSavedCards(false);
      return;
    }

    setLoadingSavedCards(true);

    placezApi
      .getClientCards(payor?.id)
      .then((response) => {
        const { savedCards } = response.parsedBody;

        const mappedCards = savedCards
          .filter((card: any) => !card.deleted)
          .map((card: any) => ({
            id: card.id,
            name: card.cardHolderName || payorName || 'Cardholder',
            cardType: card.cardType || 'Card',
            lastFour: card.ccLastFour,
            token: { id: card.paymentMethodId },
          }));

        setSavedCards(mappedCards);
      })
      .catch((error) => {
        console.error('Failed to load saved cards', error);
        setSavedCards([]);
      })
      .finally(() => {
        setLoadingSavedCards(false);
      });
  }, [activeClient?.id, watch('paymentType'), watch('payor'), payor]);

  const handleTipClick = (percent: number) => {
    const tip = Math.round(invoiceTotal * percent * 100) / 100;
    setTipAmount(tip);
    setTipInput(Utils.currencyFormat(tip || 0));
  };

  const handleSavedCardSelect = (
    id: number,
    token: any,
    card: string,
    name: string
  ) => {
    setSelectedSavedCardId(id);
    setSavedCardToken(token);
    setSavedCard(card);
    setSavedCardName(name);
    setTokenizedCard(null);
  };

  const handleActualPayment = () => {
    const payor = getValues('payor');
    const email = getValues('email');

    const payload: HpayPaymentPayload = createHpayPaymentMapper({
      line1: watch('payor_address.line1'),
      city: watch('payor_address.city'),
      country: watch('payor_address.country'),
      postalCode: watch('payor_address.postalCode'),
      stateProvince: watch('payor_address.stateProvince'),
      email,
      payor,
      data: savedCardToken || tokenizedCard,
      surCharge: hPaySurchargeResponse?.surcharge,
      invoiceTotal,
      invoiceLineItems,
      scene,
    });

    dispatch(CreateHPayPayment(payload));
  };

  const handleProceedToPayment = () => {
    if (
      activeClient?.organization?.applySurcharge &&
      (tokenizedCard || savedCardToken)
    ) {
      dispatch(
        CreateHPaySurcharge({
          total: invoiceTotal,
          tip: tipAmount,
          applySurcharge: true,
          surchargeRate: activeClient.organization.surchargePercentage,
          merchantId: MERCHANT_ID,
          paymentMethodId: tokenizedCard?.id || savedCardToken?.id,
        })
      );
    } else {
      setIsSurchargeModalOpen(true);
    }
  };

  useEffect(() => {
    if (hPaySurchargeResponse?.surcharge > 0) {
      setIsSurchargeModalOpen(true);
    }
  }, [hPaySurchargeResponse]);

  const watchedPaymentType = watch('paymentType');

  return (
    <>
      <SurchargeModal
        isShowModal={isSurchargeModalOpen}
        invoiceTotal={totalWithTip}
        hPaySurchargeResponse={hPaySurchargeResponse}
        onClickCancel={() => setIsSurchargeModalOpen(false)}
        onClickProceed={() => {
          setIsSurchargeModalOpen(false);
          handleActualPayment();
        }}
      />

      <Dialog open fullWidth maxWidth="md" classes={{ paper: classes.modal }}>
        <DialogTitle className={classes.dialogTitle}>Make Payment</DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          <Stepper
            activeStep={activeStep}
            alternativeLabel
            className={classes.stepper}
          >
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {activeStep === 0 && (
            <>
              <Box className={classes.subHeader}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Payment Method
                </Typography>
              </Box>

              <Box>
                <Box sx={{ px: 4 }}>
                  <ControlledPlacezSelector
                    control={control}
                    name="paymentType"
                    label="Payment Type"
                    options={[
                      { label: 'Credit Card', value: 'Credit Card' },
                      { label: 'New Card', value: 'New Card' },
                      { label: 'Cash/Other', value: 'Cash' },
                      { label: 'Check', value: 'Check' },
                    ]}
                  />

                  {watchedPaymentType === 'Cash' && (
                    <Box>
                      <PlacezTextField
                        {...register('memo')}
                        label="Memo"
                        placeholder="Enter memo (optional)"
                        fullWidth
                      />
                    </Box>
                  )}

                  {watchedPaymentType === 'Check' && (
                    <Box
                      sx={{
                        mt: 1,
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: 2,
                      }}
                    >
                      <PlacezTextField
                        {...register('checkDate')}
                        label="Check Date"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                      />

                      <PlacezTextField
                        {...register('checkNumber')}
                        label="Check Number"
                        placeholder="#####"
                        InputLabelProps={{ shrink: !!watch('checkNumber') }}
                      />
                    </Box>
                  )}
                  <Box sx={{ mb: 2 }} />
                </Box>

                <Box className={classes.subHeader}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Payor Information
                  </Typography>
                </Box>

                <Box sx={{ px: 4 }}>
                  <ClientSearch
                    control={control}
                    watch={watch}
                    register={register}
                    onClientSelect={(client) => {
                      setValue('payor', client.name);
                      setValue('email', client.email);
                      setValue('payor_address', {
                        line1: client.address.line1,
                        stateProvince: client.address.stateProvince,
                        city: client.address.city,
                        postalCode: client.address.postalCode,
                        country: client.address.country,
                      });
                      setPayor({ id: client.id, name: client.name });
                    }}
                  />

                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      color: theme.palette.text.secondary,
                      mb: 1,
                    }}
                  >
                    or enter manually
                  </Typography>

                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 3,
                      mt: 2,
                    }}
                  >
                    <PlacezTextField
                      {...register('payor')}
                      label="Payor Name"
                      InputLabelProps={{ shrink: !!watch('payor') }}
                    />

                    <PlacezTextField
                      {...register('email')}
                      label="Email"
                      type="email"
                      InputLabelProps={{ shrink: !!watch('email') }}
                    />
                  </Box>

                  <Box sx={{ mt: 2 }}>
                    <AddressSearch
                      onAddressSelect={(addr) => {
                        setValue('payor_address', addr);
                        setValue('payor_address.country', addr.country);
                        setValue(
                          'payor_address.stateProvince',
                          addr.stateProvince
                        );
                        setValue('payor_address.postalCode', addr.postalCode);
                        setValue('payor_address.city', addr.city);
                        setValue('payor_address.line1', addr.line1);
                      }}
                    />
                  </Box>

                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      color: theme.palette.text.secondary,
                      mb: 1,
                    }}
                  >
                    or enter manually
                  </Typography>

                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 3,
                    }}
                  >
                    <PlacezTextField
                      {...register('payor_address.line1')}
                      label="Address Line 1 *"
                      InputLabelProps={{
                        shrink: !!watch('payor_address.line1'),
                      }}
                    />

                    <PlacezTextField
                      {...register('payor_address.city')}
                      label="City"
                      InputLabelProps={{
                        shrink: !!watch('payor_address.city'),
                      }}
                    />

                    <PlacezTextField
                      {...register('payor_address.stateProvince')}
                      label="State"
                      InputLabelProps={{
                        shrink: !!watch('payor_address.stateProvince'),
                      }}
                    />

                    <PlacezTextField
                      {...register('payor_address.postalCode')}
                      label="Zip Code *"
                      InputLabelProps={{
                        shrink: !!watch('payor_address.postalCode'),
                      }}
                    />
                  </Box>
                  <Box sx={{ mb: 2 }} />
                </Box>

                {watchedPaymentType === 'Credit Card' && watch('payor') && (
                  <>
                    <Box
                      className={classes.subHeader}
                      sx={{
                        mt: 6,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignContent: 'center',
                      }}
                    >
                      <Typography variant="subtitle1" fontWeight="bold">
                        Client&apos;s Saved Credit Cards
                        <Tooltip title="To add/remove saved credit cards, please go to Client settings.">
                          <InfoOutlined
                            fontSize="small"
                            sx={{ ml: 1, mb: 0.5, verticalAlign: 'middle' }}
                          />
                        </Tooltip>
                      </Typography>
                    </Box>

                    <Box sx={{ px: 2 }}>
                      {loadingSavedCards ? (
                        <Box sx={{ py: 3, textAlign: 'center' }}>
                          <Typography color="text.secondary">
                            Loading saved cards...
                          </Typography>
                        </Box>
                      ) : savedCards.length === 0 ? (
                        <Box sx={{ py: 3, textAlign: 'center' }}>
                          <Typography color="text.secondary">
                            No saved credit cards found.
                          </Typography>
                        </Box>
                      ) : (
                        savedCards.map((card) => (
                          <Box
                            key={card.id}
                            className={classes.savedCardRow}
                            sx={{
                              bgcolor:
                                selectedSavedCardId === card.id
                                  ? theme.palette.mode === 'dark'
                                    ? theme.palette.action.selected
                                    : '#DED3E2'
                                  : 'transparent',
                            }}
                            onClick={() =>
                              handleSavedCardSelect(
                                card.id,
                                card.token,
                                `${card.cardType} •••• ${card.lastFour}`,
                                card.name
                              )
                            }
                          >
                            <Typography
                              fontWeight={
                                selectedSavedCardId === card.id
                                  ? 'bold'
                                  : 'normal'
                              }
                            >
                              {card.name} - {card.cardType} •••• {card.lastFour}
                            </Typography>
                          </Box>
                        ))
                      )}
                    </Box>
                  </>
                )}

                {watchedPaymentType === 'New Card' && (
                  <Box
                    sx={{
                      px: 4,
                      py: 3,
                      display: 'flex',
                      justifyContent: 'space-around',
                    }}
                  >
                    {!tokenizedCard && (
                      <PlacezActionButton
                        onClick={() => setAddCardModalOpen(true)}
                      >
                        Enter New Card Information
                      </PlacezActionButton>
                    )}

                    {tokenizedCard && (
                      <Typography sx={{ mt: 2, color: 'green' }}>
                        New card registered successfully
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            </>
          )}

          {activeStep === 1 && (
            <Box>
              <Box className={classes.subHeader}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Confirm & Submit Payment
                </Typography>
              </Box>

              <Box
                sx={{
                  maxWidth: 600,
                  my: '6px',
                  mx: 'auto',
                  p: 4,
                  border: `2px solid ${theme.palette.divider}`,
                  borderRadius: '8px',
                  backgroundColor:
                    theme.palette.mode === 'dark'
                      ? theme.palette.background.paper
                      : '#F3F4F6',
                }}
              >
                <PlacezTextField
                  label="Subtotal"
                  value={subtotalInput}
                  onChange={(e) => {
                    setSubtotalInput(e.target.value.replace(/[^0-9.]/g, ''));
                  }}
                  onBlur={() => {
                    const val = parseFloat(subtotalInput);
                    setSubtotalInput(Utils.currencyFormat(val || 0));
                    setInvoiceTotal(val || 0);
                  }}
                  fullWidth
                />

                <Box
                  sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}
                >
                  <Box sx={{ flex: 1 }}>
                    <PlacezTextField
                      label="Tip"
                      value={tipInput}
                      onChange={(e) => {
                        setTipInput(e.target.value.replace(/[^0-9.]/g, ''));
                      }}
                      onBlur={() => {
                        const val = parseFloat(tipInput);
                        setTipInput(Utils.currencyFormat(val || 0));
                        setTipAmount(val || 0);
                      }}
                      fullWidth
                    />
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton
                      size="small"
                      onClick={() => handleTipClick(0.1)}
                    >
                      <Typography className={classes.tipButton}>
                        +10%
                      </Typography>
                    </IconButton>
                    <Box component="span" className={classes.divider} />
                    <IconButton
                      size="small"
                      onClick={() => handleTipClick(0.15)}
                    >
                      <Typography className={classes.tipButton}>
                        +15%
                      </Typography>
                    </IconButton>
                    <Box component="span" className={classes.divider} />
                    <IconButton
                      size="small"
                      onClick={() => handleTipClick(0.2)}
                    >
                      <Typography className={classes.tipButton}>
                        +20%
                      </Typography>
                    </IconButton>
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mb: 1,
                    mt: 2,
                  }}
                >
                  <Typography>Processing Fee</Typography>
                  <Typography fontWeight="bold">
                    {Utils.currencyFormat(
                      hPaySurchargeResponse?.surcharge || 0
                    )}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mb: 2,
                  }}
                >
                  <Typography>Payment Total</Typography>
                  <Typography fontWeight="bold">
                    {Utils.currencyFormat(totalWithTip)}
                  </Typography>
                </Box>

                <Typography
                  variant="body2"
                  sx={{ mt: 1, color: 'text.secondary' }}
                >
                  Due Before {format(dueDate, 'PPP')}
                </Typography>
              </Box>

              {savedCard && (
                <Box
                  sx={{
                    maxWidth: 600,
                    my: '6px',
                    mx: 'auto',
                    p: 4,
                    border: `2px solid ${theme.palette.divider}`,
                    borderRadius: '8px',
                    backgroundColor:
                      theme.palette.mode === 'dark'
                        ? theme.palette.background.paper
                        : '#F3F4F6',
                    gap: '5px',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Box>Payment Method:</Box>
                    <Box sx={{ fontWeight: 'bold' }}>
                      {savedCardName} - {savedCard}
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            backgroundColor:
              theme.palette.mode === 'dark'
                ? theme.palette.background.paper
                : '#DED3E2',
            borderTop:
              theme.palette.mode === 'dark'
                ? `1px solid ${theme.palette.divider}`
                : 'none',
            justifyContent: 'center',
            py: 2.5,
            gap: 3,
          }}
        >
          {activeStep > 0 && (
            <PlacezActionButton onClick={() => setActiveStep((s) => s - 1)}>
              Back
            </PlacezActionButton>
          )}

          <PlacezActionButton
            onClick={() => modalProps.modalContext.hideModal()}
          >
            Cancel
          </PlacezActionButton>

          {activeStep === 0 &&
            watchedPaymentType !== 'Credit Card' &&
            watchedPaymentType !== 'New Card' && (
              <PlacezActionButton onClick={() => modalProps.onRequestClose?.()}>
                Confirm
              </PlacezActionButton>
            )}

          {activeStep === 0 && watchedPaymentType === 'Credit Card' && (
            <PlacezActionButton
              onClick={() => setActiveStep(1)}
              disabled={
                (!tokenizedCard && !savedCardToken) ||
                !watch('payor_address.postalCode') ||
                !watch('payor_address.line1')
              }
            >
              Next
            </PlacezActionButton>
          )}

          {activeStep === 0 && watchedPaymentType === 'New Card' && (
            <PlacezActionButton
              onClick={() => setActiveStep(1)}
              disabled={
                !watch('payor_address.postalCode') ||
                !watch('payor_address.line1')
              }
            >
              Next
            </PlacezActionButton>
          )}

          {activeStep === 1 && (
            <>
              {watchedPaymentType === 'New Card' && !tokenizedCard && (
                <PlacezActionButton onClick={() => setAddCardModalOpen(true)}>
                  Enter Card Information
                </PlacezActionButton>
              )}

              {(watchedPaymentType !== 'New Card' ||
                (watchedPaymentType === 'New Card' && tokenizedCard)) && (
                <PlacezActionButton
                  onClick={handleProceedToPayment}
                  disabled={!tokenizedCard && !savedCardToken}
                >
                  Submit Payment
                </PlacezActionButton>
              )}
            </>
          )}
        </DialogActions>
      </Dialog>

      <Dialog
        open={addCardModalOpen}
        onClose={() => setAddCardModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle className={classes.dialogTitle}>
          Enter Card Details
        </DialogTitle>
        <DialogContent sx={{ p: 0, height: 660, position: 'relative' }}>
          {iframeLoading && (
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                bgcolor:
                  theme.palette.mode === 'dark'
                    ? 'rgba(0,0,0,0.55)'
                    : 'rgba(255,255,255,0.85)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                zIndex: 10,
              }}
            >
              <Typography variant="h6" color="text.primary">
                Loading secure card form...
              </Typography>
            </Box>
          )}
          <Box
            sx={{
              width: '100%',
              height: '100%',
              border: 'none',
              overflow: 'hidden',
            }}
          >
            <iframe
              src={PAYMENT_GATEWAY_URL}
              style={{ width: '100%', height: '100%', border: 'none' }}
              onLoad={() => setIframeLoading(false)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <PlacezActionButton onClick={() => setAddCardModalOpen(false)}>
            Close
          </PlacezActionButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default withModalContext(MakePaymentModal);
