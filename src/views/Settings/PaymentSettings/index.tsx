import { useCallback, useState, useRef, useEffect } from 'react';
import { Theme, useTheme, Grid, Box, Button } from '@mui/material';
import { Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import { ColorResult } from 'react-color';
import settingStyles from '../../../components/Styles/SettingStyles.css';
import FormattableTextField from '../../../components/PlacezUIComponents/FormattableTextField';
import { useDispatch, useSelector } from 'react-redux';
import { ReduxState } from '../../../reducers';
import {
  DefaultPaymentLinkSettings,
  PaymentLinkSettings,
} from '../../../api/payments/models/Payment';
import { UpdateUserSetting } from '../../../reducers/settings';
import { getUserSetting } from '../../../api/placez/models/UserSetting';
import { useComponentStyles } from './styles';
import { FormData } from './types';
import ColorPickerToolBar from '../../../components/PlacezUIComponents/ColorPickerToolbar';

interface Props {}

const PaymentSettings = (props: Props) => {
  const styles = makeStyles<Theme>(settingStyles);
  const componentStyles = useComponentStyles();
  const classes = styles(props);
  const theme = useTheme();
  const dispatch = useDispatch();
  const paymentLinkSettings = useSelector((state: ReduxState) =>
    getUserSetting(state.settings.userSettings, 'Payment_Link_Settings')
  );
  const [localPaymentLinkSettings, setLocalPaymentLinkSettings] =
    useState<PaymentLinkSettings>({
      ...DefaultPaymentLinkSettings,
      backgroundColor: theme.palette.primary.main,
      ...paymentLinkSettings?.settingValue,
    });

  const [formData, setFormData] = useState<FormData>({
    companyName: 'Confetti Events',
    invoiceTitle: 'Balance due for Ducks Unlimited Event #01234',
    thankYouMessage:
      'Thank you for choosing Confetti Events for your recent order. Please click the link below to complete your payment.',
    questionsMessage:
      'If you have any questions regarding this invoice, please call our office.',
    closingMessage: 'Thanks again for doing business with Confetti Events.',
    regards: 'Regards,',
    businessName: '(Business Name)',
    logoUrl: '', // URL for the uploaded logo image
    // Invoice information fields
    invoiceNumber: '01234',
    invoiceDate: 'August 27, 2025',
    amountDue: '$5,600.00',
    dueDate: 'August 28, 2025',
  });

  const [invoiceHeaderColor, setInvoiceHeaderColor] = useState<string>('#8080801a');
  const [showColorPicker, setShowColorPicker] = useState<Boolean>(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  const handleColorChange = (color: ColorResult) => {
    setInvoiceHeaderColor(color.hex);
  };

  const toggleColorPicker = () => {
    setShowColorPicker((prev) => !prev);
  };

  const handleOutsideClick = useCallback((event: MouseEvent) => {
    const pickerEl = pickerRef.current;
    if (!pickerEl) return;

    const target = event.target as Node;
    if (!pickerEl.contains(target)) {
      setShowColorPicker(false);
    }
  }, []);

  useEffect(() => {
    if (!showColorPicker) {
      return () => {};
    }

    document.addEventListener('mousedown', handleOutsideClick, true);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick, true);
    };
  }, [showColorPicker, handleOutsideClick]);

  const handleSetLocalPaymentLinkSettings = useCallback(
    (key: keyof PaymentLinkSettings, value: any) => {
      const updatedSettings = {
        ...localPaymentLinkSettings,
        [key]: value,
      };
      setLocalPaymentLinkSettings(updatedSettings);
      dispatch(
        UpdateUserSetting({
          ...paymentLinkSettings,
          settingValue: updatedSettings,
        })
      );
    },
    []
  );

  const handleFormDataChange = useCallback(
    (key: keyof typeof formData, value: string) => {
      setFormData((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    []
  );

  const handleImageUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        // Check if file is an image
        if (file.type.startsWith('image/')) {
          // Create a URL for the image to display it
          const imageUrl = URL.createObjectURL(file);
          setFormData((prev) => ({
            ...prev,
            logoUrl: imageUrl,
          }));
        } else {
          alert('Please select a valid image file (JPG, PNG, SVG)');
        }
      }
    },
    []
  );

  const handleRemoveImage = useCallback(() => {
    // Revoke the URL to free up memory
    if (formData.logoUrl) {
      URL.revokeObjectURL(formData.logoUrl);
    }
    setFormData((prev) => ({
      ...prev,
      logoUrl: '',
    }));
  }, []);

  const invoiceMessageTextSx = {
    color: theme.palette.text.primary,
    '& .MuiInputBase-input': { color: theme.palette.text.primary },
    '& .MuiOutlinedInput-input': { color: theme.palette.text.primary },
    '& textarea': { color: theme.palette.text.primary },
    '& .ProseMirror': { color: theme.palette.text.primary }, 
    '& input::placeholder, & textarea::placeholder': {
      color: theme.palette.text.secondary,
      opacity: 1,
    },
  };

  return (
    <div className={classes.root}>
      <Box className={componentStyles.contentBox}>
        {/* Invoice Header */}
        <Box className={componentStyles.invoiceHeader} sx={{ backgroundColor: invoiceHeaderColor }}>
          <Box className={componentStyles.invoiceBilling}>
            {/* Logo Upload Box */}
            <Box
              className={componentStyles.uploadBox}
              onClick={() => document.getElementById('logo-upload-input')?.click()}
            >
              <input
                id="logo-upload-input"
                type="file"
                accept="image/*"
                className={componentStyles.hiddenInput}
                onChange={handleImageUpload}
              />

              {formData.logoUrl ? (
                <Box className={componentStyles.imageContainer}>
                  <img
                    src={formData.logoUrl}
                    alt="Uploaded logo"
                    className={componentStyles.uploadedImage}
                  />
                  <FileUploadOutlinedIcon className={componentStyles.uploadIconOverlay} />
                </Box>
              ) : (
                <Box>
                  <FileUploadOutlinedIcon className={componentStyles.uploadIcon} />
                  <Typography variant="body1" className={componentStyles.uploadTitle}>
                    Click to upload logo image
                  </Typography>
                </Box>
              )}
            </Box>

            <Box>
              <div className={componentStyles.labelText}>
                <Typography>Amount Due</Typography>
                <Typography>{formData.amountDue}</Typography>
              </div>
              <div className={componentStyles.labelText}>
                <Typography>Due By</Typography>
                <Typography>{formData.dueDate}</Typography>
              </div>
            </Box>
          </Box>

          {/* Invoice Number and Date right */}
          <Box className={componentStyles.invoiceBillingInfo}>
            <div className={componentStyles.infoText}>
              <Typography>Invoice Number</Typography>
              <Typography>{formData.invoiceNumber}</Typography>
            </div>
            <div className={componentStyles.infoText}>
              <Typography>Date</Typography>
              <Typography>{formData.invoiceDate}</Typography>
            </div>
          </Box>

          {/* ColorPickerToolBar */}
          <ColorPickerToolBar
            pickerRef={pickerRef}
            style={invoiceHeaderColor}
            value={showColorPicker}
            onShow={toggleColorPicker}
            onChange={handleColorChange}
          />
        </Box>

        {/* Invoice Information Section */}
        <Grid container spacing={2} sx={{ marginTop: '0px !important', padding: '0px 10px' }}>
          <Grid item xs={12}>
            <Box sx={invoiceMessageTextSx}>
              <FormattableTextField
                value={formData.thankYouMessage}
                onChange={(value) => {
                  handleSetLocalPaymentLinkSettings('invoiceIntroductionMessage', value);
                  handleFormDataChange('thankYouMessage', value);
                }}
                placeholder="Enter thank you message"
                multiline
                rows={3}
                showFormattingButton={true}
                className={componentStyles.invoiceMessage}
              />
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box>
              <Typography className={componentStyles.itemDescriptionTitle}>
                Item Description
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box>
              <Typography className={componentStyles.itemDescriptionContent}>
                Balance due for Ducks Unlimited Event #01234
              </Typography>
              <Box className={componentStyles.itemDescriptionUnderline} />
              <Typography className={componentStyles.itemDescriptionamountDueText}>
                Amount Due: $5,600.00
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box sx={invoiceMessageTextSx}>
              <FormattableTextField
                value={formData.questionsMessage}
                onChange={(value) => {
                  handleSetLocalPaymentLinkSettings('invoiceMessage', value);
                  handleFormDataChange('questionsMessage', value);
                }}
                placeholder="Enter questions message"
                multiline
                rows={2}
                showFormattingButton={true}
                className={componentStyles.invoiceMessage}
              />
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Typography className={componentStyles.businessNameText}>Regards,</Typography>
            <Typography className={componentStyles.businessNameText}>
              Your Confetti Event Planner
            </Typography>
          </Grid>

          <Grid
            item
            xs={12}
            sx={{
              display: 'flex',
              justifyContent: 'center',
              paddingTop: '10px',
              paddingBottom: '10px',
            }}
          >
            <Button
              variant="contained"
              disableElevation
              sx={{
                minWidth: 140,
                padding: '8px 28px',
                borderRadius: '4px',
                textTransform: 'none',
                fontWeight: 'bold',
                backgroundColor: localPaymentLinkSettings.backgroundColor || theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: localPaymentLinkSettings.backgroundColor || theme.palette.primary.main,
                  filter: 'brightness(0.92)',
                },
              }}
            >
              Pay Now
            </Button>
          </Grid>
        </Grid>
      </Box>
    </div>
  );
};

export default PaymentSettings;
