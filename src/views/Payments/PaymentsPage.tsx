import { useDispatch, useSelector } from 'react-redux';
import { store } from '../..';
import { useEffect, useMemo, useState } from 'react';

import {
  Box,
  Button,
  FormControl,
  InputLabel,
  Menu,
  MenuItem,
  Select,
  Tab,
  Tabs,
  TextField,
  Theme,
  Tooltip,
  useTheme,
} from '@mui/material';

import { makeStyles } from '@mui/styles';

import { FilterOptions } from '../../components/Modals/PaymentFilterModal';
import { FilterOptions as ReqFilterOptions } from '../../components/Modals/PaymentRequestFilterModal';
import { ReduxState } from '../../reducers';
import TablePageStyles from '../../components/Styles/TablePageStyles';
import PaymentsTable from '../../components/Tables/PaymentTable';
import PaymentRequestsTable from '../../components/Tables/PaymentRequestsTable';
import PlacezIconButton from '../../components/PlacezUIComponents/PlacezIconButton';
import { ToastMessage } from '../../reducers/ui';

import {
  CancelScheduleSend,
  EditOutlined,
  FileOpenOutlined,
  FilterAltOutlined,
  ScheduleSend,
  Send,
  TuneOutlined,
} from '@mui/icons-material';

import { ModalConsumer } from '../../components/Modals/ModalContext';
import ColumnCustomizeModal, {
  ColumnVisibility,
} from '../../components/Modals/ColumnCustomizeModal';
import PaymentFilterModal from '../../components/Modals/PaymentFilterModal';
import PaymentRequestFilterModal from '../../components/Modals/PaymentRequestFilterModal';
import { paymentApi } from '../../api';
import HPayPayment from '../../api/payments/models/Payment';

interface Props {}

