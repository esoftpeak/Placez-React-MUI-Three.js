import React, { useMemo, useRef, useState, useEffect } from 'react';
import {
  Box,
  Checkbox,
  // Divider,
  FormControlLabel,
  Grid,
  Radio,
  RadioGroup,
  TextField,
  Theme,
  Typography,
  IconButton,
  Tooltip,
  Popper,
  Paper,
  Grow,
  useTheme,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
// import { Visibility, VisibilityOff } from '@mui/icons-material';
import settingStyles from '../../components/Styles/SettingStyles.css';

import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import FormatColorTextOutlinedIcon from '@mui/icons-material/FormatColorTextOutlined';
import TextFormattingToolbar, {
  TextFormattingState,
} from '../../components/PlacezUIComponents/TextFormattingToolbar';
import InvoiceFormat from '../../api/placez/models/InvoiceFormat';
import { placezApi } from '../../api';
import { useSelector } from 'react-redux';
import { ReduxState } from '../../reducers';
import { createSelector } from 'reselect';
import placezLogoPurple from '../../assets/images/placezLogoPurplex512.png';

interface Props {}

type CheckGroupState = Record<string, boolean>;

const TokenListBlock = () => {
  const theme = useTheme();

  const [open, setOpen] = useState(false);

  // theme-aware default token color
  const [formatting, setFormatting] = useState<TextFormattingState>({
    bold: false,
    italic: false,
    underline: false,
    fontFamily: 'Arial',
    color: theme.palette.text.secondary,
    textAlign: 'left',
  });

  const anchorRef = useRef<HTMLDivElement | null>(null);
  const [toolbarWidth, setToolbarWidth] = useState<number | undefined>(undefined);

  useEffect((): void | (() => void) => {
    if (!open) return;

    const raf = window.requestAnimationFrame(() => {
      const el = anchorRef.current;
      if (!el) return;
      setToolbarWidth(el.getBoundingClientRect().width);
    });

    return () => window.cancelAnimationFrame(raf);
  }, [open]);

  const alignItems = useMemo(() => {
    if (formatting.textAlign === 'right') return 'flex-end';
    if (formatting.textAlign === 'center') return 'center';
    return 'flex-start';
  }, [formatting.textAlign]);

  const tokenTextSx = useMemo(
    () => ({
      fontSize: 12,
      fontWeight: formatting.bold ? 'bold' : 400,
      fontStyle: formatting.italic ? 'italic' : 'normal',
      textDecoration: formatting.underline ? 'underline' : 'none',
      fontFamily: formatting.fontFamily,
      color: formatting.color,
    }),
    [
      formatting.bold,
      formatting.italic,
      formatting.underline,
      formatting.fontFamily,
      formatting.color,
    ]
  );

  const handleToggle = () => setOpen((v) => !v);
  const handleClose = () => setOpen(false);

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'flex-start',
        position: 'relative',
        minHeight: 80,
      }}
    >
      <Box sx={{ position: 'absolute', top: 1, left: 1, zIndex: 6 }}>
        <Tooltip title="Text editor">
          <IconButton size="small" onClick={handleToggle} sx={{ width: 28, height: 28 }}>
            <FormatColorTextOutlinedIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Box
        ref={anchorRef}
        sx={{
          position: 'absolute',
          top: 50,
          left: -10,
          right: 10,
          zIndex: 4,
        }}
      />

      <Popper
        open={open}
        anchorEl={anchorRef.current}
        placement="bottom-start"
        disablePortal
        transition
        style={{ zIndex: 10, width: toolbarWidth }}
      >
        {({ TransitionProps }) => (
          <Grow {...TransitionProps} timeout={120}>
            <Paper
              elevation={3}
              sx={{
                width: toolbarWidth ?? 'auto',
                p: 0,
                borderRadius: 1,
                overflow: 'hidden',
                border: '1px solid #D8DFE5',
                backgroundColor: '#fff',
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'nowrap',
                whiteSpace: 'nowrap',
                '& .MuiButtonBase-root, & button': { flexShrink: 0 },
                '& .MuiToggleButtonGroup-root': { flexWrap: 'nowrap' },
                '& .MuiFormControl-root, & .MuiInputBase-root': {
                  flexShrink: 0,
                },
                overflowX: 'auto',
                overflowY: 'hidden',
              }}
            >
              <TextFormattingToolbar value={formatting} onChange={setFormatting} onClose={handleClose} />
            </Paper>
          </Grow>
        )}
      </Popper>

      <Box
        sx={{
          width: 'max-content',
          display: 'flex',
          flexDirection: 'column',
          alignItems,
        }}
      >
        <Typography sx={tokenTextSx}>{'{Event Name}'}</Typography>
        <Typography sx={tokenTextSx}>{'{Event Address}'}</Typography>
        <Typography sx={tokenTextSx}>{'{Event Category}'}</Typography>
        <Typography sx={tokenTextSx}>{'{Guest Count}'}</Typography>
      </Box>
    </Box>
  );
};

