
import React, { useEffect, useState } from 'react';
import { Box, createStyles, Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useForm } from 'react-hook-form';
import {
  HPAY_API_KEY,
  MERCHANT_ID,
  PAYMENT_GATEWAY_URL,
} from '../Modals/MakePaymentModal/utils/constant';
import { ToastMessage } from '../../reducers/ui';
import { useDispatch } from 'react-redux';
import { Client, placezApi } from '../../api';

interface CardPaymentFormProps {
  onSubmit: (data: CardFormValues) => void;
  client?: Client;
}

export type CardFormValues = {
  cardNumber: string;
  expiration: string;
  securityCode: string;
  country: string;
  postalCode: string;
};

const useStyles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    root: {
      height: '500px',
      display: 'flex',
      justifyContent: 'center',
    },
    cardWrapper: {
      width: '100%',
      maxWidth: 420,
      borderRadius: 8,
      border: '1px solid #E0E0E0',
      backgroundColor: '#FFFFFF',
      padding: 24,
      boxSizing: 'border-box',
      margin: 'auto',
    },
    headerRow: {
      display: 'flex',
      alignItems: 'center',
      columnGap: 8,
      marginBottom: 16,
    },
    // common style for all inputs to match Stripe-like look
    field: {
      marginTop: 4,
      marginBottom: 16,
      '& .MuiInputLabel-root': {
        fontSize: 13,
        color: '#4F4F4F',
      },
      '& .MuiOutlinedInput-root': {
        borderRadius: 4,
      },
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: '#E0E0E0',
      },
      '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: '#C5CED6',
      },
      '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.primary.main,
        borderWidth: 1,
      },
      '& .MuiInputBase-input': {
        padding: '10px 12px',
      },
    },
    twoColGrid: {
      width: '100%',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gridColumnGap: 16,
      gridRowGap: 0,
      marginTop: 4,
      marginBottom: 8,
    },
    brandImage: {
      height: 20,
      marginLeft: 5,
    },
    legalText: {
      marginTop: '15px !important',
      fontSize: '13px !important',
      lineHeight: 1.4,
      color: theme.palette.text.secondary,
      textAlign: 'left',
    },
    submitButton: {
      marginTop: '20px !important',
      display: 'block !important',
      width: '408px',
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      height: 40,
      borderRadius: 4,
      textTransform: 'uppercase',
      fontSize: 14,
      '&:hover': {
        backgroundColor: theme.palette.primary.dark,
      },
    },
    inputLabel: {
      color: '#000000b8',
      marginTop: '10px !important',
    },
  })
);

const CardPaymentForm: React.FC<CardPaymentFormProps> = ({
  onSubmit,
  client,
}) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [iframeLoading, setIframeLoading] = useState(true);

  // This is a listener that parses tokenized card data from payrix
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (
        !event.data ||
        event.data === 'unchanged' ||
        typeof event.data !== 'string'
      )
        return;
      const data = JSON.parse(event.data);
      const response = await fetch(
        `https://dev-payment-gateway.horizoncloud.com/api/hpay/payment_methods/${String(data?.id)}`,
        {
          method: 'GET',
          headers: {
            accept: 'text/plain',
            merchantId: MERCHANT_ID,
            Processor: '5',
            'HPay-Api-Key': HPAY_API_KEY,
          },
        }
      );

      const responseBody = await response.json();

      try {
        if (data?.id?.startsWith('t1_tok_')) {
          placezApi.postClientCard(client?.id || 0, {
            clientId: client?.id || 0,
            token: data?.id,
            ccLastFour: responseBody?.credit_card?.last_four,
            nameOnCard: client?.name || '',
            cardType: responseBody?.credit_card?.card_brand,
            dateAdded: new Date().toISOString(),
            isDefault: true,
          });
        }
        dispatch(ToastMessage('Card Saved Successfully'));
        onSubmit({
          cardNumber: responseBody?.credit_card?.last_four,
          expiration: responseBody?.credit_card?.expiration_year,
          securityCode: 'string',
          country: 'string',
          postalCode: 'string',
        });
      } catch {
        console.error('Failed to parse tokenized card data');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<CardFormValues>({
    mode: 'onSubmit',
    defaultValues: {
      country: 'US',
    },
  });

  const handleFormSubmit = (data: CardFormValues) => {
    onSubmit(data);
  };

  return (
    <div className={classes.root}>
      {iframeLoading && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            zIndex: 2,
            fontSize: '1.2rem',
            fontWeight: 500,
          }}
        >
          Loading...
        </Box>
      )}
      <iframe
        src={PAYMENT_GATEWAY_URL}
        title="payment-gateway"
        onLoad={() => setIframeLoading(false)}
        scrolling="no"
        style={{
          width: '100%',
          height: '600px',
          border: 'none',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      />
    </div>
  );
};

export default CardPaymentForm;
