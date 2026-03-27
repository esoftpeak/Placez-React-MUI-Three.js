import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, IconButton, Paper, Skeleton, Tooltip } from '@mui/material';
import { Theme, useTheme } from '@mui/material/styles';
import { CloudDownload } from '@mui/icons-material';
import { createStyles, makeStyles } from '@mui/styles';

import { Scene, sceneStatuses } from '../../api';
import { sceneRoutes } from '../../routes';
import { Tooltip as KendoTooltip } from '@progress/kendo-react-tooltip';

// Kendo Grid
import {
  Grid,
  GridColumn,
  GridCellProps,
  GridFilterChangeEvent,
  GridNoRecords,
  GridToolbar,
  GridPageChangeEvent,
} from '@progress/kendo-react-grid';
import {
  CompositeFilterDescriptor,
  filterBy,
  SortDescriptor,
} from '@progress/kendo-data-query';
import { ExcelExport } from '@progress/kendo-react-excel-export';
import { GridPDFExport } from '@progress/kendo-react-pdf';

import { ReduxState } from '../../reducers';
import { tableStyles } from './tableSyles.css';
import {
  LocalStorageKey,
  useLocalStorageSelector,
} from '../Hooks/useLocalStorageState';
import SceneStatus from '../../api/placez/selects/SceneStatus';
import { useNavigate } from 'react-router';
import DateRangeFilterCell from './Cells/DateRangeFilterCell';
import StatusFilterCell from './Cells/StatusFilterCell';
import { SelectScene } from '../../reducers/scenes';
import { format } from 'date-fns';
import { getClientById } from '../../reducers/client';
import PlacezActionButton from '../PlacezUIComponents/PlacezActionButton';
import SceneModal from '../Modals/SceneModal';
import { ModalConsumer } from '../Modals/ModalContext';
import { SetSceneFilters } from '../../reducers/settings';
import { DownloadPDFIcon } from '../../assets/icons';
import { customOrderBy } from '../../utils/customOrderBy';

