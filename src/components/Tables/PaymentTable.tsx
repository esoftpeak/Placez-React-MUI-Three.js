import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  IconButton,
  Popover,
  Theme,
  useTheme,
  FormControlLabel,
  Checkbox,
  Typography,
  Select,
  MenuItem,
} from '@mui/material';
import {
  FirstPage as FirstPageIcon,
  LastPage as LastPageIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  FilterAlt,
} from '@mui/icons-material';
import { Tooltip } from '@progress/kendo-react-tooltip';
import { createStyles, makeStyles } from '@mui/styles';

import { clientRoutes } from '../../routes';

// Components
import {
  Grid,
  GridColumn,
  GridCellProps,
  GridColumnProps,
  GridToolbar,
  GridPageChangeEvent,
} from '@progress/kendo-react-grid';
import { orderBy, SortDescriptor } from '@progress/kendo-data-query';
import { Paper } from '@mui/material';
import { tableStyles } from './tableSyles.css';
import ArrowNavigateCell from './Cells/ArrowNavigateCell';
import { useDispatch, useSelector } from 'react-redux';
import { SelectClient } from '../../reducers/client';
import { ReduxState } from '../../reducers';
import StatusFilterCell from './Cells/StatusFilterCell';
import PaymentStatus from '../../api/placez/selects/PaymentStatus';
import HPayPayment from '../../api/payments/models/Payment';
import paymentStatuses from '../../api/placez/selects/PaymentStatus';
import { formatNumber } from '../../utils/formatNumber';
import { format } from 'date-fns';
import { useParams } from 'react-router';

// Types
import { FilterOptions } from '../Modals/PaymentFilterModal';
import { placezApi } from '../../api';

interface Props {
  height?: string;
  hideHeaders?: boolean;
  columns?: (keyof HPayPayment)[];
  filteredPayments?: HPayPayment[];
  filters?: FilterOptions;
  isFromDashboard?: boolean;
  size?: 'small' | 'medium';
  selectedOption?: string | number;
  toolsMode?: boolean;
  selectedPayments?: any[];
  setSelectedPayments?: (data: any[]) => void;
  onPaymentsChange?: (data: HPayPayment[]) => void;
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

const styles = makeStyles<Theme>((theme: Theme) =>
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
      backgroundColor: `${theme.palette.background.paper} !important`,
      color: `${theme.palette.text.primary} !important`,
    },
    centerTitle: {
      position: 'absolute',
      left: '50%',
      transform: 'translateX(-50%)',
      color: theme.palette.primary.main,
      margin: '0px',
    },
    popoverContent: {
      padding: theme.spacing(2),
      minWidth: '200px',
    },
    checkboxItem: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: theme.spacing(1),
    },
    gridRoot: (props: Props) => {
      return {
        ...theme.PlacezBorderStyles,
        fontFamily: theme.typography.fontFamily,
        backgroundColor: `${theme.palette.background.paper} !important`,
        color: `${theme.palette.text.primary} !important`,
        padding: props?.isFromDashboard ? '18px' : '32px',
        paddingTop: props?.isFromDashboard ? '0px' : '32px',
        overflow: 'hidden',
        '& .k-master-row': {
          backgroundColor: `${theme.palette.background.paper}`,
          color: `${theme.palette.text.primary}`,
        },
        '& .k-master-row:hover': {
          backgroundColor: `${theme.palette.action.hover} !important`,
          color: `${theme.palette.text.primary} !important`,
        },
        '& .k-grid-header': {
          backgroundColor: `${theme.palette.background.paper} !important`,
          borderRadius: `${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0px 0px`,
          color: theme.palette.text.primary,
          borderBottom: 'none',
          borderRight: 'none !important',
        },
        '& .k-grid-header :hover': {
          color: `${theme.palette.text.primary} !important`,
        },
        '& .k-grid-header .k-sorted': {
          color: `${theme.palette.primary.main} !important`,
        },
        '& .k-grid-header .k-i-sort-asc-sm': {
          color: `${theme.palette.secondary.main} !important`,
        },
        '& .k-grid-header-wrap': {
          border: 'none !important',
        },
        '& .k-table-thead': {
          backgroundColor: 'transparent !important',
          border: 'none !important',
          padding: '0px !important',
        },
        '& .k-link': {
          paddingRight: '0px !important',
        },
        '& tr:hover': {
          cursor: 'pointer',
        },
        '& .k-grid-norecords': {
          width: '100% !important',
        },
        '& .k-grid-norecords-template': {
          border: 'none !important',
          backgroundColor: 'transparent !important',
        },
        '& td': {
          paddingTop: 4,
          paddingBottom: 4,
          borderWidth: '1px 0 !important',
          borderColor: '#DDDBDA !important',
          height: '56px',
          whiteSpace: 'nowrap',
        },
        '& td:last-child': {
          paddingRight: '10px',
          marginRight: '10px',
        },
        '& th': {
          paddingTop: 4,
          paddingBottom: 30,
        },
        '& .k-grid-toolbar': {
          padding: '0px',
          display: 'flex',
          justifyContent: 'end',
          backgroundColor: `${theme.palette.background.paper} !important`,
          color: `${theme.palette.text.primary} !important`,
          border: 'none !important',
        },
        '& .k-grid-content': {
          backgroundColor: `${theme.palette.background.paper} !important`,
          color: theme.palette.text.primary,
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
      };
    },
  })
);