const PaymentsPage = (props: Props) => {
  const dispatch = useDispatch();

  const theme: Theme = useTheme();
  const styles = makeStyles<Theme>(TablePageStyles);
  const classes = styles(props);

  const globalFilter = useSelector(
    (state: ReduxState) => state.settings.globalFilter
  );

  const [activeTab, setActiveTab] = useState<'payments' | 'requests'>(
    'payments'
  );

  const [extendValue, setExtendValue] = useState(0);
  const [extendUnit, setExtendUnit] = useState<'days' | 'weeks' | 'month'>(
    'days'
  );

  const [payments, setPayments] = useState([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedPayments, setSelectedPayments] = useState<any[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | number>('');
  const [toolsMode, setToolsMode] = useState<boolean>(false);
  const [isApplying, setIsApplying] = useState(false);

  const handleExtendClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleExtendClose = () => {
    setAnchorEl(null);
  };

  const handleApplyExtension = async () => {
    try {
      // Disable the button while processing
      setIsApplying(true);

      // Convert extension to days
      let totalDays = extendValue;
      if (extendUnit === 'weeks') totalDays *= 7;
      if (extendUnit === 'month') totalDays = 30; // 1 month = 30 days
      totalDays = Math.min(totalDays, 30); // cap at 30

      store.dispatch(ToastMessage('Applying expiration date extension...'));

      const requests = selectedPayments.map((payment) => {
        const expirationDate = new Date(payment.expirationDate);
        expirationDate.setDate(expirationDate.getDate() + totalDays);

        const newExpirationDate = expirationDate.toISOString();

        return paymentApi.createPaymentLink({
          ...payment,
          expirationDate: newExpirationDate,
        });
      });

      await Promise.all(requests);

      store.dispatch(
        ToastMessage(
          'Expiration date extension applied successfully!',
          null,
          '#34AA44'
        )
      );

      handleExtendClose();
    } catch (error) {
      // Error toast
      store.dispatch(
        ToastMessage(
          'Failed to apply expiration date extension.',
          null,
          '#E6492D'
        )
      );
    } finally {
      setIsApplying(false);
    }
  };

  const handleCancelLinks = () => {
    for (const payment of selectedPayments) {
      paymentApi.cancelPaymentLink(payment.paymentNumber);
    }
  };

  const handleResendLinks = () => {
    for (const payment of selectedPayments) {
      paymentApi.resendPaymentLink(payment.paymentNumber);
    }
  };

  const exportToCSV = (data, columns) => {
    if (!data || !columns) return;

    const visibleCols = columns.filter((col) => !col.hidden);
    const headers = visibleCols.map((col) => col);
    const rows = data.map((row) =>
      visibleCols.map(
        (col) => `"${String(row[col] ?? '').replace(/"/g, '""')}"`
      )
    );

    const csvContent = [headers, ...rows].map((r) => r.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      activeTab === 'payments' ? 'payments.csv' : 'payment_requests.csv'
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    store.dispatch(
      ToastMessage('CSV file exported successfully!', null, '#34AA44')
    );
  };

  // Payment columns
  const paymentColumns = [
    { field: 'ccTransactionId', title: 'Transaction ID', visible: true },
    { field: 'sceneId', title: 'Event ID', visible: true },
    { field: 'eventName', title: 'Event Name', visible: true },
    { field: 'eventStartDate', title: 'Event Date', visible: true },
    { field: 'totalPaid', title: 'Total Paid', visible: true },
    { field: 'totalSurcharge', title: 'Surcharge', visible: false },
    { field: 'expirationDate', title: 'Expires On', visible: true },
    { field: 'dateApplied', title: 'Date Paid', visible: false },
    { field: 'paymentMethod', title: 'Pay Method', visible: true },
    { field: 'cardIssuer', title: 'Bank Name', visible: false },
    { field: 'accountLastFour', title: 'Card', visible: true },
    { field: 'totalOwed', title: 'Event Total', visible: false },
  ];

  // Payment Request columns
  const requestColumns = [
    { field: 'invoiceNumber', title: 'Event ID', visible: true },
    { field: 'payer', title: 'Payer Contact Name', visible: true },
    { field: 'createdUtcDateTime', title: 'Created On', visible: true },
    { field: 'paymentLinkStatus', title: 'Status', visible: true },
    { field: 'expirationDate', title: 'Expires On', visible: true },
    { field: 'amountToCharge', title: 'Amount Requested', visible: true },
    { field: 'isMailSent', title: 'Email Sent', visible: false },
    { field: 'surchargePercent', title: 'Surcharge', visible: false },
    { field: 'showTip', title: 'Tip', visible: false },
    { field: 'paymentLinkType', title: 'Request Type', visible: false },
  ];

  const activeColumns = useMemo(() => {
    return activeTab === 'payments' ? paymentColumns : requestColumns;
  }, [activeTab]);

  const [columnVisibility, setColumnVisibility] =
    useState<ColumnVisibility[]>(activeColumns);

  useEffect(() => {
    setColumnVisibility(activeColumns);
  }, [activeColumns]);

  useEffect(() => {
    if (activeTab === 'payments') {
      setToolsMode(false);
    }
  }, [activeTab]);

  const [filters, setFilters] = useState<FilterOptions>({
    dateRangeStart: null,
    dateRangeEnd: null,
    dateRangeOperator: 'withinRange',
  });

  const handleColumnVisibilityChange = (updated: ColumnVisibility[]) => {
    setColumnVisibility(updated);
  };

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const visibleColumns = columnVisibility
    .filter((col) => col.visible)
    .map((col) => col.field) as (keyof HPayPayment)[];

  return (
    <div className={classes.root}>
      {/* Header / Tools Bar */}
      <div
        className={classes.pageTools}
        style={{
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Box>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab
              value="payments"
              label="Payments"
              sx={{
                fontSize: '1.9rem',
                paddingY: 1,
                minHeight: 30,
                textTransform: 'none',
              }}
            />
            <Tab
              value="requests"
              label="Payment Requests"
              sx={{
                fontSize: '1.9rem',
                paddingY: 1,
                minHeight: 30,
                textTransform: 'none',
              }}
            />
          </Tabs>
        </Box>

        <div style={{ flexGrow: 1 }} />

        {/* Tools bar (optional, same as before) */}
        {toolsMode && (
          <div
            style={{
              display: 'flex',
              gap: '10px',
              alignItems: 'center',
              backgroundColor: '#EEE9F1',
              borderRadius: '5px',
              marginRight: '24px',
            }}
          >
            <Tooltip title="Resend Link(s)">
              <PlacezIconButton
                style={{ backgroundColor: '#EEE9F1', border: 'none' }}
                onClick={() => {
                  handleResendLinks();
                }}
              >
                <Send style={{ color: '#5C2470' }} />
              </PlacezIconButton>
            </Tooltip>
            <Tooltip title="Extend Payment Link(s)">
              <PlacezIconButton
                style={{ backgroundColor: '#EEE9F1', border: 'none' }}
                onClick={handleExtendClick}
              >
                <ScheduleSend style={{ color: '#5C2470' }} />
              </PlacezIconButton>
            </Tooltip>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleExtendClose}
              PaperProps={{
                style: { padding: '16px', minWidth: '220px' },
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <TextField
                  label="Duration"
                  type="number"
                  size="small"
                  value={extendValue}
                  onChange={(e) => setExtendValue(Number(e.target.value))}
                  inputProps={{
                    min: 1,
                    max: extendUnit === 'month' ? 30 : 30,
                  }}
                />

                <FormControl size="small">
                  <InputLabel id="unit-label">Unit</InputLabel>
                  <Select
                    labelId="unit-label"
                    value={extendUnit}
                    label="Unit"
                    onChange={(e) =>
                      setExtendUnit(
                        e.target.value as 'days' | 'weeks' | 'month'
                      )
                    }
                  >
                    <MenuItem value="days">Days</MenuItem>
                    <MenuItem value="weeks">Weeks</MenuItem>
                    <MenuItem value="month">1 Month (30 days)</MenuItem>
                  </Select>
                </FormControl>

                <Button
                  variant="contained"
                  size="small"
                  onClick={handleApplyExtension}
                  disabled={extendValue <= 0}
                >
                  Apply
                </Button>
              </div>
            </Menu>
            <Tooltip title="Cancel Payment Links(s)">
              <PlacezIconButton
                style={{ backgroundColor: '#EEE9F1', border: 'none' }}
                onClick={() => {
                  handleCancelLinks();
                }}
              >
                <CancelScheduleSend style={{ color: '#5C2470' }} />
              </PlacezIconButton>
            </Tooltip>
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          {activeTab === 'requests' && (
            <Tooltip title="Edit Payment Requests">
              <PlacezIconButton onClick={() => setToolsMode(!toolsMode)}>
                <EditOutlined />
              </PlacezIconButton>
            </Tooltip>
          )}
          {activeTab === 'payments' && (
            <ModalConsumer>
              {({ showModal, props }) => (
                <Tooltip title="Filter Payments">
                  <PlacezIconButton
                    onClick={() => {
                      showModal(PaymentFilterModal, {
                        ...props,
                        columnVisibility,
                        onColumnVisibilityChange: handleColumnVisibilityChange,
                        onFilterChange: handleFilterChange,
                        initialFilters: filters,
                        onExportPDF: () => {},
                        onExportExcel: () => {},
                      });
                    }}
                  >
                    <FilterAltOutlined />
                  </PlacezIconButton>
                </Tooltip>
              )}
            </ModalConsumer>
          )}
          {activeTab === 'requests' && (
            <ModalConsumer>
              {({ showModal, props }) => (
                <Tooltip title="Filter Requests">
                  <PlacezIconButton
                    onClick={() => {
                      showModal(PaymentRequestFilterModal, {
                        ...props,
                        columnVisibility,
                        onColumnVisibilityChange: handleColumnVisibilityChange,
                        onFilterChange: handleFilterChange,
                        initialFilters: filters,
                        onExportPDF: () => {},
                        onExportExcel: () => {},
                      });
                    }}
                  >
                    <FilterAltOutlined />
                  </PlacezIconButton>
                </Tooltip>
              )}
            </ModalConsumer>
          )}
          <ModalConsumer>
            {({ showModal, props }) => (
              <Tooltip title="Show/Hide Columns">
                <PlacezIconButton
                  onClick={() => {
                    showModal(ColumnCustomizeModal, {
                      ...props,
                      columnVisibility,
                      onColumnVisibilityChange: handleColumnVisibilityChange,
                      onExportPDF: () => {},
                      onExportExcel: () => {},
                    });
                  }}
                >
                  <TuneOutlined />
                </PlacezIconButton>
              </Tooltip>
            )}
          </ModalConsumer>
          <Tooltip title="Export to CSV">
            <PlacezIconButton
              onClick={() => exportToCSV(payments, visibleColumns)}
            >
              <FileOpenOutlined />
            </PlacezIconButton>
          </Tooltip>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className={classes.table}>
        {activeTab === 'payments' && (
          <PaymentsTable
            height={'calc(100vh - 224px)'}
            selectedOption={selectedOption}
            columns={visibleColumns}
            filters={filters}
            toolsMode={toolsMode}
            onPaymentsChange={setPayments}
            setSelectedPayments={setSelectedPayments}
            selectedPayments={selectedPayments}
          />
        )}

        {activeTab === 'requests' && (
          <PaymentRequestsTable
            height={'calc(100vh - 224px)'}
            filters={filters as unknown as ReqFilterOptions}
            toolsMode={toolsMode}
            columns={visibleColumns}
            onPaymentsChange={setPayments}
            setSelectedPayments={setSelectedPayments}
            selectedPayments={selectedPayments}
          />
        )}
      </div>
    </div>
  );
};

export default PaymentsPage;
