import React from 'react';
import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  TextField,
  Tooltip,
} from '@mui/material';
import { InfoOutlined } from '@mui/icons-material';

const PaymentSetupRightPanel = () => {
  const [settings, setSettings] = React.useState({
    paymentLinkAcceptCC: false,
    paymentLinkAcceptACH: false,
  });
  const [surcharge, setSurcharge] = React.useState('0.00');

  const handleSurchargeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');

    // Allow empty value
    if (value === '') {
      setSurcharge('');
      return;
    }

    if ((value.match(/\./g) || []).length > 1) return;

    const [, decimals] = value.split('.');
    if (decimals && decimals.length > 2) return;

    if (parseFloat(value) > 3) return;

    setSurcharge(value);
  };

  const handleSurchargeBlur = () => {
    if (surcharge === '') {
      setSurcharge('0.00');
      return;
    }

    let numericValue = parseFloat(surcharge);

    if (isNaN(numericValue)) {
      setSurcharge('0.00');
      return;
    }

    if (numericValue > 3) {
      numericValue = 3;
    }

    setSurcharge(numericValue.toFixed(2));
  };

  const updateSetting = (field: string, value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Box sx={{ padding: 2 }}>
      <Grid container>
        <Grid item xs={12}>
          <Box
            sx={{
              fontWeight: 600,
              mb: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            Signup
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: 3 }}>
            <Button
              variant="outlined"
              color="primary"
              size="small"
              sx={{ fontSize: '0.75rem', padding: '4px 8px' }}
              onClick={() => {}}
            >
              Sign Up
            </Button>
            <Button
              variant="outlined"
              color="primary"
              size="small"
              sx={{ fontSize: '0.75rem', padding: '4px 8px' }}
              onClick={() => {}}
            >
              Reset Account
            </Button>
            <Button
              variant="outlined"
              color="primary"
              size="small"
              sx={{ fontSize: '0.75rem', padding: '3px 10px' }}
              onClick={() => {}}
            >
              Validate Established Account
            </Button>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box
            sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}
          >
            <Box
              sx={{
                fontWeight: 600,
                mb: 1,
                display: 'flex',
                alignItems: 'flex-start',
                width: '40%',
              }}
            >
              Serial Number:
            </Box>
            <TextField
              sx={{ pb: 1 }}
              variant="standard"
              onChange={() => {}}
              fullWidth
            />
          </Box>
          <Box
            sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}
          >
            <Box
              sx={{
                fontWeight: 600,
                mb: 1,
                display: 'flex',
                alignItems: 'flex-start',
                width: '70%',
              }}
            >
              Merchant Account ID:
            </Box>
            <TextField
              sx={{ pb: 1 }}
              variant="standard"
              onChange={() => {}}
              fullWidth
            />
          </Box>
          <Box
            sx={{
              ml: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
            }}
          >
            <FormControlLabel
              sx={{
                '& .MuiFormControlLabel-label': {
                  fontSize: '12px',
                  lineHeight: 1.2,
                },
              }}
              control={
                <Checkbox
                  sx={{
                    p: 0.5,
                    ml: -1.25,
                    '& .MuiSvgIcon-root': { fontSize: 18 },
                  }}
                />
              }
              label="Enable Payment Processing"
            />
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box
            sx={{
              fontWeight: 600,
              mb: 1,
              display: 'flex',
              alignItems: 'flex-start',
            }}
          >
            Accept
          </Box>

          <Box
            sx={{
              ml: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
            }}
          >
            <FormControlLabel
              sx={{
                '& .MuiFormControlLabel-label': {
                  fontSize: '12px',
                  lineHeight: 1.2,
                },
              }}
              control={
                <Checkbox
                  sx={{
                    p: 0.5,
                    ml: -1.25,
                    '& .MuiSvgIcon-root': { fontSize: 18 },
                  }}
                  checked={settings.paymentLinkAcceptCC}
                  onChange={(e) =>
                    updateSetting('paymentLinkAcceptCC', e.target.checked)
                  }
                />
              }
              label="Credit Cards"
            />
            <Box
              sx={{
                ml: 3,
                mt: 0,
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
                label="Include American Express"
                control={
                  <Checkbox
                    sx={{
                      p: 0.5,
                      ml: -1.25,
                      mt: -0.25,
                      '& .MuiSvgIcon-root': {
                        fontSize: 18,
                      },
                    }}
                    disabled={!settings.paymentLinkAcceptCC} // <-- disable if Credit Cards not checked
                  />
                }
                componentsProps={{
                  typography: { fontSize: '12px' },
                }}
              />

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  alignContent: 'center',
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
                  label="Allow Surcharging"
                  control={
                    <Checkbox
                      sx={{
                        p: 0.5,
                        ml: -1.25,
                        mt: -0.25,
                        '& .MuiSvgIcon-root': {
                          fontSize: 18,
                        },
                      }}
                      disabled={!settings.paymentLinkAcceptCC}
                    />
                  }
                  componentsProps={{
                    typography: { fontSize: '12px' },
                  }}
                />
                <Tooltip title="Due to state law, surcharging not available to organizations based in CT, MA, and ME. CO and OK capped at 2%. All other states capped at 3%">
                  <InfoOutlined
                    fontSize="inherit"
                    sx={{
                      fontSize: '14px',
                      ml: -2,
                      mr: 1.5,
                      mb: 1.5,
                      color: !settings.paymentLinkAcceptCC ? '#AEAEAE' : '#000',
                    }}
                  />
                </Tooltip>
                <TextField
                  variant="standard"
                  size="small"
                  sx={{ width: '16.5%', ml: -1 }}
                  value={surcharge}
                  onChange={handleSurchargeChange}
                  onBlur={handleSurchargeBlur}
                  disabled={!settings.paymentLinkAcceptCC}
                  inputProps={{
                    inputMode: 'decimal',
                    pattern: '[0-9.]*',
                  }}
                  InputProps={{
                    endAdornment: <Box sx={{ ml: 0.5 }}>%</Box>,
                  }}
                />
              </Box>
            </Box>

            <FormControlLabel
              sx={{
                '& .MuiFormControlLabel-label': {
                  fontSize: '12px',
                  lineHeight: 1.2,
                },
              }}
              control={
                <Checkbox
                  sx={{
                    p: 0.5,
                    ml: -1.25,
                    '& .MuiSvgIcon-root': { fontSize: 18 },
                  }}
                  checked={settings.paymentLinkAcceptACH}
                  onChange={(e) =>
                    updateSetting('paymentLinkAcceptACH', e.target.checked)
                  }
                />
              }
              label="ACH Payments"
            />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PaymentSetupRightPanel;
