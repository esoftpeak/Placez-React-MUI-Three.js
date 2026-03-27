import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { Tooltip, Paper, Box, Skeleton } from '@mui/material';
import { Theme } from '@mui/material/styles';
import { createStyles, makeStyles } from '@mui/styles';

import { Client } from '../../api';
import {
  Grid,
  GridColumn,
  GridCellProps,
  GridNoRecords,
  GridPageChangeEvent,
} from '@progress/kendo-react-grid';
import { SortDescriptor, orderBy } from '@progress/kendo-data-query';
import { Tooltip as KendoTooltip } from '@progress/kendo-react-tooltip';

import { useDispatch, useSelector } from 'react-redux';
import { SelectClient } from '../../reducers/client';
import { ReduxState } from '../../reducers';
import { GenericGridCell } from './SceneTable';

import { ModalConsumer } from '../Modals/ModalContext';
import PlacezActionButton from '../PlacezUIComponents/PlacezActionButton';
import ClientModal from '../Modals/ClientModal';
import AddressCell from './Cells/AddressCell';

import { tableStyles } from './tableSyles.css';

interface Props {
  clients: Client[];
  height?: string;
  isLoading?: boolean;
}

export const GRID_SCROLLBAR_CLASS = 'clientGridScrollbar';

export const useStyles = makeStyles((theme: Theme) =>
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
        height: '40px !important',
      },

      [`.${GRID_SCROLLBAR_CLASS} .k-grid-pager,
        .${GRID_SCROLLBAR_CLASS} .k-pager-wrap,
        .${GRID_SCROLLBAR_CLASS} .k-pager`]: {
        backgroundColor: `${theme.palette.background.paper} !important`,
        color: `${theme.palette.text.primary} !important`,
        borderTop: `1px solid ${theme.palette.divider} !important`,
      },

      [`.${GRID_SCROLLBAR_CLASS} .k-pager-info,
        .${GRID_SCROLLBAR_CLASS} .k-pager-sizes,
        .${GRID_SCROLLBAR_CLASS} .k-pager-sizes .k-label`]: {
        color: `${theme.palette.text.secondary} !important`,
      },

      [`.${GRID_SCROLLBAR_CLASS} .k-pager-numbers .k-link`]: {
        color: `${theme.palette.text.primary} !important`,
        backgroundColor: 'transparent !important',
      },

      [`.${GRID_SCROLLBAR_CLASS} .k-pager-numbers .k-link:hover`]: {
        backgroundColor: `${theme.palette.action.hover} !important`,
      },

      [`.${GRID_SCROLLBAR_CLASS} .k-pager-numbers .k-link.k-selected,
        .${GRID_SCROLLBAR_CLASS} .k-pager-numbers .k-selected .k-link`]: {
        backgroundColor: `${theme.palette.action.selected} !important`,
        color: `${theme.palette.text.primary} !important`,
        borderColor: `${theme.palette.divider} !important`,
      },

      [`.${GRID_SCROLLBAR_CLASS} .k-pager-nav .k-button,
        .${GRID_SCROLLBAR_CLASS} .k-pager-wrap .k-button`]: {
        color: `${theme.palette.text.primary} !important`,
        backgroundColor: 'transparent !important',
        borderColor: `${theme.palette.divider} !important`,
      },

      [`.${GRID_SCROLLBAR_CLASS} .k-pager-nav .k-button:hover,
        .${GRID_SCROLLBAR_CLASS} .k-pager-wrap .k-button:hover`]: {
        backgroundColor: `${theme.palette.action.hover} !important`,
      },

      [`.${GRID_SCROLLBAR_CLASS} .k-pager-sizes .k-dropdownlist,
        .${GRID_SCROLLBAR_CLASS} .k-pager-sizes .k-dropdownlist .k-input,
        .${GRID_SCROLLBAR_CLASS} .k-pager-sizes .k-dropdownlist .k-input-inner`]:
        {
          backgroundColor: `${theme.palette.background.paper} !important`,
          color: `${theme.palette.text.primary} !important`,
          borderColor: `${theme.palette.divider} !important`,
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

const LoadingSkeleton = ({
  classes,
  height,
}: {
  classes: any;
  height?: string;
}) => {
  const rows = Array.from({ length: 8 }, (_, index) => index);

  return (
    <Paper>
      <Box
        className={classes.loadingContainer}
        style={{ height: height || '400px' }}
      >
        <Box className={classes.loadingRow} sx={{ backgroundColor: 'grey.50' }}>
          <Box className={classes.loadingCell}>
            <Skeleton variant="text" width="60%" height={24} />
          </Box>
          <Box className={classes.loadingCell}>
            <Skeleton variant="text" width="80%" height={24} />
          </Box>
          <Box className={classes.loadingCell}>
            <Skeleton variant="text" width="70%" height={24} />
          </Box>
          <Box className={classes.loadingCell}>
            <Skeleton variant="text" width="90%" height={24} />
          </Box>
          <Box className={classes.loadingCell}>
            <Skeleton variant="text" width="85%" height={24} />
          </Box>
        </Box>

        {rows.map((row) => (
          <Box key={row} className={classes.loadingRow}>
            <Box className={classes.loadingCell}>
              <Skeleton
                variant="text"
                width={`${60 + Math.random() * 40}%`}
                height={20}
              />
            </Box>
            <Box className={classes.loadingCell}>
              <Skeleton
                variant="text"
                width={`${50 + Math.random() * 30}%`}
                height={20}
              />
            </Box>
            <Box className={classes.loadingCell}>
              <Skeleton
                variant="text"
                width={`${70 + Math.random() * 25}%`}
                height={20}
              />
            </Box>
            <Box className={classes.loadingCell}>
              <Skeleton
                variant="text"
                width={`${80 + Math.random() * 20}%`}
                height={20}
              />
            </Box>
            <Box className={classes.loadingCell}>
              <Skeleton
                variant="text"
                width={`${75 + Math.random() * 25}%`}
                height={20}
              />
            </Box>
          </Box>
        ))}
      </Box>
    </Paper>
  );
};

type Column = {
  field: string;
  title: string;
  className?: string;
  minShow?: number;
  width?: number;
  cell?: any;
  headerCell?: any;
};

const BoldHeaderCell = (props: any) => {
  const { title, ...rest } = props;
  return (
    <th
      {...rest.thProps}
      style={{
        ...(rest.thProps?.style || {}),
        fontWeight: 700,
      }}
    >
      {title}
    </th>
  );
};

const NameCell = (props: GridCellProps) => {
  const { dataItem, field } = props;
  const value = dataItem[field as string];

  if (value === undefined || value === null) return <td />;

  return (
    <td title={String(value)} style={{ fontWeight: 600 }}>
      {String(value)}
    </td>
  );
};

const ClientTable = (props: Props) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const selectedId = useSelector((state: ReduxState) => state.client.selectedId);

  const { clients, isLoading = false, height } = props;

  const columns: Column[] = useMemo(
    () => [
      {
        field: 'name',
        title: 'Name',
        className: classes.overflowEllipsis,
        cell: NameCell,
        headerCell: BoldHeaderCell,
      },
      {
        field: 'type',
        title: 'Client Type',
        className: classes.overflowEllipsis,
        minShow: 770,
        cell: GenericGridCell,
        headerCell: BoldHeaderCell,
      },
      {
        field: 'phone',
        title: 'Phone',
        className: classes.overflowEllipsis,
        cell: GenericGridCell,
        headerCell: BoldHeaderCell,
      },
      {
        field: 'email',
        title: 'Email',
        className: classes.overflowEllipsis,
        minShow: 440,
        cell: GenericGridCell,
        headerCell: BoldHeaderCell,
      },
      {
        field: 'address',
        title: 'Address',
        className: classes.overflowEllipsis,
        minShow: 440,
        cell: AddressCell,
        headerCell: BoldHeaderCell,
      },
    ],
    [classes.overflowEllipsis]
  );

  const [sort, setSort] = useState<SortDescriptor[]>([
    { field: 'lastModifiedDate', dir: 'desc' },
  ]);

  const [visibleColumns, setVisibleColumns] = useState<Column[]>(columns);

  // Paging
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);

  const gridElRef = useRef<HTMLElement | null>(null);

  const checkColumnMaxWidth = useCallback(() => {
    const gridEl = gridElRef.current;
    if (!gridEl) return;

    const currentVisibleColumns = columns.filter(
      (item) => !item.minShow || item.minShow <= gridEl.offsetWidth
    );

    setVisibleColumns((prev) =>
      prev.length === currentVisibleColumns.length ? prev : currentVisibleColumns
    );
  }, [columns]);

  useEffect(() => {
    // When columns definition changes, reset visible columns
    setVisibleColumns(columns);
  }, [columns]);

  useEffect(() => {
    gridElRef.current = document.querySelector(
      `.${CSS.escape(classes.gridRoot)}`
    ) as HTMLElement | null;

    const onResize = () => checkColumnMaxWidth();
    window.addEventListener('resize', onResize);

    checkColumnMaxWidth();

    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, [classes.gridRoot, checkColumnMaxWidth]);

  const ClientTableRow = (rowRenderProps: any) => {
    const { children, className, style, ...otherProps } = rowRenderProps.props;
    const dataItem = children?.[0]?.props?.dataItem;

    return (
      <ModalConsumer>
        {({ showModal, props: modalProps }) => (
          <tr
            className={className}
            style={style}
            {...otherProps}
            onClick={(e) => {
              e.stopPropagation();

              dispatch(SelectClient(dataItem.id));

              const selectedClient = clients.find((c) => c.id === dataItem.id);
              showModal(ClientModal, { ...modalProps, client: selectedClient });
            }}
          >
            {children}
          </tr>
        )}
      </ModalConsumer>
    );
  };

  const sortedClients = useMemo(() => {
    return orderBy(
      (clients || []).map((client) => ({
        ...client,
        selected: client.id === selectedId,
        lastModifiedDate: new Date(client.lastModifiedUtcDateTime).getTime(),
      })),
      sort
    );
  }, [clients, selectedId, sort]);

  const total = sortedClients.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);

  useEffect(() => {
    if (page !== safePage) setPage(safePage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPages, pageSize, total]);

  const skip = (safePage - 1) * pageSize;

  const paginatedClients = useMemo(() => {
    return sortedClients.slice(skip, skip + pageSize);
  }, [sortedClients, skip, pageSize]);

  const handlePageChange = (e: GridPageChangeEvent) => {
    const newTake = e.page.take;
    const newSkip = e.page.skip;

    const newPage = Math.floor(newSkip / newTake) + 1;

    if (newTake !== pageSize) setPageSize(newTake);
    if (newPage !== page) setPage(newPage);
  };

  if (isLoading) {
    return <LoadingSkeleton classes={classes} height={height} />;
  }

  return (
    <Paper>
      <KendoTooltip
        anchorElement="target"
        position="left"
        style={{ fontSize: '12px' }}
      >
        <Grid
          style={{ height }}
          sortable
          sort={sort}
          onSortChange={(e) => setSort(e.sort)}
          className={`${classes.gridRoot} ${GRID_SCROLLBAR_CLASS}`}
          selectedField="selected"
          data={paginatedClients}
          rowRender={ClientTableRow}
          pageable={{ buttonCount: 5, pageSizes: [10, 25, 50, 100] }}
          total={total}
          skip={skip}
          take={pageSize}
          onPageChange={handlePageChange}
        >
          <GridNoRecords>
            <ModalConsumer>
              {({ showModal, props: modalProps }) => (
                <Tooltip title="Add Client">
                  <PlacezActionButton
                    onClick={() => showModal(ClientModal, { ...modalProps })}
                  >
                    Create Client
                  </PlacezActionButton>
                </Tooltip>
              )}
            </ModalConsumer>
          </GridNoRecords>

          {visibleColumns.map((column, index) => (
            <GridColumn
              key={index}
              field={column.field}
              title={column.title}
              cell={column.cell}
              headerCell={column.headerCell}
              className={column.className}
              width={column.width}
            />
          ))}
        </Grid>
      </KendoTooltip>
    </Paper>
  );
};

export default ClientTable;
