import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Box, Paper, Checkbox, Tooltip } from '@mui/material';
import { Theme, useTheme } from '@mui/material/styles';
import { Cancel, CheckCircle } from '@mui/icons-material';
import { createStyles, makeStyles } from '@mui/styles';
import {
  Grid,
  GridColumn,
  GridColumnProps,
  GridToolbar,
  GridPageChangeEvent,
} from '@progress/kendo-react-grid';
import { orderBy, SortDescriptor } from '@progress/kendo-data-query';
import { ReduxState } from '../../reducers';
import { tableStyles } from './tableSyles.css';
import { format } from 'date-fns';
import { paymentApi } from '../../api';
import HPayPayment from '../../api/payments/models/Payment';
import { FilterOptions } from '../Modals/PaymentRequestFilterModal';
import { useLocation, useParams } from 'react-router';

interface Props {
  height?: string;
  filteredPayments?: HPayPayment[];
  filters?: FilterOptions;
  toolsMode?: boolean;
  columns?: (keyof HPayPayment)[];
  onPaymentsChange?: (data: any[]) => void;
  setSelectedPayments?: (data: any[]) => void;
  selectedPayments?: any[];
  isFromDashboard?: boolean;
  size?: 'small' | 'medium';
}

export const GRID_SCROLLBAR_CLASS = 'clientGridScrollbar';

const useScrollbarStyles = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    ...tableStyles(theme),

    '@global': {
      [`.${GRID_SCROLLBAR_CLASS} .k-grid-content,
        .${GRID_SCROLLBAR_CLASS} .k-virtual-content,
        .${GRID_SCROLLBAR_CLASS} .k-grid-content-locked`]: {
        scrollbarWidth: 'auto !important',
      },

      [`.${GRID_SCROLLBAR_CLASS} .k-grid-content::-webkit-scrollbar,
        .${GRID_SCROLLBAR_CLASS} .k-virtual-content::-webkit-scrollbar,
        .${GRID_SCROLLBAR_CLASS} .k-grid-content-locked::-webkit-scrollbar`]: {
        width: '10px !important',
        height: '10px !important',
      },

      [`.${GRID_SCROLLBAR_CLASS} .k-grid-content::-webkit-scrollbar-thumb,
        .${GRID_SCROLLBAR_CLASS} .k-virtual-content::-webkit-scrollbar-thumb,
        .${GRID_SCROLLBAR_CLASS} .k-grid-content-locked::-webkit-scrollbar-thumb`]: {
        backgroundColor: '#5C236F',
        borderRadius: '999px',
      },

      [`.${GRID_SCROLLBAR_CLASS} .k-grid-content::-webkit-scrollbar-track,
        .${GRID_SCROLLBAR_CLASS} .k-virtual-content::-webkit-scrollbar-track,
        .${GRID_SCROLLBAR_CLASS} .k-grid-content-locked::-webkit-scrollbar-track`]: {
        backgroundColor: 'transparent',
      },

      ...(theme.palette.mode === 'dark'
        ? {
            'body .k-animation-container .k-popup, body .k-animation-container .k-list-container':
              {
                backgroundColor: `${theme.palette.background.paper} !important`,
                color: `${theme.palette.text.primary} !important`,
                border: `1px solid ${theme.palette.divider} !important`,
                borderRadius: `${theme.shape.borderRadius}px !important`,
              },

            'body .k-animation-container .k-popup .k-list, body .k-animation-container .k-list-container .k-list':
              {
                backgroundColor: `${theme.palette.background.paper} !important`,
                color: `${theme.palette.text.primary} !important`,
              },

            'body .k-animation-container .k-popup .k-item, body .k-animation-container .k-popup .k-list-item, body .k-animation-container .k-list-container .k-item, body .k-animation-container .k-list-container .k-list-item':
              {
                backgroundColor: 'transparent !important',
                color: `${theme.palette.text.primary} !important`,
              },

            'body .k-animation-container .k-popup .k-item:hover, body .k-animation-container .k-popup .k-list-item:hover, body .k-animation-container .k-list-container .k-item:hover, body .k-animation-container .k-list-container .k-list-item:hover':
              {
                backgroundColor: `${theme.palette.action.hover} !important`,
                color: `${theme.palette.text.primary} !important`,
              },

            'body .k-animation-container .k-popup .k-item.k-selected, body .k-animation-container .k-popup .k-list-item.k-selected, body .k-animation-container .k-list-container .k-item.k-selected, body .k-animation-container .k-list-container .k-list-item.k-selected':
              {
                backgroundColor: `${theme.palette.action.selected} !important`,
                color: `${theme.palette.text.primary} !important`,
              },
          }
        : {}),
    },
  })
);

