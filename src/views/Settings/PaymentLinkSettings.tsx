import { Tooltip } from '@material-ui/core';
import {
  Box,
  Checkbox,
  FormControlLabel,
  Grid,
  TextField,
  Tabs,
  Tab,
  Typography,
  Divider,
} from '@mui/material';
import React from 'react';
import { placezApi } from '../../api';

const PaymentLinkSettingsRightPanel = () => {
  const [tab, setTab] = React.useState(0);

  const [settings, setSettings] = React.useState({
    paymentLinkActive: false,
    paymentLinkCopy: false,
    paymentLinkCopyEmail: '',
    paymentLinkAutoUpdate: false,
    paymentLinkCaptionType: 1,
    paymentLinkHeaderAlignment: 2,
    paymentLinkTitle: '',
    paymentLinkTopNotes: '',
    paymentLinkBottomNotes: '',
    paymentLinkTips: false,
    paymentLinkAutoEmail: false,
    paymentLinkAcceptCC: false,
    paymentLinkAcceptACH: false,
    paymentLinkAcceptAX: false,
    paymentLinkReqCategory: false,
    paymentLinkExpVar: 30,
    paymentLinkAcceptGPay: false,
    paymentLinkSender: '',
    paymentLinkReply: '',
    paymentLinkEmail: '',
    authorizeLinkActive: false,
    authorizeLinkAutoEmail: false,
    authorizeLinkCaptionType: 1,
    authorizeLinkHeaderAlignment: 1,
    authorizeLinkTitle: '',
    authorizeLinkTopNotes: '',
    authorizeLinkBottomNotes: '',
    authorizeLinkReqCategory: false,
    authorizeLinkExpVar: 60,
    authorizeLinkTips: false,
    organizationId: '',
  });

  const updateSetting = (field: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  React.useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await placezApi.getPaymentLinkSettings();
        setSettings(response.parsedBody[response.parsedBody.length - 1]); // Loads the most recent settings
      } catch (err) {
        console.error('Failed to load payment link settings:', err);
      }
    };

    loadSettings();
  }, []);

  const firstRun = React.useRef(true);

  React.useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return () => {};
    }

    const timer = setTimeout(() => {
      placezApi.createPaymentLinkSettings(settings);
    }, 500);

    return () => clearTimeout(timer);
  }, [settings]);

  // State for enabling links
  const [enableLinks, setEnableLinks] = React.useState(false);
  const [allowSurcharge, setAllowSurcharge] = React.useState(false);

  return (
    <Box sx={{ padding: 2 }}>
      {/* LINK SETUP */}
      <Box
        sx={{
          fontWeight: 600,
          mb: 1,
          display: 'flex',
          alignSelf: 'flex-start',
        }}
      >
        Request Link Setup
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Tooltip title="Invoice Sender Email is noreply@paymentsbyhorizon.com">
            <TextField
              label="Sender Name"
              variant="standard"
              value={settings.paymentLinkSender}
              onChange={(e) =>
                updateSetting('paymentLinkSender', e.target.value)
              }
              fullWidth
            />
          </Tooltip>
        </Grid>

        <Grid item xs={12}>
          <TextField
            label="Copy to email"
            variant="standard"
            value={settings.paymentLinkCopyEmail}
            fullWidth
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* LINK SETTINGS */}
      <Box
        sx={{
          fontWeight: 600,
          mb: 1,
          display: 'flex',
          alignSelf: 'flex-start',
        }}
      >
        Request Link Settings
      </Box>

      {/* Tabs */}
      <Box>
        <Tabs value={tab} onChange={(e, v) => setTab(v)}>
          <Tab label="Payment Links" />
          {/*<Tab label="Authorization Links" /> */}
        </Tabs>
      </Box>

      {/* PAYMENT LINKS CONTENT */}
      <Box sx={{ mt: 2 }}>
        <Grid container spacing={2}>
          {/* LEFT COLUMN */}
          <Grid item xs={7}>
            {/* MAIN ENABLE CHECKBOX */}
            <FormControlLabel
              sx={{
                alignItems: 'flex-start',
                '& .MuiFormControlLabel-label': {
                  fontSize: '12px',
                  lineHeight: 1.2,
                  mt: '4px',
                },
                display: 'flex',
                alignSelf: 'flex-start',
              }}
              control={
                <Checkbox
                  sx={{
                    p: 0.5,
                    mb: -0.5,
                    '& .MuiSvgIcon-root': {
                      fontSize: 18,
                    },
                  }}
                  checked={settings.paymentLinkActive}
                  onChange={(e) => {
                    updateSetting('paymentLinkActive', e.target.checked);
                  }}
                />
              }
              label={
                tab === 0
                  ? 'Enable Payment Links'
                  : 'Enable Authorization Links'
              }
              componentsProps={{
                typography: { fontSize: '12px' },
              }}
            />

            {/* SUB CHECKBOXES */}
            <Box
              sx={{
                ml: 3,
                mt: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
              }}
            >
              <FormControlLabel
                sx={{
                  alignItems: 'flex-start',
                  '& .MuiFormControlLabel-label': {
                    fontSize: '12px',
                    lineHeight: 1.2,
                    mt: '4px',
                  },
                }}
                control={
                  <Checkbox
                    sx={{
                      p: 0.5,
                      '& .MuiSvgIcon-root': {
                        fontSize: 18,
                      },
                    }}
                    checked={settings.paymentLinkAutoEmail}
                    onChange={(e) =>
                      updateSetting('paymentLinkAutoEmail', e.target.checked)
                    }
                    disabled={!settings.paymentLinkActive}
                  />
                }
                label={
                  tab === 0
                    ? 'Auto Email Payment Links'
                    : 'Auto Email Authorization Links'
                }
                componentsProps={{
                  typography: { fontSize: '12px' },
                }}
              />

              <FormControlLabel
                sx={{
                  alignItems: 'flex-start',
                  '& .MuiFormControlLabel-label': {
                    fontSize: '12px',
                    lineHeight: 1.2,
                    mt: '4px',
                  },
                }}
                control={
                  <Checkbox
                    sx={{
                      p: 0.5,
                      mt: '-1px',
                      '& .MuiSvgIcon-root': {
                        fontSize: 18,
                      },
                    }}
                    disabled={!settings.paymentLinkActive}
                    checked={settings.paymentLinkTips}
                    onChange={(e) =>
                      updateSetting('paymentLinkTips', e.target.checked)
                    }
                  />
                }
                label={
                  tab === 0
                    ? 'Allow Tips for Payment Links'
                    : 'Allow Tips for Authorization Links'
                }
                componentsProps={{
                  typography: { fontSize: '12px' },
                }}
              />
              <Tooltip title="Click this check box if you want to require that the payment Category field is filled in before a user creates or sends a payment link.">
                <FormControlLabel
                  sx={{
                    alignItems: 'flex-start',
                    '& .MuiFormControlLabel-label': {
                      fontSize: '12px',
                      lineHeight: 1.2,
                      mt: '4px',
                    },
                  }}
                  control={
                    <Checkbox
                      sx={{
                        p: 0.5,
                        mt: '-1px',
                        '& .MuiSvgIcon-root': {
                          fontSize: 18,
                        },
                      }}
                      checked={settings.paymentLinkReqCategory}
                      onChange={(e) =>
                        updateSetting(
                          'paymentLinkReqCategory',
                          e.target.checked
                        )
                      }
                      disabled={!settings.paymentLinkActive}
                    />
                  }
                  label={
                    tab === 0
                      ? 'Require Payment Link Category'
                      : 'Require Authorization Link Category'
                  }
                  componentsProps={{
                    typography: { fontSize: '12px' },
                  }}
                />
              </Tooltip>
            </Box>

            {/* EXPIRATION */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                mt: 2,
                ml: -0.75,
                minWidth: '300px',
              }}
            >
              <Typography sx={{ fontSize: '12px' }}>Link Expires</Typography>
              <TextField
                type="number"
                variant="standard"
                value={settings.paymentLinkExpVar}
                onChange={(e) =>
                  updateSetting('paymentLinkExpVar', Number(e.target.value))
                }
                defaultValue={180}
                sx={{ width: '40px', mt: -1, mx: 1 }}
              />{' '}
              <Typography sx={{ fontSize: '12px' }}>
                Days After Creation
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default PaymentLinkSettingsRightPanel;