const LoadingSkeleton = ({
  classes,
  height,
  hideClient = false,
  hideHeaders = false,
  isFromDashboard = false,
}: {
  classes: any;
  height?: string;
  hideClient?: boolean;
  hideHeaders?: boolean;
  isFromDashboard?: boolean;
}) => {
  const rows = Array.from({ length: 8 }, (_, index) => index);

  return (
    <Paper>
      <Box
        sx={{
          padding: isFromDashboard ? '18px' : '32px',
          paddingTop: isFromDashboard ? '0px' : '32px',
          height: height || '600px',
          overflow: 'hidden',
        }}
      >
        {!hideHeaders && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 2,
              padding: '8px 0',
            }}
          >
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Skeleton
                variant="rectangular"
                width={40}
                height={32}
                sx={{ borderRadius: 1 }}
              />
              <Skeleton
                variant="rectangular"
                width={40}
                height={32}
                sx={{ borderRadius: 1 }}
              />
            </Box>
            <Skeleton variant="text" width={120} height={28} />
          </Box>
        )}

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px 16px',
            borderBottom: '1px solid',
            borderColor: 'divider',
            backgroundColor: 'grey.50',
            borderRadius: '4px 4px 0 0',
          }}
        >
          <Box sx={{ flex: 1.2, marginRight: 2 }}>
            <Skeleton variant="text" width="70%" height={24} />
          </Box>
          <Box sx={{ flex: 1, marginRight: 2 }}>
            <Skeleton variant="text" width="60%" height={24} />
          </Box>
          {!hideClient && (
            <Box sx={{ flex: 1, marginRight: 2 }}>
              <Skeleton variant="text" width="65%" height={24} />
            </Box>
          )}
          <Box sx={{ flex: 0.8, marginRight: 2 }}>
            <Skeleton variant="text" width="80%" height={24} />
          </Box>
          <Box sx={{ flex: 1.5, marginRight: 2 }}>
            <Skeleton variant="text" width="85%" height={24} />
          </Box>
          <Box sx={{ flex: 1, marginRight: 2 }}>
            <Skeleton variant="text" width="60%" height={24} />
          </Box>
          <Box sx={{ flex: 1, marginRight: 2 }}>
            <Skeleton variant="text" width="70%" height={24} />
          </Box>
          <Box sx={{ width: 60, display: 'flex', justifyContent: 'center' }}>
            <Skeleton variant="circular" width={24} height={24} />
          </Box>
        </Box>

        {rows.map((row) => (
          <Box
            key={row}
            sx={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px 16px',
              borderBottom: '1px solid',
              borderColor: 'divider',
              minHeight: '56px',
              '&:last-child': { borderBottom: 'none' },
              '&:hover': { backgroundColor: 'action.hover' },
            }}
          >
            <Box sx={{ flex: 1.2, marginRight: 2 }}>
              <Skeleton
                variant="text"
                width={`${50 + Math.random() * 40}%`}
                height={20}
              />
            </Box>

            <Box sx={{ flex: 1, marginRight: 2 }}>
              <Skeleton
                variant="text"
                width={`${60 + Math.random() * 30}%`}
                height={20}
              />
            </Box>

            {!hideClient && (
              <Box sx={{ flex: 1, marginRight: 2 }}>
                <Skeleton
                  variant="text"
                  width={`${40 + Math.random() * 35}%`}
                  height={20}
                />
              </Box>
            )}

            <Box sx={{ flex: 0.8, marginRight: 2 }}>
              <Skeleton
                variant="text"
                width={`${30 + Math.random() * 25}%`}
                height={20}
              />
            </Box>

            <Box sx={{ flex: 1.5, marginRight: 2 }}>
              <Skeleton
                variant="text"
                width={`${70 + Math.random() * 25}%`}
                height={20}
              />
            </Box>

            <Box sx={{ flex: 1, marginRight: 2 }}>
              <Skeleton
                variant="rectangular"
                width={112}
                height={24}
                sx={{ borderRadius: '14px' }}
              />
            </Box>

            <Box sx={{ flex: 1, marginRight: 2 }}>
              <Skeleton
                variant="text"
                width={`${45 + Math.random() * 30}%`}
                height={20}
              />
            </Box>

            <Box sx={{ width: 60, display: 'flex', justifyContent: 'center' }}>
              <Skeleton variant="circular" width={24} height={24} />
            </Box>
          </Box>
        ))}
      </Box>
    </Paper>
  );
};

interface Props {
  scenes: Scene[];
  hideClient?: boolean;
  hideHeaders?: boolean;
  showFilters?: boolean;
  height?: string;
  isFromDashboard?: boolean;
  loading?: boolean;

  onPageChange?: (page: number, pageSize: number) => void;
}

type Column = {
  field: string;
  title: string;
  className?: string;
  filterable?: boolean;
  width?: number;
  cell?: any;
  minShow?: number;
  filterCell?: any;
};

const styles = makeStyles<Theme, Props>((theme: Theme) =>
  createStyles({
    ...tableStyles(theme),
    gridContainer: {
      overflowX: 'auto',
    },
    tableTitle: {
      display: 'flex',
      justifyContent: 'center !important',
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
        color: `${theme.palette.text.primary} !important`,
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
        borderColor: `${theme.palette.divider} !important`,
        height: '56px',
        whiteSpace: 'nowrap',
        color: `${theme.palette.text.primary} !important`,
        backgroundColor: 'inherit !important',
      },
      '& td:last-child': {
        paddingRight: '10px',
        marginRight: '10px',
      },
      '& th': {
        paddingTop: 4,
        paddingBottom: 30,
        color: `${theme.palette.text.primary} !important`,
      },
      '& .k-grid-toolbar': {
        padding: '0px',
        display: 'flex',
        justifyContent: 'center',
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
    }),
  })
);