const styles = makeStyles<Theme, Props>((theme: Theme) =>
  createStyles({
    ...tableStyles(theme),

    gridContainer: {
      overflowX: 'auto',
    },
    tableTitle: {
      display: 'flex',
      width: '100%',
      justifyContent: 'center !important',
    },
    headerWrapper: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
    },
    centerTitle: {
      position: 'absolute',
      left: '50%',
      transform: 'translateX(-50%)',
      color: theme.palette.primary.main,
      margin: '0px',
    },

    gridRoot: (props: Props) => ({
      ...theme.PlacezBorderStyles,
      fontFamily: theme.typography.fontFamily,
      backgroundColor: `${theme.palette.background.paper} !important`,
      color: `${theme.palette.text.primary} !important`,
      padding: props?.isFromDashboard ? '18px' : '32px',
      paddingTop: props?.isFromDashboard ? '0px' : '32px',
      overflow: 'hidden',

      '& .k-master-row': {
        backgroundColor: `${theme.palette.background.paper} !important`,
        color: `${theme.palette.text.primary} !important`,
      },
      '& .k-master-row:hover': {
        backgroundColor: `${theme.palette.action.hover} !important`,
        color: `${theme.palette.text.primary} !important`,
      },

      '& .k-grid-header': {
        backgroundColor: `${theme.palette.background.paper} !important`,
        borderRadius: `${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0px 0px`,
        color: `${theme.palette.text.primary} !important`,
        borderBottom: 'none',
        borderRight: 'none !important',
      },
      '& .k-grid-header :hover': {
        color: `${theme.palette.text.primary} !important`,
      },
      '& .k-grid-header .k-sorted': {
        color: `${theme.palette.primary.main} !important`,
      },
      '& .k-grid-header-wrap': {
        border: 'none !important',
      },
      '& .k-grid-norecords-template': {
        border: 'none !important',
        backgroundColor: 'transparent !important',
      },
      '& .k-column-title': {
        color: '#757575',
      },
      '& .k-table-thead': {
        backgroundColor: 'transparent !important',
        border: 'none !important',
        padding: '0px !important',
      },
      '& .k-link': {
        paddingRight: '0px !important',
        color: `${theme.palette.text.primary} !important`,
      },

      '& th': {
        color: `${theme.palette.text.primary} !important`,
      },
      '& td': {
        paddingTop: 4,
        paddingBottom: 4,
        height: '56px',
        whiteSpace: 'nowrap',
        color: `${theme.palette.text.primary} !important`,
        backgroundColor: 'inherit !important',
        borderWidth: '1px 0 !important',
        borderColor: `${theme.palette.divider} !important`,
      },
      '& td:last-child': {
        paddingRight: '10px',
        marginRight: '10px',
      },

      '& .k-grid-toolbar': {
        padding: '0px',
        display: 'flex',
        justifyContent: 'end',
      },

      '& .k-grid-content': {
        backgroundColor: `${theme.palette.background.paper} !important`,
        color: `${theme.palette.text.primary} !important`,
      },
      '& .k-sorted': {
        backgroundColor: `${theme.palette.background.paper} !important`,
      },
      '& .k-grid-pager, & .k-pager-wrap, & .k-pager': {
        backgroundColor: `${theme.palette.background.paper} !important`,
        color: `${theme.palette.text.primary} !important`,
        borderTop: `1px solid ${theme.palette.divider} !important`,
      },

      '& .k-pager-info, & .k-pager-sizes, & .k-pager-sizes .k-label': {
        color: `${theme.palette.text.secondary} !important`,
      },

      '& .k-pager-numbers .k-link': {
        color: `${theme.palette.text.primary} !important`,
        backgroundColor: 'transparent !important',
      },

      '& .k-pager-numbers .k-link:hover': {
        backgroundColor: `${theme.palette.action.hover} !important`,
      },

      '& .k-pager-numbers .k-link.k-selected, & .k-pager-numbers .k-selected .k-link':
        {
          backgroundColor: `${theme.palette.action.selected} !important`,
          color: `${theme.palette.text.primary} !important`,
          borderColor: `${theme.palette.divider} !important`,
        },

      '& .k-pager-nav .k-button, & .k-pager-wrap .k-button': {
        color: `${theme.palette.text.primary} !important`,
        backgroundColor: 'transparent !important',
        borderColor: `${theme.palette.divider} !important`,
      },

      '& .k-pager-nav .k-button:hover, & .k-pager-wrap .k-button:hover': {
        backgroundColor: `${theme.palette.action.hover} !important`,
      },

      '& .k-pager-sizes .k-dropdownlist, & .k-pager-sizes .k-dropdownlist .k-input, & .k-pager-sizes .k-dropdownlist .k-input-inner':
        {
          backgroundColor: `${theme.palette.background.paper} !important`,
          color: `${theme.palette.text.primary} !important`,
          borderColor: `${theme.palette.divider} !important`,
        },
    }),
  })
);