const getTextStyle = (f: TextFormattingState) => ({
  fontWeight: f.bold ? 700 : 400,
  fontStyle: f.italic ? 'italic' : 'normal',
  textDecoration: f.underline ? 'underline' : 'none',
  fontFamily: f.fontFamily,
  color: f.color,
  textAlign: f.textAlign as any,
});

const AButton = ({ onClick }: { onClick?: () => void }) => {
  return (
    <Tooltip title="Text editor">
      <IconButton size="small" onClick={onClick} sx={{ width: 28, height: 28 }}>
        <FormatColorTextOutlinedIcon />
      </IconButton>
    </Tooltip>
  );
};

const FormattableNotesField = ({
  value,
  onChange,
  rows,
}: {
  value: string;
  onChange: (v: string) => void;
  rows: number;
}) => {
  const theme = useTheme();

  const [open, setOpen] = useState(false);

  // theme-aware default text color
  const [formatting, setFormatting] = useState<TextFormattingState>({
    bold: false,
    italic: false,
    underline: false,
    fontFamily: 'Arial',
    color: theme.palette.text.primary,
    textAlign: 'left',
  });

  const anchorRef = useRef<HTMLDivElement | null>(null);
  const [toolbarWidth, setToolbarWidth] = useState<number | undefined>(undefined);

  useEffect((): void | (() => void) => {
    if (!open) return;

    const raf = window.requestAnimationFrame(() => {
      const el = anchorRef.current;
      if (!el) return;
      setToolbarWidth(el.getBoundingClientRect().width);
    });

    return () => window.cancelAnimationFrame(raf);
  }, [open]);

  const handleToggle = () => setOpen((v) => !v);
  const handleClose = () => setOpen(false);

  const style = useMemo(() => getTextStyle(formatting), [formatting]);

  return (
    <Box sx={{ position: 'relative' }}>
      <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 3 }}>
        <AButton onClick={handleToggle} />
      </Box>

      <Box
        ref={anchorRef}
        sx={{
          position: 'absolute',
          top: 8,
          left: 8,
          right: 56,
          height: 1,
          zIndex: 2,
        }}
      />

      <Popper
        open={open}
        anchorEl={anchorRef.current}
        placement="bottom-start"
        disablePortal
        transition
        style={{ zIndex: 10, width: toolbarWidth }}
      >
        {({ TransitionProps }) => (
          <Grow {...TransitionProps} timeout={120}>
            <Paper
              elevation={3}
              sx={{
                width: toolbarWidth ?? 'auto',
                p: 0,
                borderRadius: 1,
                overflow: 'hidden',
                border: '1px solid #D8DFE5',
                backgroundColor: '#fff',
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'nowrap',
                whiteSpace: 'nowrap',
                '& .MuiButtonBase-root, & button': { flexShrink: 0 },
                '& .MuiToggleButtonGroup-root': { flexWrap: 'nowrap' },
                '& .MuiFormControl-root, & .MuiInputBase-root': {
                  flexShrink: 0,
                },
                overflowX: 'auto',
                overflowY: 'hidden',
              }}
            >
              <TextFormattingToolbar value={formatting} onChange={setFormatting} onClose={handleClose} />
            </Paper>
          </Grow>
        )}
      </Popper>

      <TextField
        value={value}
        onChange={(e) => onChange(e.target.value)}
        multiline
        rows={rows}
        fullWidth
        sx={{
          '& .MuiOutlinedInput-root': {
            paddingRight: '48px',
          },
        }}
        InputProps={{
          style,
        }}
        inputProps={{
          style,
        }}
      />
    </Box>
  );
};

const SectionCard = ({
  title,
  children,
  sx,
}: {
  title: string;
  children: React.ReactNode;
  sx?: any;
}) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        padding: 2,
        background: theme.palette.background.paper,
        color: theme.palette.text.primary,
        ...sx,
      }}
    >
      <Typography
        sx={{
          fontSize: 13,
          fontWeight: 600,
          mb: 1,
          color: theme.palette.text.primary,
        }}
      >
        {title}
      </Typography>
      {children}
    </Box>
  );
};

