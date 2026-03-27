import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Paper, Tooltip, Skeleton, Box } from '@mui/material';
import { Theme } from '@mui/material/styles';
import { createStyles, makeStyles } from '@mui/styles';

// Components
import {
  Grid,
  GridColumn,
  GridNoRecords,
  GridPageChangeEvent,
} from '@progress/kendo-react-grid';
import { orderBy, SortDescriptor } from '@progress/kendo-data-query';
import { Tooltip as KendoTooltip } from '@progress/kendo-react-tooltip';

// App
import { Place } from '../../api';
import { placeRoutes } from '../../routes';
import { tableStyles } from './tableSyles.css';
import { useSelector } from 'react-redux';
import { ReduxState } from '../../reducers';
import { useNavigate } from 'react-router';
import { GenericGridCell } from './SceneTable';
import { ModalConsumer } from '../Modals/ModalContext';
import PlacezActionButton from '../PlacezUIComponents/PlacezActionButton';
import PlaceModal from '../Modals/PlaceModal';
import AddressCell from './Cells/AddressCell';

interface Props {
  places: Place[];
  height?: string;
  isLoading?: boolean;
}

export const GRID_SCROLLBAR_CLASS = 'clientGridScrollbar';

const useStyles = makeStyles<Theme>((theme: Theme) =>
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
        .${GRID_SCROLLBAR_CLASS} .k-grid-content-locked::-webkit-scrollbar-thumb`]:
        {
          backgroundColor: '#5C236F',
          borderRadius: '999px',
        },

      [`.${GRID_SCROLLBAR_CLASS} .k-grid-content::-webkit-scrollbar-track,
        .${GRID_SCROLLBAR_CLASS} .k-virtual-content::-webkit-scrollbar-track,
        .${GRID_SCROLLBAR_CLASS} .k-grid-content-locked::-webkit-scrollbar-track`]:
        {
          backgroundColor: 'transparent',
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
    },
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
};

const PlaceTable = (props: Props) => {
  const classes = useStyles();

  useKendoPagerPopupFix();

  const navigate = useNavigate();

  const selectedId = useSelector((state: ReduxState) => state.place.selectedId);

  const gridElRef = useRef<HTMLElement | null>(null);
  const visibleColumnsRef = useRef<Column[]>([]);

  const columns = useMemo<Column[]>(
    () => [
      { field: 'id', title: 'Venue ID', className: classes.overflowEllipsis },
      {
        field: 'name',
        title: 'Venue',
        className: classes.overflowEllipsis,
        cell: GenericGridCell,
      },
      {
        field: 'contact',
        title: 'Primary Contact',
        className: classes.overflowEllipsis,
        minShow: 900,
        cell: GenericGridCell,
      },
      {
        field: 'capacity',
        title: 'Capacity',
        className: classes.overflowEllipsis,
        minShow: 900,
      },
      {
        field: 'address',
        title: 'Address',
        className: classes.overflowEllipsis,
        minShow: 500,
        width: 300,
        cell: AddressCell,
      },
      {
        field: 'type',
        title: 'Type',
        className: classes.overflowEllipsis,
        minShow: 900,
        cell: GenericGridCell,
      },
    ],
    [classes.overflowEllipsis]
  );

  const [visibleColumns, setVisibleColumns] = useState<Column[]>(columns);
  const [sort, setSort] = useState<SortDescriptor[]>([
    { field: 'lastModifiedDate', dir: 'desc' },
  ]);

  // Paging state
  const [skip, setSkip] = useState<number>(0);
  const [take, setTake] = useState<number>(25);

  const { places, isLoading = false, height } = props;

  // Keep ref in sync
  useEffect(() => {
    visibleColumnsRef.current = visibleColumns;
  }, [visibleColumns]);

  // When base columns change, reset visible columns
  useEffect(() => {
    setVisibleColumns(columns);
  }, [columns]);

  const checkColumnMaxWidth = useCallback(() => {
    const gridEl = gridElRef.current;
    if (!gridEl) return;

    const gridWidth = gridEl.offsetWidth;

    const currentVisibleColumns =
      columns.filter((c) => !c.minShow || c.minShow <= gridWidth) ?? columns;

    const nextKey = currentVisibleColumns.map((c) => c.field).join('|');
    const prevKey = (visibleColumnsRef.current || [])
      .map((c) => c.field)
      .join('|');

    if (nextKey !== prevKey) {
      setVisibleColumns(currentVisibleColumns);
    }
  }, [columns]);

  useEffect(() => {
    gridElRef.current = document.querySelector(
      `.${CSS.escape(classes.gridRoot)}`
    ) as HTMLElement | null;

    checkColumnMaxWidth();
    window.addEventListener('resize', checkColumnMaxWidth);

    return () => {
      window.removeEventListener('resize', checkColumnMaxWidth);
    };
  }, [classes.gridRoot, checkColumnMaxWidth]);

  const sortedPlaces = useMemo(
    () =>
      orderBy(
        (places || []).map((place) => ({
          ...place,
          selected: place.id === selectedId,
          lastModifiedDate: new Date(place.lastModifiedUtcDateTime).getTime(),
        })),
        sort
      ),
    [places, selectedId, sort]
  );

  // Reset paging when data changes
  useEffect(() => {
    setSkip(0);
  }, [sortedPlaces.length, take]);

  const total = sortedPlaces.length;

  const pageData = useMemo(
    () => sortedPlaces.slice(skip, skip + take),
    [sortedPlaces, skip, take]
  );

  const handlePageChange = (e: GridPageChangeEvent) => {
    setSkip(e.page.skip);
    setTake(e.page.take);
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
          data={pageData}
          total={total}
          skip={skip}
          take={take}
          onPageChange={handlePageChange}
          pageable={{ buttonCount: 5, pageSizes: [10, 25, 50, 100] }}
          onRowClick={(e) => {
            navigate(placeRoutes.edit.path.replace(':id', e.dataItem.id));
          }}
        >
          <GridNoRecords>
            <ModalConsumer>
              {({ showModal, props: modalProps }) => (
                <Tooltip title="Add Venue">
                  <PlacezActionButton
                    onClick={() => showModal(PlaceModal, { ...modalProps })}
                  >
                    Create Venue
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
              width={column.width}
              className={column.className}
              cell={column.cell}
            />
          ))}
        </Grid>
      </KendoTooltip>
    </Paper>
  );
};

export default PlaceTable;