type InvoiceGridColumnProps = Omit<GridColumnProps, 'field'> & {
  field: string;
  minShow?: number;
  hidden?: boolean;
};

const PaymentRequestsTable: React.FC<Props> = (props) => {
  useScrollbarStyles();
  const classes = styles(props);
  const theme = useTheme();

  const [requests, setRequests] = useState<any[]>([]);
  const [sort, setSort] = useState<SortDescriptor[]>([]);

  const [skip, setSkip] = useState<number>(0);
  const [take, setTake] = useState<number>(25);

  const { pathname } = useLocation();
  const isEventDetailsPage = pathname.includes('/EventDetails');

  const globalFilter = useSelector(
    (state: ReduxState) => state.settings.globalFilter
  );

  const params = useParams();
  const eventId = params.id;

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await paymentApi.getPaymentLinks({
          accountId: '47690d59-27fe-43c3-8ff5-1d30903b01bf',
        });
        setRequests(res?.parsedBody?.items ?? []);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to load payment requests', err);
      }
    };
    fetchRequests();
  }, []);

  const filteredRequests = useMemo(() => {
    if (!requests) return [];

    let result = requests;

    if (props.filters) {
      result = result.filter((request) => {
        if (eventId && Number(request.invoiceNumber) !== Number(eventId)) {
          return false;
        }

        const requestDate = request.createdUtcDateTime
          ? new Date(request.createdUtcDateTime)
          : new Date();

        if (isNaN(requestDate.getTime())) return false;

        let datePass = true;
        if (
          props.filters.dateRangeOperator === 'gte' &&
          props.filters.dateRangeStart
        ) {
          datePass = requestDate >= props.filters.dateRangeStart!;
        } else if (
          props.filters.dateRangeOperator === 'lte' &&
          props.filters.dateRangeEnd
        ) {
          datePass = requestDate <= props.filters.dateRangeEnd!;
        } else {
          const start = props.filters.dateRangeStart || new Date(0);
          const end = props.filters.dateRangeEnd || new Date(9999, 11, 31);
          datePass = requestDate >= start && requestDate <= end;
        }

        if (!datePass) return false;

        if (props.filters.linkStatus) {
          const { linkStatus } = props.filters;
          const activeStatuses: string[] = [];
          if (linkStatus.paid) activeStatuses.push('paid');
          if (linkStatus.notPaid) activeStatuses.push('notpaid', 'initialized');
          if (linkStatus.late) activeStatuses.push('late');
          if (linkStatus.flagged) activeStatuses.push('failed', 'rejected');

          if (activeStatuses.length > 0) {
            return activeStatuses.includes(
              request.paymentLinkStatus?.toLowerCase()
            );
          }
        }

        return true;
      });
    }

    if (globalFilter && globalFilter.trim() !== '') {
      const text = globalFilter.toLowerCase();
      result = result.filter(
        (r: any) =>
          r.paymentId?.toLowerCase().includes(text) ||
          r.payer?.toLowerCase().includes(text) ||
          r.status?.toLowerCase().includes(text)
      );
    }

    return result;
  }, [requests, props.filters, globalFilter, eventId]);

  useEffect(() => {
    setSkip(0);
  }, [filteredRequests.length, take]);

  const sortedRequests = useMemo(
    () => orderBy(filteredRequests, sort),
    [filteredRequests, sort]
  );

  const total = sortedRequests.length;
  const pageData = useMemo(
    () => sortedRequests.slice(skip, skip + take),
    [sortedRequests, skip, take]
  );

  const handlePageChange = (e: GridPageChangeEvent) => {
    setSkip(e.page.skip);
    setTake(e.page.take);
  };

  const selectedPayments = props.selectedPayments ?? [];

  const isSelected = useCallback(
    (item: any) =>
      selectedPayments.some((p) => p.paymentNumber === item.paymentNumber),
    [selectedPayments]
  );

  const handleCheckboxChange = (item: any, checked: boolean) => {
    if (!props.setSelectedPayments) return;

    if (checked) {
      props.setSelectedPayments([...selectedPayments, item]);
    } else {
      props.setSelectedPayments(
        selectedPayments.filter((p) => p.paymentNumber !== item.paymentNumber)
      );
    }
  };

  const toggleSelectAllVisible = (checked: boolean) => {
    if (!props.setSelectedPayments) return;

    if (checked) {
      const merged = [...selectedPayments];
      pageData.forEach((item) => {
        if (!merged.some((p) => p.paymentNumber === item.paymentNumber)) {
          merged.push(item);
        }
      });
      props.setSelectedPayments(merged);
    } else {
      props.setSelectedPayments(
        selectedPayments.filter(
          (p) => !pageData.some((x) => x.paymentNumber === p.paymentNumber)
        )
      );
    }
  };

  const allVisibleSelected =
    pageData.length > 0 && pageData.every((item) => isSelected(item));
  const someVisibleSelected =
    pageData.some((item) => isSelected(item)) && !allVisibleSelected;

  const stableColumns = useMemo(() => props.columns, [props.columns]);

  const columns = useMemo(() => {
    const baseColumns: InvoiceGridColumnProps[] = [
      {
        field: 'invoiceNumber',
        title: 'Event ID',
        width: 140,
        cell: (cellProps: any) => {
          const value = cellProps.dataItem.invoiceNumber;

          if (isEventDetailsPage) {
            return (
              <td
                {...cellProps.tdProps}
                style={{ color: theme.palette.text.primary }}
              >
                {value}
              </td>
            );
          }

          return (
            <td {...cellProps.tdProps}>
              <a
                href={`/Events/${value}/EventDetails`}
                style={{
                  textDecoration: 'underline',
                  fontWeight: 500,
                }}
              >
                {value}
              </a>
            </td>
          );
        },
      },
      { field: 'payer', title: 'Payer Contact Name' },
      {
        field: 'createdUtcDateTime',
        title: 'Created On',
        cell: (cellProps: any) => {
          const val = cellProps.dataItem.createdUtcDateTime
            ? format(new Date(cellProps.dataItem.createdUtcDateTime), 'P')
            : '-';
          return <td {...cellProps.tdProps}>{val}</td>;
        },
      },
      {
        field: 'paymentLinkStatus',
        title: 'Status',
        cell: (cellProps: any) => {
          const raw = cellProps.dataItem.paymentLinkStatus || 'Not Paid';
          const normalized = String(raw);

          const statusColors: Record<string, string> = {
            Paid: '#34AA44',
            Late: '#E6492D',
            Initialized: '#9EA0A5',
            'Not Paid': '#9EA0A5',
          };
          const color =
            statusColors[normalized] ||
            statusColors[
              normalized.charAt(0).toUpperCase() + normalized.slice(1)
            ] ||
            statusColors['Not Paid'];

          return (
            <td {...cellProps.tdProps}>
              <span
                style={{
                  backgroundColor: color,
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  borderRadius: '9999px',
                  padding: '4px 10px',
                  display: 'inline-block',
                  minWidth: '80px',
                  textAlign: 'center',
                  lineHeight: 1.5,
                }}
              >
                {normalized}
              </span>
            </td>
          );
        },
      },
      {
        field: 'expirationDate',
        title: 'Expires On',
        cell: (cellProps: any) => {
          const val = cellProps.dataItem.expirationDate
            ? format(new Date(cellProps.dataItem.expirationDate), 'P')
            : '-';
          return <td {...cellProps.tdProps}>{val}</td>;
        },
      },
      {
        field: 'amountToCharge',
        title: 'Amount Requested',
        cell: (cellProps: any) => {
          const val =
            cellProps.dataItem.amountToCharge != null
              ? `$${cellProps.dataItem.amountToCharge.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`
              : '-';
          return <td {...cellProps.tdProps}>{val}</td>;
        },
      },
      {
        field: 'isMailSent',
        title: 'Email Sent',
        cell: (cellProps: any) => {
          const value = cellProps.dataItem.isMailSent;
          return (
            <td
              {...cellProps.tdProps}
              style={{ textAlign: 'center', verticalAlign: 'middle' }}
            >
              {value ? (
                <CheckCircle style={{ color: '#34AA44', fontSize: 20 }} />
              ) : (
                <Cancel style={{ color: '#E6492D', fontSize: 20 }} />
              )}
            </td>
          );
        },
      },
      { field: 'surchargePercent', title: 'Surcharge' },
      {
        field: 'showTip',
        title: 'Show Tip',
        cell: (cellProps: any) => {
          const value = cellProps.dataItem.showTip;
          return (
            <td
              {...cellProps.tdProps}
              style={{ textAlign: 'center', verticalAlign: 'middle' }}
            >
              {value ? (
                <CheckCircle style={{ color: '#34AA44', fontSize: 20 }} />
              ) : (
                <Cancel style={{ color: '#E6492D', fontSize: 20 }} />
              )}
            </td>
          );
        },
      },
      { field: 'paymentLinkType', title: 'Request Type' },
    ];

    if (stableColumns?.length) {
      const ordered: InvoiceGridColumnProps[] = [];
      stableColumns.forEach((fieldName: any) => {
        const col = baseColumns.find((c) => c.field === fieldName);
        if (col) ordered.push(col);
      });
      return ordered;
    }

    return baseColumns;
  }, [stableColumns, isEventDetailsPage, theme.palette.text.primary]);

  return (
    <Paper className={classes.gridContainer}>
      <Grid
        style={{ height: props.height }}
        sortable
        sort={sort}
        className={`${classes.gridRoot} ${GRID_SCROLLBAR_CLASS}`}
        onSortChange={(e) => setSort(e.sort)}
        data={pageData}
        total={total}
        skip={skip}
        take={take}
        onPageChange={handlePageChange}
        pageable={{ buttonCount: 5, pageSizes: [10, 25, 50, 100] }}
        rowRender={(row, rowProps) => {
          const status = rowProps.dataItem.paymentLinkStatus?.toLowerCase();
          const isError = status === 'failed' || status === 'rejected';

          const newRow = React.cloneElement(row, {
            style: {
              ...row.props.style,
              backgroundColor: isError
                ? theme.palette.mode === 'dark'
                  ? 'rgba(230, 73, 45, 0.18)'
                  : '#f0c7c7'
                : row.props.style?.backgroundColor,
              color: theme.palette.text.primary,
            },
          });

          return isError ? (
            <Tooltip
              title={status === 'failed' ? 'Payment Failed' : 'Payment Rejected'}
            >
              {newRow}
            </Tooltip>
          ) : (
            newRow
          );
        }}
      >
        {props?.isFromDashboard && (
          <GridToolbar className={classes.tableTitle}>
            <Box className={classes.headerWrapper}>
              <Box className={classes.centerTitle}>
                <h2 style={{ color: theme.palette.primary.main, margin: '0px' }}>
                  Payment Requests
                </h2>
              </Box>
            </Box>
          </GridToolbar>
        )}

        {props?.toolsMode && (
          <GridColumn
            key="__select__"
            field="__select__"
            title=""
            width={80}
            cell={(cellProps: any) => {
              const item = cellProps.dataItem;
              const checked = isSelected(item);

              return (
                <td {...cellProps.tdProps} style={{ textAlign: 'center' }}>
                  <Checkbox
                    size="small"
                    checked={checked}
                    onChange={(e) =>
                      handleCheckboxChange(item, e.target.checked)
                    }
                  />
                </td>
              );
            }}
            headerCell={() => (
              <th style={{ textAlign: 'center' }}>
                <Checkbox
                  size="small"
                  checked={allVisibleSelected}
                  indeterminate={someVisibleSelected}
                  onChange={(e) => toggleSelectAllVisible(e.target.checked)}
                />
              </th>
            )}
          />
        )}

        {columns.map((col) => (
          <GridColumn
            key={col.field}
            field={col.field}
            title={col.title}
            cell={col.cell}
            width={col.width}
          />
        ))}
      </Grid>
    </Paper>
  );
};

export default PaymentRequestsTable;
