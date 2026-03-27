import { useEffect, useRef, useState } from 'react';
import { Paper, Theme } from '@mui/material';
// Components
import { Grid, GridColumn } from '@progress/kendo-react-grid';
import { orderBy } from '@progress/kendo-data-query';
import { tableStyles } from './tableSyles.css';
import { useSelector } from 'react-redux';
import { ReduxState } from '../../reducers';
import { makeStyles } from '@mui/styles';
import { PlacezLayoutPlan } from '../../api';
import { StartDateCell, StartTimeCell } from './SceneTable';
import DateRangeFilterCell from './Cells/DateRangeFilterCell';

interface Props {
  onSelect?: (template: PlacezLayoutPlan) => void;
  selected?: PlacezLayoutPlan;
  height?: string;
}

const TemplateTable = (props: Props) => {
  const styles = makeStyles<Theme>(tableStyles);
  const classes = styles(props);
  const templates = useSelector((state: ReduxState) => state.layouts.templates);
  const { selected } = props;

  const grid = useRef();

  const columns = [
    { field: 'name', title: 'Subevent', className: classes.overflowEllipsis },
    {
      field: 'date',
      title: 'Date',
      cell: StartDateCell,
      className: classes.overflowEllipsis,
      minShow: 400,
      width: 130,
      filterCell: DateRangeFilterCell,
    },
    {
      field: 'time',
      title: 'Time',
      cell: StartTimeCell,
      className: classes.overflowEllipsis,
      minShow: 1170,
      width: 160,
    },
    {
      field: 'placeName',
      title: 'Place',
      className: classes.overflowEllipsis,
      minShow: 1050,
      width: 200,
      filterable: true,
    },
    {
      field: 'floorPlanNames',
      title: 'Floorplans',
      className: classes.overflowEllipsis,
      minShow: 1150,
    },
  ];

  const [visibleColumns, setVisibleColumns] = useState(columns);
  const [sort, setSort] = useState([]);

  useEffect(() => {
    setSort([{ field: 'lastModifiedDate', dir: 'desc' }]);
    grid.current = document.querySelector(`.${CSS.escape(classes.gridRoot)}`);
    // window.addEventListener('resize', checkColumnMaxWidth);
    checkColumnMaxWidth();
    return () => {
      window.removeEventListener('resize', checkColumnMaxWidth);
    };
  }, []);

  const checkColumnMaxWidth = () => {
    if (grid.current) {
      const currentVisibleColumns =
        columns?.filter(
          (item) =>
            !item.minShow || item.minShow <= (grid?.current as any)?.offsetWidth
        ) ?? columns;
      if (currentVisibleColumns.length !== visibleColumns.length) {
        setVisibleColumns(currentVisibleColumns);
      }
    }
  };

  return (
    <Paper>
      <Grid
        style={{ height: props.height }}
        sortable
        sort={sort}
        onSortChange={(e) => {
          setSort(e.sort);
        }}
        className={classes.gridRoot}
        selectedField="selected"
        data={orderBy(
          templates.map((layout) => ({
            ...layout,
            selected: layout.id === selected?.id,
            // lastModifiedDate: new Date(layout?.lastModifiedUtcDateTime).getTime(),
            // address: (place?.line1 || place?.line2 || place?.city || place?.state || place?.postalCode) ? `${place?.line1}, ${place?.city ?? ''}, ${place?.state ?? ''} ${place?.postalCode ?? ''}` : '',
          })),
          sort
        )}
        onRowClick={(e) => {
          props.onSelect?.(e.dataItem);
          // navigate(placeRoutes.edit.path.replace(':id', e.dataItem.id))
          // dispatch(SelectPlace(e.dataItem.id))
        }}
      >
        {visibleColumns.map((column, index) => {
          return (
            <GridColumn
              field={column.field}
              title={column.title}
              key={index}
              className={column.className}
            />
          );
        })}
      </Grid>
    </Paper>
  );
};

export default TemplateTable;