const useKendoPagerPopupFix = makeStyles<Theme>((theme: Theme) =>
  createStyles({
    '@global':
      theme.palette.mode === 'dark'
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
        : {},
  })
);

export const GenericGridCell = (props: GridCellProps) => {
  const { dataItem, field } = props;
  const value = dataItem[field as string];

  if (value === undefined || value === null) return <td />;

  return <td title={String(value)}>{String(value)}</td>;
};

export const StartDateCell = (props: GridCellProps) => {
  const { dataItem } = props;
  const date = dataItem?.date ?? null;
  if (date === undefined || date === null) return <td />;

  const utcDate = new Date(date);
  return <td>{format(new Date(utcDate), 'MM/dd/yyyy')}</td>;
};

export const StartTimeCell = (props: GridCellProps) => {
  const { dataItem } = props;
  const time = dataItem?.time ?? null;
  if (time === undefined || time === null) return <td />;

  return <td>{time}</td>;
};

const StatusCell = (props: GridCellProps) => {
  const { dataItem } = props;
  const status = dataItem?.status;

  return status !== undefined && status !== null ? (
    <td title={status}>
      <div
        style={{
          padding: '0px 6px',
          backgroundColor: sceneStatuses?.[SceneStatus?.[status]]?.color,
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
    <td />
  );
};

const SceneTable = (props: Props) => {
  useKendoPagerPopupFix();

  const classes = styles(props);
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const globalFilter = useSelector(
    (state: ReduxState) => state.settings.globalFilter
  );

  const clients = useSelector((state: ReduxState) => state.client.clients);
  const places = useSelector((state: ReduxState) => state.place.places);

  const twentyFourHourTime = useLocalStorageSelector<boolean>(
    LocalStorageKey.TwentyFourHourTime
  );

  useEffect(() => {
    dispatch(SelectScene(null));
  }, [dispatch]);

  const gridElementRef = useRef<HTMLDivElement | null>(null);

  const hideHeaders = props.hideHeaders;

  const columns: Column[] = useMemo(() => {
    const base: Column[] = [
      {
        field: 'id',
        title: hideHeaders ? ' ' : 'ID',
        className: classes.overflowEllipsis,
        filterable: false,
        width: 140,
        minShow: 1100,
        cell: GenericGridCell,
      },
      {
        field: 'name',
        title: 'Event',
        className: classes.overflowEllipsis,
        filterable: false,
        cell: GenericGridCell,
      },
      {
        field: 'date',
        title: hideHeaders ? ' ' : 'Date',
        cell: StartDateCell,
        className: classes.overflowEllipsis,
        minShow: 400,
        width: 130,
        filterCell: DateRangeFilterCell,
      },
      {
        field: 'time',
        title: hideHeaders ? ' ' : 'Time',
        cell: StartTimeCell,
        className: classes.overflowEllipsis,
        minShow: 1170,
        width: 160,
      },
      {
        field: 'floorPlanNames',
        title: hideHeaders ? ' ' : 'Floorplans',
        className: classes.overflowEllipsis,
        minShow: 1150,
        cell: GenericGridCell,
      },
      {
        field: 'status',
        title: hideHeaders ? ' ' : 'Status',
        cell: StatusCell,
        className: classes.overflowEllipsis,
        minShow: 570,
        width: 160,
        filterCell: StatusFilterCell,
      },
    ];

    if (!props.hideClient) {
      const clientCol: Column = {
        field: 'clientName',
        title: hideHeaders ? ' ' : 'Client',
        className: classes.overflowEllipsis,
        minShow: 750,
        filterable: false,
        cell: GenericGridCell,
      };
      return [base[0], clientCol, ...base.slice(1)];
    }

    return base;
  }, [classes.overflowEllipsis, hideHeaders, props.hideClient]);

  const initialSort: SortDescriptor[] = [{ field: 'date', dir: 'desc' }];
  const [sort, setSort] = useState<SortDescriptor[]>(initialSort);

  const [visibleColumns, setVisibleColumns] = useState<Column[]>(columns);
  const visibleColumnsRef = useRef<Column[]>(columns);

  useEffect(() => {
    setVisibleColumns(columns);
    visibleColumnsRef.current = columns;
  }, [columns]);

  const updateVisibleColumns = useCallback(() => {
    const el = gridElementRef.current as any;
    const width = el?.offsetWidth ?? 0;
    if (!width) return;

    const currentVisible =
      columns.filter((c) => !c.minShow || c.minShow <= width) ?? columns;

    const nextKey = currentVisible.map((c) => c.field).join('|');
    const prevKey = (visibleColumnsRef.current || [])
      .map((c) => c.field)
      .join('|');

    if (nextKey !== prevKey) {
      visibleColumnsRef.current = currentVisible;
      setVisibleColumns(currentVisible);
    }
  }, [columns]);

  useEffect(() => {
    const el = gridElementRef.current;

    if (!el) {
      return () => {};
    }

    updateVisibleColumns();
    const ro = new ResizeObserver(() => updateVisibleColumns());
    ro.observe(gridElementRef.current);

    return () => ro.disconnect();
  }, [updateVisibleColumns]);

  const filterMap = useSelector(
    (state: ReduxState) => state.settings.sceneFilters ?? {}
  );

  const { scenes, loading = false } = props;

  const hydratedScenes = useMemo(() => {
    return scenes
      .map((scene) => {
        const client = getClientById(clients, scene.clientId);
        const place = places.find((p) => p.id === scene.placeId);

        const floorPlanNames = [
          ...new Set(
            scene?.floorPlans?.map((fp: { id: string; name: string }) => fp.name)
          ),
        ];

        const timeParams: Intl.DateTimeFormatOptions = {
          hour: 'numeric',
          minute: 'numeric',
          hour12: !twentyFourHourTime,
        };

        const time = new Date(scene.startUtcDateTime).toLocaleString(
          'en-US',
          timeParams
        );

        const date = scene.startUtcDateTime;

        return {
          ...scene,
          time,
          date,
          clientName: client ? client.name : '',
          placeName: place ? place.name : '',
          floorPlanNames: floorPlanNames ? floorPlanNames.join() : '',
        };
      })
      .filter((s) =>
        s.name.toLowerCase().includes(globalFilter?.toLowerCase() || '')
      );
  }, [scenes, clients, places, twentyFourHourTime, globalFilter]);

  const initialFilter: CompositeFilterDescriptor = {
    logic: 'and',
    filters: [],
  };

  const [filter, setFilter] = useState<CompositeFilterDescriptor>(initialFilter);

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const pageSizeOptions = [10, 25, 50, 100];

  const processedData = useMemo(() => {
    return filterBy(
      customOrderBy(hydratedScenes.map((scene) => ({ ...scene })), sort),
      filter
    );
  }, [hydratedScenes, sort, filter]);

  const total = processedData.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    const lastPageIndex = pageCount - 1;
    if (page > lastPageIndex) {
      const newPage = lastPageIndex < 0 ? 0 : lastPageIndex;
      setPage(newPage);
      props.onPageChange?.(newPage + 1, pageSize);
    }
  }, [page, pageCount, pageSize, props]);

  const currentPage = Math.min(page, pageCount - 1);
  const skip = currentPage * pageSize;

  const pagedData = processedData.slice(skip, skip + pageSize);

  const changePage = (newPage: number) => {
    setPage(newPage);
    props.onPageChange?.(newPage + 1, pageSize);
  };

  const handlePageChange = (e: GridPageChangeEvent) => {
    const newTake = e.page.take;
    const newSkip = e.page.skip;
    const newPage = Math.floor(newSkip / newTake);

    setPageSize(newTake);
    changePage(newPage);
  };

  const excelExportRef = useRef<ExcelExport | null>(null);
  const pdfExportRef = useRef<GridPDFExport | null>(null);

  const exportExcel = () => {
    excelExportRef.current?.save();
  };

  const exportPDF = () => {
    pdfExportRef.current?.save();
  };

  const kGrid = (forPrint?: boolean) => {
    const data = forPrint ? processedData : pagedData;

    const pagingProps = forPrint
      ? {}
      : {
          total,
          skip,
          take: pageSize,
          onPageChange: handlePageChange,
          pageable: { buttonCount: 5, pageSizes: pageSizeOptions },
        };

    return (
      <KendoTooltip
        anchorElement="target"
        position="left"
        style={{ fontSize: '12px' }}
      >
        <Grid
          style={{ height: props.height, border: '2px solid #8b49a1ff' }}
          sortable
          filterable={props.showFilters}
          filter={filter}
          onFilterChange={(e: GridFilterChangeEvent) => {
            setFilter(e.filter);
            changePage(0);
          }}
          sort={sort}
          onSortChange={(e) => {
            setSort(e.sort);
            changePage(0);
          }}
          className={classes.gridRoot}
          data={data}
          onRowClick={(e) => {
            dispatch(SelectScene(e.dataItem.id));
            navigate(sceneRoutes.edit.path.replace(':id', e.dataItem.id));
          }}
          {...(pagingProps as any)}
        >
          {props?.isFromDashboard && (
            <GridToolbar className={classes.tableTitle}>
              <Box
                component="h2"
                style={{
                  color:
                    theme.palette.mode === 'dark'
                      ? theme.palette.text.primary
                      : theme.palette.primary.main,
                  margin: '0px',
                }}
              >
                Events
              </Box>
            </GridToolbar>
          )}

          {scenes.length === 0 && Object.keys(filterMap).length === 0 ? (
            <GridNoRecords>
              <ModalConsumer>
                {({ showModal, props: modalProps }) => (
                  <PlacezActionButton
                    onClick={() => {
                      showModal(SceneModal, { ...modalProps });
                    }}
                  >
                    Create Event
                  </PlacezActionButton>
                )}
              </ModalConsumer>
            </GridNoRecords>
          ) : (
            <GridNoRecords>
              <PlacezActionButton
                onClick={() => {
                  localStorage.removeItem('sceneFilters');
                  dispatch(SetSceneFilters({}));
                  changePage(0);
                }}
              >
                Clear Filters
              </PlacezActionButton>
            </GridNoRecords>
          )}

          {visibleColumns.map((column, index) => (
            <GridColumn
              key={index}
              field={column.field}
              title={column.title}
              cell={column?.cell}
              className={column.className}
              width={column.width}
              filterable={column.filterable}
              filterCell={column.filterCell}
            />
          ))}
        </Grid>
      </KendoTooltip>
    );
  };

  if (loading) {
    return (
      <LoadingSkeleton
        classes={classes}
        height={props.height}
        hideClient={props.hideClient}
        hideHeaders={props.hideHeaders}
        isFromDashboard={props.isFromDashboard}
      />
    );
  }

  return (
    <div>
      <div ref={gridElementRef} style={{ position: 'relative' }}>
        <GridPDFExport ref={pdfExportRef}>{kGrid(true)}</GridPDFExport>

        <ExcelExport data={processedData} ref={excelExportRef}>
          {kGrid()}
          <div
            style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              zIndex: 980,
            }}
          >
            <Tooltip title="Download Excel">
              <IconButton color="secondary" onClick={exportExcel}>
                <CloudDownload />
              </IconButton>
            </Tooltip>
            <Tooltip title="Download PDF">
              <IconButton color="secondary" onClick={exportPDF}>
                <DownloadPDFIcon />
              </IconButton>
            </Tooltip>
          </div>
        </ExcelExport>
      </div>
    </div>
  );
};

export default SceneTable;