const styles = makeStyles<Theme>(settingStyles);

const getUserSettings = (state) => {
  return state.settings.userSettings;
};

const getCompanyLogo = createSelector([getUserSettings], (userSettings) =>
  userSettings.find((setting) => setting.name === 'Company Logo')
);

const InvoicesSettings = (props: Props) => {
  const classes = styles(props);
  const theme = useTheme();
  const companyLogo = useSelector((state: ReduxState) => getCompanyLogo(state));
  const [logoUrl, setLogoUrl] = useState<string | null>(
    companyLogo?.settingValue || placezLogoPurple
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const hasLoadedRef = useRef(false);
  const isDirtyRef = useRef(false);

  const markDirty = () => {
    if (hasLoadedRef.current) {
      isDirtyRef.current = true;
    }
  };

  useEffect(() => {
    return () => {
      if (logoUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(logoUrl);
      }
    };
  }, [logoUrl]);

  const handleLogoClick = () => {
    fileInputRef.current?.click();
  };

  const handleLogoChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type?.startsWith('image/')) {
      e.target.value = '';
      return;
    }

    if (logoUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(logoUrl);
    }

    const nextUrl = URL.createObjectURL(file);
    setLogoUrl(nextUrl);

    e.target.value = '';
  };

  const [venueBusinessFields, setVenueBusinessFields] = useState<CheckGroupState>({
    venueName: true,
    venueAddress: true,
    businessPhone: true,
    businessEmail: true,
  });

  const [eventDetailsFields, setEventDetailsFields] = useState<CheckGroupState>({
    eventName: true,
    eventAddress: false,
    eventCategory: true,
    guestCount: true,
  });

  const [lineItemFields, setLineItemFields] = useState<CheckGroupState>({
    payment: true,
    paymentMethod: true,
    paymentDate: true,
    amount: true,
    payerName: true,
  });

  const [timeAndPageCount, setTimeAndPageCount] = useState<boolean>(false);
  const [displayCentered, setDisplayCentered] = useState<boolean>(false);

  const applyInvoiceFormatToState = (data: InvoiceFormat) => {
    setVenueBusinessFields({
      venueName: data.venueName,
      venueAddress: data.venueAddress,
      businessPhone: data.businessPhone,
      businessEmail: data.businessEmail,
    });

    setEventDetailsFields({
      eventName: data.eventName,
      eventAddress: data.eventAddress,
      eventCategory: data.eventCategory,
      guestCount: data.guestCount,
    });

    setLineItemFields({
      payment: data.payment,
      paymentMethod: data.paymentMethod,
      paymentDate: data.paymentDate,
      amount: data.amount,
      payerName: data.payorName,
    });

    setTopNotes(data.topNotes ?? '');
    setBottomNotes(data.bottomNotes ?? '');
    setFooter(data.footer ?? '');
    setTimeAndPageCount(data.timeAndPageCount ?? false);

    setLineItemDisplay(data.displayCentered ? 'centered' : 'boxed');
  };

  const buildInvoiceFormatPayload = (existing?: InvoiceFormat): InvoiceFormat => {
    const now = new Date().toISOString();

    return {
      id: existing?.id ?? 0,
      organizationId: existing?.organizationId ?? 0,

      createdUtcDateTime: existing?.createdUtcDateTime ?? now,
      lastModifiedUtcDateTime: now,
      createdBy: existing?.createdBy ?? 'system',
      lastModifiedBy: 'system',
      deleted: false,

      venueName: venueBusinessFields.venueName,
      venueAddress: venueBusinessFields.venueAddress,
      businessPhone: venueBusinessFields.businessPhone,
      businessEmail: venueBusinessFields.businessEmail,

      eventName: eventDetailsFields.eventName,
      eventAddress: eventDetailsFields.eventAddress,
      eventCategory: eventDetailsFields.eventCategory,
      guestCount: eventDetailsFields.guestCount,

      payment: lineItemFields.payment,
      paymentMethod: lineItemFields.paymentMethod,
      paymentDate: lineItemFields.paymentDate,
      amount: lineItemFields.amount,
      payorName: lineItemFields.payerName,

      topNotes,
      bottomNotes,
      footer,

      displayCentered: displayCentered,
      timeAndPageCount: timeAndPageCount,
    };
  };

  const [topNotes, setTopNotes] = useState<string>('');
  const [bottomNotes, setBottomNotes] = useState<string>('');
  const [footer, setFooter] = useState<string>('');

  const [invoiceFormat, setInvoiceFormat] = useState<InvoiceFormat | null>(null);

  const [lineItemDisplay, setLineItemDisplay] = useState<'centered' | 'boxed'>(
    'centered'
  );

  const getAllSelected = (group: CheckGroupState) =>
    Object.values(group).every(Boolean);

  const setAllSelected = (group: CheckGroupState, next: boolean) => {
    const updated: CheckGroupState = {};
    Object.keys(group).forEach((k) => (updated[k] = next));
    return updated;
  };

  const venueBusinessAll = useMemo(
    () => getAllSelected(venueBusinessFields),
    [venueBusinessFields]
  );
  const eventDetailsAll = useMemo(
    () => getAllSelected(eventDetailsFields),
    [eventDetailsFields]
  );
  const lineItemsAll = useMemo(() => getAllSelected(lineItemFields), [lineItemFields]);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await placezApi.getInvoiceFormatSettings();

        if (response?.parsedBody) {
          setInvoiceFormat(response.parsedBody);
          applyInvoiceFormatToState(response.parsedBody);
        }

        hasLoadedRef.current = true;
      } catch (e) {
        console.error('Failed to load invoice format settings', e);
      }
    };

    loadSettings();
  }, []);

  useEffect(() => {
    if (!hasLoadedRef.current) return undefined;
    if (!isDirtyRef.current) return undefined;

    const timeout = setTimeout(async () => {
      try {
        const payload = buildInvoiceFormatPayload(invoiceFormat ?? undefined);

        const response = await placezApi.createInvoiceFormatSettings(payload);

        setInvoiceFormat(response.parsedBody);
        isDirtyRef.current = false;
      } catch (e) {
        console.error('Failed to auto-save invoice format settings', e);
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, [
    venueBusinessFields,
    eventDetailsFields,
    lineItemFields,
    topNotes,
    bottomNotes,
    footer,
    lineItemDisplay,
  ]);

  return (
    <div className={classes.root}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleLogoChange}
      />

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Typography sx={{ textAlign: 'left', fontSize: 18, fontWeight: 500 }}>
            Invoices
          </Typography>
          <Tooltip title="Adjust Logo in Appearance Settings" placement="top">
            <Box
              role="button"
              tabIndex={0}
              onClick={handleLogoClick}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleLogoClick();
              }}
              sx={{
                border: '1px solid #5C236F',
                borderRadius: '5px',
                height: 120,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                cursor: 'pointer',
                marginTop: '10px',
                flexDirection: 'column',
                position: 'relative',
                userSelect: 'none',
                padding: '3px',
              }}
            >
              {logoUrl ? (
                <Box
                  sx={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                  }}
                >
                  <img
                    src={logoUrl}
                    alt="Invoice Logo"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain',
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      right: 5,
                      top: 5,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      padding: '4px 6px',
                    }}
                  >
                    <FileUploadOutlinedIcon />
                  </Box>
                </Box>
              ) : (
                <>
                  <FileUploadOutlinedIcon />
                  <Typography sx={{ fontSize: 12, color: '#6B7280', fontWeight: 600 }}>
                    Upload Logo
                  </Typography>
                </>
              )}
            </Box>
          </Tooltip>
        </Grid>

        {/* 3) Token list block (not editable, braces required) */}
        <Grid
          item
          xs={12}
          md={8}
          sx={{
            display: 'flex',
            alignItems: 'end',
            justifyContent: 'end',
            width: '100%',
          }}
        >
          <SectionCard
            title=""
            sx={{
              height: '120px',
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              border: '1px solid #5C236F',
              borderRadius: '6px',
            }}
          >
            <Box sx={{ flex: 1 }}>
              <TokenListBlock />
            </Box>
          </SectionCard>
        </Grid>
      </Grid>

      <Box sx={{ height: 12, marginTop: '12px', borderTop: '1px solid #cacacaff' }} />

      {/* 4) Venue & Business Details */}
      <SectionCard
        title="Venue & Business Details"
        sx={{
          textAlign: 'left',
          fontWeight: '400',
          border: 'none',
          padding: '0px',
        }}
      >
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={venueBusinessAll}
                  onChange={(e) => {
                    setVenueBusinessFields(
                      setAllSelected(venueBusinessFields, e.target.checked)
                    );
                    markDirty();
                  }}
                />
              }
              label="Select All"
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={venueBusinessFields.venueName}
                  onChange={(e) => {
                    setVenueBusinessFields((prev) => ({
                      ...prev,
                      venueName: e.target.checked,
                    }));
                    markDirty();
                  }}
                />
              }
              label="Venue Name"
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={venueBusinessFields.venueAddress}
                  onChange={(e) => {
                    setVenueBusinessFields((prev) => ({
                      ...prev,
                      venueAddress: e.target.checked,
                    }));
                    markDirty();
                  }}
                />
              }
              label="Venue Address"
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={venueBusinessFields.businessPhone}
                  onChange={(e) => {
                    setVenueBusinessFields((prev) => ({
                      ...prev,
                      businessPhone: e.target.checked,
                    }));
                    markDirty();
                  }}
                />
              }
              label="Business Phone"
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={venueBusinessFields.businessEmail}
                  onChange={(e) => {
                    setVenueBusinessFields((prev) => ({
                      ...prev,
                      businessEmail: e.target.checked,
                    }));
                    markDirty();
                  }}
                />
              }
              label="Business Email"
            />
          </Grid>
        </Grid>
      </SectionCard>

      <Box sx={{ height: 12, marginTop: '12px', borderTop: '1px solid #cacacaff' }} />

      {/* 5) Event Details */}
      <SectionCard
        title="Event Details"
        sx={{
          textAlign: 'left',
          fontWeight: '400',
          border: 'none',
          padding: '0px',
        }}
      >
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={eventDetailsAll}
                  onChange={(e) => {
                    setEventDetailsFields(
                      setAllSelected(eventDetailsFields, e.target.checked)
                    );
                    markDirty();
                  }}
                />
              }
              label="Select All"
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={eventDetailsFields.eventName}
                  onChange={(e) => {
                    setEventDetailsFields((prev) => ({
                      ...prev,
                      eventName: e.target.checked,
                    }));
                    markDirty();
                  }}
                />
              }
              label="Event Name"
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={eventDetailsFields.eventAddress}
                  onChange={(e) => {
                    setEventDetailsFields((prev) => ({
                      ...prev,
                      eventAddress: e.target.checked,
                    }));
                    markDirty();
                  }}
                />
              }
              label="Event Address"
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={eventDetailsFields.eventCategory}
                  onChange={(e) => {
                    setEventDetailsFields((prev) => ({
                      ...prev,
                      eventCategory: e.target.checked,
                    }));
                    markDirty();
                  }}
                />
              }
              label="Event Category"
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={eventDetailsFields.guestCount}
                  onChange={(e) => {
                    setEventDetailsFields((prev) => ({
                      ...prev,
                      guestCount: e.target.checked,
                    }));
                    markDirty();
                  }}
                />
              }
              label="Guest Count"
            />
          </Grid>
        </Grid>
      </SectionCard>

      <Box sx={{ height: 12, marginTop: '12px', borderTop: '1px solid #cacacaff' }} />

      {/* 6) Top Notes */}
      <SectionCard
        title="Top Notes"
        sx={{
          textAlign: 'left',
          fontWeight: '400',
          border: 'none',
          padding: '0px',
        }}
      >
        <Box sx={{ position: 'relative' }}>
          <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 2 }}></Box>

          <TextField
            value={topNotes}
            onChange={(e) => {
              setTopNotes(e.target.value);
              markDirty();
            }}
            multiline
            rows={4}
            fullWidth
            placeholder=""
            sx={{
              '& .MuiOutlinedInput-root': {
                paddingRight: '48px',
                border: '1px solid #5C236F',
              },
            }}
          />
        </Box>
      </SectionCard>

      <Box sx={{ height: 12, marginTop: '12px', borderTop: '1px solid #cacacaff' }} />

      {/* 7) Line Item Display */}
      {/*
      <SectionCard
        title=""
        sx={{
          textAlign: 'left',
          fontWeight: '400',
          border: 'none',
          padding: '0px',
        }}
      >

        <Box sx={{ display: 'flex', alignItems: 'center', gap: '55px' }}>
          <Typography sx={{ fontSize: '13px', fontWeight: 600 }}>
            Line Item Display
          </Typography>
          <RadioGroup
            row
            value={lineItemDisplay}
            onChange={(e) => {
              setLineItemDisplay(e.target.value as any);
              setDisplayCentered(e.target.value === 'centered');
              markDirty();
            }}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              gap: '50px',
            }}
          >
            <FormControlLabel
              value="centered"
              control={<Radio size="small" />}
              label="Centered"
              sx={{
                '& .MuiTypography-root': {
                  fontSize: '16px',
                  fontWeight: 400,
                },
              }}
            />
            <FormControlLabel
              value="boxed"
              control={<Radio size="small" />}
              label="Boxed"
              sx={{
                '& .MuiTypography-root': {
                  fontSize: '16px',
                  fontWeight: 400,
                },
              }}
            />
          </RadioGroup>
        </Box>


        <Box sx={{ mt: 1 }}>
          <Box
            sx={{
              border: '1px solid #5C236F',
              borderRadius: '6px',
              height: 120,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: theme.palette.text.secondary,
              fontSize: 14,
              background: theme.palette.background.paper,
              padding: '0 16px',
            }}
          >
            Print Preview
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />
        */}

      {/* Line item columns (simple toggles) */}
      {/*
        <Grid
          container
          spacing={1}
          sx={{ justifyContent: 'flex-start', paddingLeft: 1 }}
        >
          {Object.entries(lineItemFields).map(([key, checked]) => {
            const labelMap: Record<string, string> = {
              payment: 'Payment',
              paymentMethod: 'Payment Method',
              paymentDate: 'Payment Date',
              amount: 'Amount',
              payerName: 'Payer Name',
            };

            return (
              <Grid item xs={2.4} sm={2.4} md={2.4} key={key}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Typography sx={{ fontSize: 12, fontWeight: 600 }}>
                    {labelMap[key] ?? key}
                  </Typography>
                  <IconButton
                    sx={{ paddingLeft: '5px' }}
                    onClick={() => {
                      setLineItemFields((prev) => ({
                        ...prev,
                        [key]: !prev[key],
                      }));
                      markDirty();
                    }}
                  >
                    {checked ? (
                      <Visibility sx={{ fontSize: 20, color: '#6B7280' }} />
                    ) : (
                      <VisibilityOff sx={{ fontSize: 20, color: '#6B7280' }} />
                    )}
                  </IconButton>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </SectionCard>

      <Box
        sx={{ height: 12, marginTop: '12px', borderTop: '1px solid #cacacaff' }}
      />
    */}

      <SectionCard
        title="Bottom Notes"
        sx={{
          textAlign: 'left',
          fontWeight: '400',
          border: 'none',
          padding: '0px',
        }}
      >
        <TextField
          value={bottomNotes}
          onChange={(e) => {
            setBottomNotes(e.target.value);
            markDirty();
          }}
          multiline
          rows={4}
          fullWidth
          placeholder=""
          sx={{
            '& .MuiOutlinedInput-root': {
              paddingRight: '48px',
              border: '1px solid #5C236F',
            },
          }}
        />
      </SectionCard>

      <Box sx={{ height: 12, marginTop: '12px', borderTop: '1px solid #cacacaff' }} />

      <SectionCard
        title="Footer"
        sx={{
          textAlign: 'left',
          fontWeight: '400',
          border: 'none',
          padding: '0px',
        }}
      >
        <Box sx={{ position: 'relative' }}>
          <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 2 }}></Box>

          <TextField
            value={footer}
            onChange={(e) => {
              setFooter(e.target.value);
              markDirty();
            }}
            multiline
            rows={4}
            fullWidth
            placeholder=""
            sx={{
              '& .MuiOutlinedInput-root': {
                paddingRight: '48px',
                border: '1px solid #5C236F',
              },
            }}
          />
        </Box>
      </SectionCard>

      <Box sx={{ height: 12, marginTop: '12px', borderTop: '1px solid #cacacaff' }} />

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography sx={{ fontSize: '13px', fontWeight: 600 }}>Time & Page Count</Typography>
        <RadioGroup
          row
          value={timeAndPageCount ? 'show' : 'hide'}
          onChange={(e) => {
            setTimeAndPageCount(e.target.value === 'show');
            markDirty();
          }}
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <FormControlLabel value="show" control={<Radio size="small" />} label="Show" />
          <FormControlLabel value="hide" control={<Radio size="small" />} label="Hide" />
        </RadioGroup>
      </div>
    </div>
  );
};

export default InvoicesSettings;