type InvoiceGridColumnProps = Omit<GridColumnProps, 'field'> & {
  field: keyof HPayPayment | '__checkbox__';
  minShow?: number;
  hidden?: boolean;
};

const ViewContactByArrowCell = (props: GridCellProps) => {
  const { id } = props.dataItem;
  return (
    <ArrowNavigateCell
      {...props}
      path={clientRoutes.edit.path.replace(':id', id)}
    />
  );
};

const StatusCell = (props: GridCellProps) => {
  const status = props.dataItem.state;
  return (
    <>
      {status !== undefined && status !== null ? (
        <td>
          <div
            style={{
              padding: '0px 6px',
              backgroundColor: paymentStatuses?.[PaymentStatus?.[status]]?.color,
              borderRadius: '14px',
              width: '112px',
              height: '24px',
              fontSize: '12px',
              color: 'white',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              textTransform: 'uppercase',
            }}
          >
            {status}
          </div>
        </td>
      ) : (
        <td></td>
      )}
    </>
  );
};

const renderCellWithTitle = (props: any) => {
  const fieldValue = props?.dataItem?.[props?.field] || '';
  return (
    <td {...props.tdProps} title={fieldValue}>
      {fieldValue}
    </td>
  );
};

const PaymentsTable = (props: Props) => {
  useScrollbarStyles();

  let grid;
  const classes = styles(props);
  const theme = useTheme();
  const [recentPayments, setRecentPayments] = useState<HPayPayment[]>([]);
  const selectedPayments = props.selectedPayments;
  const setSelectedPayments = props.setSelectedPayments;
  const unfilteredPayments = props?.isFromDashboard
    ? props?.filteredPayments
    : useSelector((state: ReduxState) => state.payment.payments);

  const params = useParams();
  const eventId = params.id;

  useEffect(() => {
    const fetchRecentPayments = async () => {
      if (props.filters?.dateRangeOperator === 'updatedRecently') {
        const result = await placezApi.getRecentPayments();
        setRecentPayments(result.parsedBody);
      }
    };

    fetchRecentPayments();
  }, [props.filters?.dateRangeOperator]);

  useEffect(() => {
    if (props.toolsMode === false) {
      setSelectedPayments([] as any);
    }
  }, [props.toolsMode, setSelectedPayments]);

  const globalFilter = useSelector(
    (state: ReduxState) => state.settings.globalFilter
  );

  const CheckboxCell = (props: GridCellProps) => {
    const payment = props.dataItem as HPayPayment;
    const checked = selectedPayments?.some((p) => p.id === payment.id) ?? false;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!setSelectedPayments || !selectedPayments) return;

      let updated: HPayPayment[];
      if (e.target.checked) {
        const alreadySelected = selectedPayments.some(
          (p) => p.id === payment.id
        );
        updated = alreadySelected
          ? selectedPayments
          : [...selectedPayments, payment];
      } else {
        updated = selectedPayments.filter((p) => p.id !== payment.id);
      }

      setSelectedPayments(updated);
    };

    return (
      <td style={{ textAlign: 'center' }}>
        <Checkbox
          size="small"
          checked={checked}
          onChange={handleChange}
          color="primary"
        />
      </td>
    );
  };

  const payments = useMemo(() => {
    if (!unfilteredPayments) return [];

    let result = unfilteredPayments;

    if (props.filters) {
      result = result.filter((payment) => {
        if (
          props.filters.eventId &&
          Number(payment.sceneId) !== Number(props.filters.eventId)
        ) {
          return false;
        }

        const paymentDate = payment.eventStartDate
          ? new Date(payment.eventStartDate)
          : new Date();
        if (isNaN(paymentDate.getTime())) return false;

        if (props.filters?.dateRangeOperator === 'updatedRecently') {
          const recentPaymentIds = recentPayments.map((p) => p.paymentId);
          return payment.paymentId in recentPaymentIds;
        } else if (
          props.filters?.dateRangeOperator === 'gte' &&
          props.filters.dateRangeStart
        ) {
          return paymentDate >= props.filters.dateRangeStart!;
        } else if (
          props.filters?.dateRangeOperator === 'lte' &&
          props.filters.dateRangeStart
        ) {
          return paymentDate <= props.filters.dateRangeEnd!;
        } else {
          const start = props.filters.dateRangeStart || new Date(0);
          const end = props.filters.dateRangeEnd || new Date(9999, 11, 31);
          return paymentDate >= start && paymentDate <= end;
        }
      });
    }

    if (props.filteredPayments && eventId) {
      return result.filter((payment) => String(payment.sceneId) === eventId);
    }

    if (props.filteredPayments) {
      return result;
    }

    if (globalFilter && globalFilter.trim() !== '') {
      const filterText = globalFilter.toLowerCase();

      result = result.filter((payment) => {
        return (
          payment.paymentId?.toLowerCase().includes(filterText) ||
          payment.eventName?.toLowerCase().includes(filterText) ||
          payment.ccStatus?.toLowerCase().includes(filterText) ||
          payment.payor?.toLowerCase().includes(filterText) ||
          payment.email?.toLowerCase().includes(filterText)
        );
      });
    }

    return result;
  }, [
    unfilteredPayments,
    props.filteredPayments,
    eventId,
    props.filters,
    globalFilter,
    recentPayments,
  ]);

  useEffect(() => {
    if (props.onPaymentsChange) {
      props.onPaymentsChange(payments);
    }
  }, [payments, props.onPaymentsChange]);

  const stableColumns = useMemo(
    () => props.columns,
    [JSON.stringify(props.columns)]
  );

  const columns = useMemo(() => {
    const baseColumns: InvoiceGridColumnProps[] = [
      {
        field: 'ccTransactionId',
        title: 'Transaction ID',
        className: classes.overflowEllipsis,
        cell: renderCellWithTitle,
      },
      {
        field: 'sceneId',
        title: 'Event ID',
        className: classes.overflowEllipsis,
        cell: renderCellWithTitle,
      },
      {
        field: 'eventName',
        title: 'Event Name',
        className: classes.overflowEllipsis,
        cell: renderCellWithTitle,
      },
      {
        field: 'eventStartDate',
        title: 'Event Date',
        className: classes.overflowEllipsis,
        hidden: props?.isFromDashboard,
        cell: (props: any) => {
          const { eventStartDate } = props.dataItem;
          const date = eventStartDate ? format(new Date(eventStartDate), 'P') : '-';
          return (
            <td {...props.tdProps} title={date}>
              {date}
            </td>
          );
        },
      },
      {
        field: 'totalPaid',
        title: 'Total Paid',
        className: classes.overflowEllipsis,
        cell: (props: any) => {
          const totalPaid = formatNumber(props.dataItem.totalPaid);
          return (
            <td {...props.tdProps} title={totalPaid}>
              {totalPaid}
            </td>
          );
        },
      },
      {
        field: 'totalSurcharge',
        title: 'Surcharge',
        className: classes.overflowEllipsis,
        filterCell: StatusFilterCell,
        cell: renderCellWithTitle,
      },
      {
        field: 'dueDate',
        title: 'Due Date',
        className: classes.overflowEllipsis,
        hidden: props?.isFromDashboard,
        cell: (props: any) => {
          const { dueDate } = props.dataItem;
          const date = dueDate ? format(new Date(dueDate), 'P') : '-';
          return (
            <td {...props.tdProps} title={date}>
              {date}
            </td>
          );
        },
      },
      {
        field: 'dateApplied',
        title: 'Date Paid',
        className: classes.overflowEllipsis,
        hidden: props?.isFromDashboard,
        cell: (props: any) => {
          const { dateApplied } = props.dataItem;
          const date = dateApplied ? format(new Date(dateApplied), 'P') : '-';
          return (
            <td {...props.tdProps} title={date}>
              {date}
            </td>
          );
        },
      },
      {
        field: 'paymentMethod',
        title: 'Pay Method',
        className: classes.overflowEllipsis,
        filterCell: StatusFilterCell,
        cell: renderCellWithTitle,
      },
      {
        field: 'accountLastFour',
        title: 'Account Last Four',
        className: classes.overflowEllipsis,
        filterCell: StatusFilterCell,
        cell: renderCellWithTitle,
      },
      {
        field: 'cardIssuer',
        title: 'Bank Name',
        className: classes.overflowEllipsis,
        filterCell: StatusFilterCell,
        cell: renderCellWithTitle,
      },
      {
        field: 'totalOwed',
        title: 'Event Total',
        className: classes.overflowEllipsis,
        cell: (props: any) => {
          const totalOwed = formatNumber(props.dataItem.totalOwed);
          return (
            <td {...props.tdProps} title={totalOwed}>
              {totalOwed}
            </td>
          );
        },
      },
    ];

    if (props.selectedOption === 1) {
      baseColumns.push(
        {
          field: 'payor',
          title: 'Payor',
          className: classes.overflowEllipsis,
          cell: renderCellWithTitle,
        },
        {
          field: 'email',
          title: 'Email',
          className: classes.overflowEllipsis,
          cell: renderCellWithTitle,
        }
      );
    }

    if (props.columns?.length) {
      const orderedColumns: InvoiceGridColumnProps[] = [];

      props.columns.forEach((fieldName: any) => {
        const column = baseColumns.find((col) => col.field === fieldName);
        if (column) orderedColumns.push(column);
      });

      if (props.toolsMode) {
        return [
          {
            field: '__checkbox__' as any,
            title: '',
            width: 50,
            cell: CheckboxCell,
            hidden: false,
            minShow: 0,
          },
          ...orderedColumns,
        ];
      }

      return orderedColumns;
    }

    if (props.toolsMode) {
      return [
        {
          field: '__checkbox__' as any,
          title: '',
          width: 50,
          cell: CheckboxCell,
        },
        ...baseColumns,
      ];
    }

    return baseColumns;
  }, [
    classes.overflowEllipsis,
    props.selectedOption,
    props?.isFromDashboard,
    stableColumns,
    props.columns,
    props.toolsMode,
  ]);

  const setLocalItem = (item: any) => {
    localStorage.setItem('paymentTableHeadSort', JSON.stringify(item));
  };
  const getLocalItem = () => {
    const item = localStorage.getItem('paymentTableHeadSort');
    if (item) return JSON.parse(item);
    return null;
  };
  const removeLocalItem = () => {
    localStorage.removeItem('paymentTableHeadSort');
  };

  const [sort, setSort] = useState<SortDescriptor[]>(
    getLocalItem() || [{ field: 'lastModifiedDate', dir: 'desc' }]
  );

  const [visibleColumns, setVisibleColumns] = useState<any[]>(() => {
    return columns.map((column) => ({
      ...column,
      hidden: column.hidden || false,
    }));
  });

  useEffect(() => {
    const updatedVisibleColumns = columns.map((column) => ({
      ...column,
      hidden: column.hidden || false,
    }));
    if (
      JSON.stringify(visibleColumns) !== JSON.stringify(updatedVisibleColumns)
    ) {
      setVisibleColumns(updatedVisibleColumns);
    }
  }, [columns]);

  const dispatch = useDispatch();
  const gridElementRef = useRef<any>();
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

  useEffect(() => {
    const checkColumnMaxWidth = () => {
      const currentVisibleColumns = columns
        .map((column) => {
          const existingColumn = visibleColumns.find(
            (vc) => vc.field === column.field
          );
          return {
            ...column,
            hidden: existingColumn
              ? existingColumn.hidden
              : column.hidden || false,
          };
        })
        .filter(
          (item) =>
            !item.minShow ||
            item.minShow <= (gridElementRef?.current as any)?.offsetWidth
        );

      if (
        currentVisibleColumns.length !== visibleColumns.length ||
        JSON.stringify(currentVisibleColumns) !==
          JSON.stringify(visibleColumns)
      ) {
        setVisibleColumns(currentVisibleColumns);
      }
    };

    const resizeObserver = new ResizeObserver(checkColumnMaxWidth);

    if (gridElementRef.current) {
      resizeObserver.observe(gridElementRef.current);
    }
    return () => {
      resizeObserver.disconnect();
    };
  }, [visibleColumns, columns]);

  const handleFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleColumnVisibilityChange = (
    columnField: string,
    checked: boolean
  ) => {
    setVisibleColumns((prevColumns) =>
      prevColumns.map((column) =>
        column.field === columnField
          ? { ...column, hidden: !checked }
          : column
      )
    );
  };

  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);
  const pageSizeOptions = [10, 25, 50, 100];

  const sortedPayments = useMemo(
    () => orderBy(payments, sort),
    [payments, sort]
  );

  const total = sortedPayments.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages || 1);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedPayments = sortedPayments.slice(startIndex, endIndex);

  useEffect(() => {
    setPage(1);
  }, [payments.length, pageSize]);

  const handlePageChange = (e: GridPageChangeEvent) => {
    const newTake = e.page.take;
    const newSkip = e.page.skip;
    setPageSize(newTake);
    setPage(Math.floor(newSkip / newTake) + 1);
  };

  const width = props.size === 'small' ? '60vw' : '100%';

  return (
    <Paper className={classes.gridContainer} style={{ width }}>
      <div ref={gridElementRef}>
        <Tooltip openDelay={100} position="right" anchorElement="target">
          <Grid
            style={{ height: props.height, border: '2px solid #8b49a1ff' }}
            sortable
            sort={sort}
            onSortChange={(e) => {
              if (!e.sort || e.sort.length === 0) {
                removeLocalItem();
              } else {
                setLocalItem(e.sort);
              }
              setSort(e.sort);
            }}
            className={`${classes.gridRoot} ${GRID_SCROLLBAR_CLASS}`}
            selectedField="selected"
            data={paginatedPayments}
            onRowClick={(e) => {
              dispatch(SelectClient(e.dataItem.id));
            }}
            total={total}
            skip={(safePage - 1) * pageSize}
            take={pageSize}
            onPageChange={handlePageChange}
            pageable={{ buttonCount: 5, pageSizes: pageSizeOptions }}
            size={props?.size}
            scrollable={'scrollable'}
            reorderable={false}
          >
            {props?.isFromDashboard && (
              <GridToolbar className={classes.tableTitle}>
                <Box className={classes.headerWrapper}>
                  <Box className={classes.centerTitle}>
                    <h2
                      style={{
                        color:
                          theme.palette.mode === 'dark'
                            ? theme.palette.text.primary
                            : theme.palette.primary.main,
                        margin: '0px',
                      }}
                    >
                      Payments
                    </h2>
                  </Box>

                  <Box style={{ marginLeft: 'auto' }}>
                    <IconButton
                      onClick={handleFilterClick}
                      style={{
                        border: '2px solid #cb82e3ff',
                        borderRadius: '6px',
                        padding: '0px',
                      }}
                    >
                      <FilterAlt color="primary" style={{ color: 'gray' }} />
                    </IconButton>
                    <Popover
                      open={!!anchorEl}
                      anchorEl={anchorEl}
                      onClose={handleClose}
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                      }}
                    >
                      <Box className={classes.popoverContent}>
                        <span
                          style={{
                            color: theme.palette.primary.main,
                            fontWeight: 'bold',
                            margin: '0px',
                          }}
                        >
                          Show/Hide Columns
                        </span>
                        {visibleColumns.map((column) => (
                          <Box
                            key={column.field}
                            className={classes.checkboxItem}
                          >
                            <FormControlLabel
                              control={
                                <Checkbox
                                  style={{ marginRight: '10px' }}
                                  checked={!column.hidden}
                                  onChange={(e) =>
                                    handleColumnVisibilityChange(
                                      column.field,
                                      e.target.checked
                                    )
                                  }
                                  size="small"
                                />
                              }
                              label={column.title}
                            />
                          </Box>
                        ))}
                      </Box>
                    </Popover>
                  </Box>
                </Box>
              </GridToolbar>
            )}

            {visibleColumns.map((column, index) => {
              return (
                <GridColumn
                  field={column.field}
                  title={column.title}
                  cell={column.cell}
                  key={index}
                  className={column.className}
                  width={column.width}
                  hidden={column?.hidden}
                />
              );
            })}
          </Grid>
        </Tooltip>
      </div>
    </Paper>
  );
};

export default PaymentsTable;
