import { useDispatch, useSelector } from 'react-redux';
import { store } from '../..';
import { ReduxState } from '../../reducers';
import { useNavigate, useParams } from 'react-router';
import {
  Box,
  Button,
  FormControl,
  IconButton,
  InputLabel,
  List,
  ListItem,
  MenuItem,
  Select,
  Tab,
  TextField,
  Theme,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { makeStyles } from '@mui/styles';

import PlacezIconButton from '../../components/PlacezUIComponents/PlacezIconButton';
import { ModalConsumer } from '../../components/Modals/ModalContext';
import {
  Add,
  AttachMoney,
  CloudDownloadOutlined,
  DeleteOutlined,
  CopyAll,
  EditOutlined,
  Image,
  PrintOutlined,
  Send,
  TuneOutlined,
  FileOpenOutlined,
  FilterAltOutlined,
  SendOutlined,
  ScheduleSendOutlined,
  HighlightOff,
} from '@mui/icons-material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { useEffect, useMemo, useRef, useState } from 'react';
import { GetFloorPlans } from '../../reducers/floorPlans';
import { paymentApi, placezApi, PlacezLayoutPlan } from '../../api';
import {
  getLayouts,
  GetTemplates,
  ToggleIncludeInInvoice,
} from '../../reducers/layouts';
import {
  getCurrentScene,
  GetScene,
  getSceneById,
  SelectScene,
  UpdateScene,
  CopySceneWithLayouts,
  DeleteScene,
} from '../../reducers/scenes';
import SceneModal from '../../components/Modals/SceneModal';
import SubEventCard from './SubEventCard';
import {
  LocalStorageKey,
  useLocalStorageSelector,
} from '../../components/Hooks/useLocalStorageState';
import InvoiceTable from '../../components/Tables/InvoiceTable';
import NoteModal from '../../components/Modals/NoteModal';
import NotePanel from '../../components/Blue/components/panels/NotePanel';
import PlacezNote from '../../api/placez/models/PlacezNote';
import DetailViewStyles from '../../components/Styles/DetailViewStyles.css';
import SendInvoiceModal from '../../components/Modals/SendInvoiceModal';

import { sceneRoutes } from '../../routes';
import ReactToPrint from 'react-to-print';
import NotePrint from '../../components/Blue/models/NotePrint';
import NewSubEventModal from '../../components/Modals/NewSubEventModal';
import { format } from 'date-fns';
import MakePaymentModal from '../../components/Modals/MakePaymentModal/index';
import { findEarliestAndLatest } from '../../sagas/layout';
import PaymentsTable from '../../components/Tables/PaymentTable';
import PaymentRequestsTable from '../../components/Tables/PaymentRequestsTable';

import { AreYouSureDelete } from '../../components/Modals/UniversalModal';
import { UniversalModalWrapper } from '../../components/Modals/UniversalModalWrapper';
import { formatNumber } from '../../utils/formatNumber';
import PaymentFilterModal, {
  FilterOptions,
} from '../../components/Modals/PaymentFilterModal';
import { FilterOptions as ReqFilterOptions } from '../../components/Modals/PaymentRequestFilterModal';
import ColumnCustomizeModal, {
  ColumnVisibility,
} from '../../components/Modals/ColumnCustomizeModal';
import { Menu } from '@material-ui/core';
import PaymentRequestFilterModal from '../../components/Modals/PaymentRequestFilterModal';
import { ToastMessage } from '../../reducers/ui';
import { PDFDownloadLink, StyleSheet } from '@react-pdf/renderer';
import { InvoiceDoc } from './InvoiceDoc';
import { createSelector } from 'reselect';

type Props = {};

type TabValues =
  | 'Subevent'
  | 'Invoice'
  | 'Notes'
  | 'Payments'
  | 'Payment Requests';

const styles = StyleSheet.create({
  page: { padding: 30 },
});

const getUserSettings = (state) => {
  return state.settings.userSettings;
};

const getCompanyLogo = createSelector([getUserSettings], (userSettings) =>
  userSettings.find((setting) => setting.name === 'Company Logo')
);

const EventDetails = (props: Props) => {
  const dispatch = useDispatch();
  const styles = makeStyles<Theme>(DetailViewStyles);
  const classes = styles(props);
  const theme: Theme = useTheme();

  const toolsPillBg =
    theme.palette.mode === 'dark' ? theme.palette.action.selected : '#EEE9F1';

  const toolsPillBorder =
    theme.palette.mode === 'dark'
      ? `1px solid ${theme.palette.divider}`
      : 'none';

  const companyLogo = useSelector((state: ReduxState) => getCompanyLogo(state));

  const scene = useSelector(getCurrentScene);

  const layouts = useSelector(getLayouts);

  const twentyFourHourTime = useLocalStorageSelector<boolean>(
    LocalStorageKey.TwentyFourHourTime
  );

  const floorplans = useSelector(
    (state: ReduxState) => state.floorPlans.unsorted
  );

  const time = findEarliestAndLatest(layouts);

  const { id } = useParams();

  const notesRef = useRef(null);
  const thumbnailRef = useRef(null);

  const floorplansFetchedRef = useRef(false);

  useEffect(() => {
    if (!floorplansFetchedRef.current) {
      dispatch(GetFloorPlans());
      dispatch(GetTemplates());
      floorplansFetchedRef.current = true;
    }
  }, []);

  const sceneInState = useSelector((state: ReduxState) =>
    getSceneById(state, parseInt(id))
  );

  useEffect(() => {
    if (id) {
      if (sceneInState) {
        dispatch(SelectScene(parseInt(id)));
      } else {
        dispatch(GetScene(parseInt(id)));
      }
    }
  }, [id]);

  const [tabValue, setTabValue] = useState<TabValues>('Invoice');
  const [selectedLayoutId, setSelectedLayoutId] = useState<string | null>(null);
  const [selectedLayout, setSelectedLayout] =
    useState<PlacezLayoutPlan>(undefined);
  const [onExportPDF, setOnExportPDF] = useState<() => void>(undefined);
  const [onExportExcel, setOnExportExcel] = useState<() => void>(undefined);
  const [hasLoaded, setHasLoaded] = useState<boolean>(false);
  const [editMode, setEditMode] = useState(false);
  const [payments, setPayments] = useState([]);

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
    return tabValue === 'Payments' ? paymentColumns : requestColumns;
  }, [tabValue]);

  const [columnVisibility, setColumnVisibility] =
    useState<ColumnVisibility[]>(activeColumns);

  useEffect(() => {
    setColumnVisibility(activeColumns);
  }, [activeColumns]);

  const [filters, setFilters] = useState<FilterOptions>({
    dateRangeStart: null,
    dateRangeEnd: null,
    dateRangeOperator: 'withinRange',
    eventId: id,
  });

  const [extendValue, setExtendValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [extendUnit, setExtendUnit] = useState<'days' | 'weeks' | 'month'>(
    'days'
  );
  const [selectedPayments, setSelectedPayments] = useState<any[]>([]);

  const [selectedOption, setSelectedOption] = useState<string | number>('');
  const [toolsMode, setToolsMode] = useState<boolean>(false);
  const [isApplying, setIsApplying] = useState(false);

  const handleColumnVisibilityChange = (updatedColumns: ColumnVisibility[]) => {
    setColumnVisibility(updatedColumns);
  };

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

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

    // Filter out hidden columns
    const visibleCols = columns.filter((col) => !col.hidden);

    // Prepare header row
    const headers = visibleCols.map((col) => col);

    // Prepare data rows
    const rows = data.map((row) => {
      return visibleCols.map((col) => {
        const value = row[col];
        // Escape quotes and commas for CSV formatting
        return `"${String(value ?? '').replace(/"/g, '""')}"`;
      });
    });

    // Combine header + rows
    const csvContent = [headers, ...rows]
      .map((row) => row.join(','))
      .join('\n');

    // Trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'payments.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const onSaveNote = (note: PlacezNote) => {
    const newNotes = [...scene.notes];
    if (note.id) {
      const foundNote = newNotes.find((n) => n.id === note.id);
      if (foundNote) {
        foundNote.content = note.content;
        foundNote.title = note.title;
      }
    } else {
      newNotes.push(note);
    }
    dispatch(
      UpdateScene({
        ...scene,
        notes: newNotes,
      })
    );
  };

  const onDeleteNote = (id: string) => {
    const newNotes = [...scene.notes];

    newNotes.splice(
      newNotes.findIndex((n) => n.id === id),
      1
    );

    dispatch(
      UpdateScene({
        ...scene,
        notes: newNotes,
      })
    );
  };

  useEffect(() => {
    if (layouts === undefined) return;
    if (selectedLayoutId === null) {
      setSelectedLayout(null);
    } else {
      setSelectedLayout(
        layouts.find((layout) => layout.id === selectedLayoutId)
      );
    }
  }, [selectedLayoutId, layouts, scene]);

  const navigate = useNavigate();

  const goToSpecificPlan = (planId) =>
    navigate(
      sceneRoutes.planner.path
        .replace(':id', scene.id.toString())
        .replace(':planId', planId.toString())
    );

  const addSubEventRef = useRef(null);

  useEffect(() => {
    if (layouts === undefined) return;
    if (layouts.length === 0) {
      if (!hasLoaded) {
        setHasLoaded(true);
        return;
      }
      addSubEventRef.current.click();
    } else if (selectedLayoutId === null && layouts.length > 0 && !hasLoaded) {
      setTabValue('Subevent');
      setSelectedLayoutId(layouts[0].id);
      setHasLoaded(true);
    } else if (selectedLayoutId === null && tabValue !== 'Invoice') {
      setTabValue('Invoice');
    }
  }, [layouts, selectedLayoutId]);

  const invoiceTotal = useSelector(
    (state: ReduxState) => state.layouts.invoiceTotal
  );
  const invoiceLineItems = useSelector(
    (state: ReduxState) => state.layouts.invoiceLineItems
  );
  const [customInvoiceLineItems, setCustomInvoiceLineItems] = useState([]);

  useEffect(() => {
    const getCustomLineItems = async () => {
      const response = await placezApi.getCustomInvoiceLineItemByScene(
        Number(id)
      );
      if (response.parsedBody.length > 0) {
        setCustomInvoiceLineItems(response.parsedBody);
      }
    };
    getCustomLineItems();
  }, [id, invoiceLineItems]);

  const customLineItems = invoiceLineItems?.filter((item) => !item.layoutId);

  const handleChange = (event: React.SyntheticEvent, newValue: TabValues) => {
    setTabValue(newValue);
  };

  const clients = useSelector((state: ReduxState) => state.client.clients);
  const getClientById = (clientId: number) =>
    clients.find((client) => {
      return client.id === clientId;
    })?.name;

  const onDelete = () => {
    dispatch(DeleteScene(scene.id));
  };
  const onCopy = () => {
    dispatch(CopySceneWithLayouts(scene));
  };

  const handleToggleIncludeInInvoice = (layoutId: string) => {
    dispatch(ToggleIncludeInInvoice(layoutId));
  };

  interface HPayPayment {
    paymentId: string;
    eventName: string;
    eventStartDate: string;
    totalPaid: number;
    ccStatus: string;
    totalSurcharge: string;
    dateApplied: string;
    dueDate: string;
    expirationDate: string;
    paymentMethod: string;
    cardIssuer: string;
    accountLastFour: string;
    totalOwed: string;
  }

  const visibleColumns = columnVisibility
    .filter((col) => col.visible)
    .map((col) => col.field) as (keyof HPayPayment)[];

  const startDate = scene?.startUtcDateTime;
  const endDate = scene?.endUtcDateTime;

  return (
    <div
      className={classes.root}
      // onClick={(e) => setSelectedLayoutId(null)}
    >
      <Box className={classes.topIconBar}>
        <ModalConsumer>
          {({ showModal, props }) => (
            <Tooltip title="Event Details">
              <PlacezIconButton
                onClick={() => {
                  showModal(SceneModal, { ...props, scene });
                }}
              >
                <EditOutlined />
              </PlacezIconButton>
            </Tooltip>
          )}
        </ModalConsumer>
        <PlacezIconButton onClick={onCopy}>
          <CopyAll />
        </PlacezIconButton>
        <UniversalModalWrapper
          onDelete={() => onDelete()}
          modalHeader="Are you sure?"
        >
          <Tooltip title="Delete Event">
            <PlacezIconButton>
              <DeleteOutlined />
            </PlacezIconButton>
          </Tooltip>
          {AreYouSureDelete('an Event')}
        </UniversalModalWrapper>
      </Box>
      <Box className={classes.venueCardHeader}>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6">{scene?.name}</Typography>
          <Typography variant="body1">ID: {scene?.id}</Typography>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6">Event Total</Typography>
          <Typography variant="body1">{formatNumber(invoiceTotal)}</Typography>
        </Box>
      </Box>
      {scene && (
        <Box className={classes.venueCard}>
          <PropertyDisplay
            label="Client"
            value={getClientById(scene?.clientId) ?? 'mickey'}
          />
          {startDate && (
            <PropertyDisplay
              label="Start Date"
              value={format(new Date(startDate), 'MMM d yyyy')}
            />
          )}
          {endDate && (
            <PropertyDisplay
              label="End Date"
              value={format(new Date(endDate), 'MMM d yyyy')}
            />
          )}
          {scene?.manager && (
            <PropertyDisplay label="Manager" value={scene.manager} />
          )}
          {scene?.status && (
            <PropertyDisplay label="Status" value={scene.status} />
          )}
        </Box>
      )}

      <div className={classes.detailGrid}>
        <div className={classes.gridColumn}>
          <div className={classes.detailColumnHeader}>
            <div>Sub Events</div>
            <ModalConsumer>
              {({ showModal, props }) => (
                <Tooltip title="Add Subevent">
                  <IconButton
                    ref={addSubEventRef}
                    onClick={() => {
                      showModal(NewSubEventModal, {
                        ...props,
                        sceneId: scene?.id,
                      });
                    }}
                  >
                    <Add />
                  </IconButton>
                </Tooltip>
              )}
            </ModalConsumer>
          </div>
          <List className={classes.tabPanel}>
            {layouts?.map((layout, index) => (
              <ListItem
                key={layout.id}
                style={{
                  padding: '0px',
                  // No top margin for the first item
                  margin: index === 0 ? '0px 0px 10px' : '10px 0px',
                }}
                disableGutters
              >
                <SubEventCard sceneId={scene?.id} data={layout} />
              </ListItem>
            ))}
          </List>
        </div>
        <div className={classes.gridColumn} style={{ marginRight: '-18px' }}>
          <TabContext value={tabValue}>
            <div
              className={classes.detailColumnHeader}
              style={{ marginRight: '16px' }}
            >
              <TabList className={classes.tabList} onChange={handleChange}>
                <Tab
                  className={classes.tabButton}
                  aria-label="Settings"
                  value={'Subevent'}
                  label="Subevent"
                  style={{ fontWeight: 'bold' }}
                />
                <Tab
                  className={classes.tabButton}
                  aria-label="Settings"
                  value={'Invoice'}
                  label="Invoice"
                  style={{ fontWeight: 'bold' }}
                />
                <Tab
                  className={classes.tabButton}
                  aria-label="Settings"
                  value={'Notes'}
                  label="Notes"
                  style={{ fontWeight: 'bold' }}
                />
                <Tab
                  className={classes.tabButton}
                  aria-label="Payments"
                  value={'Payments'}
                  label="Payments"
                  style={{ fontWeight: 'bold' }}
                />
                <Tab
                  className={classes.tabButton}
                  aria-label="Payment Requests"
                  value={'Payment Requests'}
                  label="Payment Requests"
                  style={{ fontWeight: 'bold' }}
                />
              </TabList>
              {tabValue === 'Notes' && (
                <div className={classes.tabPanelActions}>
                  <ReactToPrint
                    trigger={() => (
                      <PlacezIconButton
                        disabled={scene?.notes.length === 0}
                        onClick={() =>
                          (window as any).gtag('event', 'print-notes')
                        }
                      >
                        <PrintOutlined />
                      </PlacezIconButton>
                    )}
                    content={() => notesRef.current}
                  />
                  <div style={{ display: 'none' }}>
                    <NotePrint
                      notes={scene?.notes ?? []}
                      sceneName={scene?.name}
                      ref={notesRef}
                    />
                  </div>
                  <ModalConsumer>
                    {({ showModal, props }) => (
                      <Tooltip title="Create Note">
                        <PlacezIconButton
                          onClick={() => {
                            showModal(NoteModal, {
                              ...props,
                              onSaveNote,
                              scene,
                              invoiceTotal,
                            });
                          }}
                        >
                          <Add />
                        </PlacezIconButton>
                      </Tooltip>
                    )}
                  </ModalConsumer>
                </div>
              )}
              {tabValue === 'Invoice' && scene && (
                <div className={classes.tabPanelActions}>
                  <ModalConsumer>
                    {({ showModal, props }) => (
                      <Tooltip title="Edit Details">
                        <PlacezIconButton
                          onClick={() => {
                            if (editMode === false) {
                              setEditMode(true);
                            } else {
                              setEditMode(false);
                            }
                          }}
                          style={{
                            backgroundColor: editMode
                              ? '#DBD3E0'
                              : 'transparent',
                          }}
                        >
                          <EditOutlined />
                        </PlacezIconButton>
                      </Tooltip>
                    )}
                  </ModalConsumer>
                  <Tooltip title="Download Invoice PDF">
                    <PDFDownloadLink
                      document={
                        <InvoiceDoc
                          invoiceLineItems={[
                            ...customInvoiceLineItems,
                            ...invoiceLineItems,
                            ...floorplans.filter((fp) =>
                              scene?.floorPlans?.some(
                                (sceneFp) => sceneFp.id === fp.id
                              )
                            ),
                          ]}
                          companyLogo={companyLogo?.settingValue || null}
                          event={scene}
                        />
                      }
                      fileName="invoice.pdf"
                      style={{ textDecoration: 'none' }}
                    >
                      <PlacezIconButton
                        disabled={
                          invoiceLineItems.length === 0 ||
                          floorplansFetchedRef.current === false
                        }
                      >
                        <CloudDownloadOutlined />
                      </PlacezIconButton>
                    </PDFDownloadLink>
                  </Tooltip>
                </div>
              )}
              {tabValue === 'Subevent' && (
                <div className={classes.tabPanelActions}>
                  <ReactToPrint
                    trigger={() => (
                      <PlacezIconButton
                        onClick={() =>
                          (window as any).gtag('event', 'print-subEvent')
                        }
                      >
                        <Tooltip title="Print Image">
                          <PrintOutlined />
                        </Tooltip>
                      </PlacezIconButton>
                    )}
                    content={() => thumbnailRef.current}
                  />
                </div>
              )}
              {tabValue === 'Payments' && (
                <div className={classes.tabPanelActions}>
                  <ModalConsumer>
                    {({ showModal, props }) => (
                      <Tooltip title="Collect Payment">
                        <PlacezIconButton
                          onClick={() => {
                            showModal(MakePaymentModal, {
                              ...props,
                              scene,
                              invoiceTotal,
                              invoiceLineItems,
                            });
                          }}
                        >
                          <AttachMoney />
                        </PlacezIconButton>
                      </Tooltip>
                    )}
                  </ModalConsumer>
                  <ModalConsumer>
                    {({ showModal, props }) => (
                      <Tooltip title="Filter Payments">
                        <PlacezIconButton
                          onClick={() => {
                            showModal(PaymentFilterModal, {
                              ...props,
                              columnVisibility,
                              onColumnVisibilityChange:
                                handleColumnVisibilityChange,
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
                  <ModalConsumer>
                    {({ showModal, props }) => (
                      <Tooltip title="Show/Hide Columns">
                        <PlacezIconButton
                          onClick={() => {
                            showModal(ColumnCustomizeModal, {
                              ...props,
                              columnVisibility,
                              onColumnVisibilityChange:
                                handleColumnVisibilityChange,
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
              )}
              {tabValue === 'Payment Requests' && (
                <div className={classes.tabPanelActions}>
                  {toolsMode && (
                    <div
                      style={{
                        display: 'flex',
                        gap: '10px',
                        alignItems: 'center',
                        backgroundColor: toolsPillBg,
                        border: toolsPillBorder,
                        borderRadius: '5px',
                        marginRight: '24px',
                      }}
                    >
                      <Tooltip title="Resend Link(s)">
                        <PlacezIconButton
                          onClick={() => {
                            handleResendLinks();
                          }}
                        >
                          <SendOutlined />
                        </PlacezIconButton>
                      </Tooltip>
                      <Tooltip title="Extend Payment Link(s)">
                        <PlacezIconButton onClick={handleExtendClick}>
                          <ScheduleSendOutlined />
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
                            onChange={(e) =>
                              setExtendValue(Number(e.target.value))
                            }
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
                              <MenuItem value="month">
                                1 Month (30 days)
                              </MenuItem>
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
                          onClick={() => {
                            handleCancelLinks();
                          }}
                        >
                          <HighlightOff />
                        </PlacezIconButton>
                      </Tooltip>
                    </div>
                  )}
                  <Tooltip title="Edit Payment Requests">
                    <PlacezIconButton onClick={() => setToolsMode(!toolsMode)}>
                      <EditOutlined />
                    </PlacezIconButton>
                  </Tooltip>
                  <ModalConsumer>
                    {({ showModal, props }) => (
                      <Tooltip title="Send Payment Request">
                        <PlacezIconButton
                          onClick={() => {
                            showModal(SendInvoiceModal, {
                              ...props,
                              scene,
                              invoiceTotal,
                              invoiceLineItems,
                            });
                          }}
                        >
                          <Send />
                        </PlacezIconButton>
                      </Tooltip>
                    )}
                  </ModalConsumer>
                  <ModalConsumer>
                    {({ showModal, props }) => (
                      <Tooltip title="Filter Requests">
                        <PlacezIconButton
                          onClick={() => {
                            showModal(PaymentRequestFilterModal, {
                              ...props,
                              columnVisibility,
                              onColumnVisibilityChange:
                                handleColumnVisibilityChange,
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
                  <ModalConsumer>
                    {({ showModal, props }) => (
                      <Tooltip title="Show/Hide Columns">
                        <PlacezIconButton
                          onClick={() => {
                            showModal(ColumnCustomizeModal, {
                              ...props,
                              columnVisibility,
                              onColumnVisibilityChange:
                                handleColumnVisibilityChange,
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
              )}
            </div>
            <TabPanel value="Subevent" className={classes.tabPanel}>
              {layouts?.map((layout) => (
                <Box
                  key={layout.id}
                  display="flex"
                  alignItems="center"
                  flexDirection="column"
                  component="div"
                  style={{
                    border: `2px solid ${theme.palette.primary.main}`,
                    borderRadius: '5px',
                    fontWeight: 500,
                    marginBottom: '2rem',
                  }}
                >
                  <Typography sx={{ mt: 4 }} variant="h6">
                    {layout.name}
                  </Typography>
                  <div ref={thumbnailRef}>
                    <img src={layout?.imageUrl} style={{ width: '100%' }} />
                    {!layout?.imageUrl && (
                      <Image color="secondary" style={{ fontSize: 300 }} />
                    )}
                  </div>
                </Box>
              ))}
            </TabPanel>
            <TabPanel
              value="Notes"
              className={classes.tabPanel}
              style={{ overflow: 'auto' }}
            >
              <NotePanel
                notes={scene?.notes ?? []}
                onSaveNote={onSaveNote}
                onDeleteNote={onDeleteNote}
              />
            </TabPanel>
            <TabPanel value="Payments" className={classes.tabPanel}>
              <PaymentsTable
                columns={visibleColumns}
                filters={filters}
                onPaymentsChange={setPayments}
              />
            </TabPanel>
            <TabPanel value="Payment Requests" className={classes.tabPanel}>
              <PaymentRequestsTable
                columns={visibleColumns}
                filters={filters as unknown as ReqFilterOptions}
                toolsMode={toolsMode}
                onPaymentsChange={setPayments}
                setSelectedPayments={setSelectedPayments}
                selectedPayments={selectedPayments}
              />
            </TabPanel>
            {scene && (
              <TabPanel
                className={classes.tabPanel}
                value="Invoice"
                style={{
                  opacity: selectedLayout?.excludeFromInvoice ? 0.3 : 1.0,
                }}
              >
                <InvoiceTable
                  layouts={layouts}
                  floorPlans={floorplans}
                  scene={scene}
                  editMode={editMode}
                  onExportExcel={(exportExcel) => setOnExportExcel(exportExcel)}
                  onExportPDF={(exportPDF) => setOnExportPDF(exportPDF)}
                  handleToggleIncludeInInvoice={handleToggleIncludeInInvoice}
                  sx={{ pointerEvents: 'none' }}
                />
              </TabPanel>
            )}
          </TabContext>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;

const PropertyDisplay = (props) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <Typography variant="body1">{props.label}</Typography>
      <Typography variant="caption">{props.value}</Typography>
    </Box>
  );
};
